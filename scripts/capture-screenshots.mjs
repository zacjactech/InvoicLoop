/**
 * Captures full-page screenshots of the running dev server at the surfaces we
 * want to feature in the README. Uses Chrome's DevTools Protocol directly so
 * we don't need a separate driver.
 *
 * Usage:
 *   1. Make sure the dev server is up at http://localhost:3000
 *      (`pnpm dev` in another terminal)
 *   2. `node scripts/capture-screenshots.mjs`
 *
 * Notes:
 *   - Uses an existing or freshly-created account. The first signup after
 *     a fresh database becomes ADMIN.
 *   - Outputs PNGs to docs/screenshots/
 */
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import http from "node:http";
import { stdout as output } from "node:process";
import WS from "ws";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT_DIR = path.join(ROOT, "docs", "screenshots");
const BASE = "http://localhost:3000";
const CDP_PORT = 9333;

const EMAIL = `screenshot+${Date.now()}@example.com`;
const PASSWORD = "Screenshot-Pass-1";

function log(...args) {
  output.write(`[capture] ${args.join(" ")}\n`);
}

async function waitForServer() {
  const start = Date.now();
  while (Date.now() - start < 60_000) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`${BASE}/login`, (res) => {
          res.resume();
          resolve();
        });
        req.on("error", reject);
        req.setTimeout(2000, () => req.destroy(new Error("timeout")));
      });
      return;
    } catch {
      await sleep(500);
    }
  }
  throw new Error("dev server did not come up in 60s");
}

async function waitForCdp() {
  const start = Date.now();
  while (Date.now() - start < 30_000) {
    try {
      const json = await new Promise((resolve, reject) => {
        http
          .get(`http://127.0.0.1:${CDP_PORT}/json/version`, (res) => {
            let data = "";
            res.on("data", (c) => (data += c));
            res.on("end", () => {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                reject(e);
              }
            });
          })
          .on("error", reject);
      });
      return json;
    } catch {
      await sleep(300);
    }
  }
  throw new Error("Chrome did not expose CDP within 30s");
}

function connect(wsUrl) {
  const ws = new WS(wsUrl, {
    perMessageDeflate: false,
    maxPayload: 256 * 1024 * 1024,
  });
  let nextId = 1;
  const pending = new Map();

  return new Promise((resolve, reject) => {
    ws.once("open", () => {
      ws.on("message", (raw) => {
        const msg = JSON.parse(raw.toString());
        if (msg.id && pending.has(msg.id)) {
          const { resolve, reject } = pending.get(msg.id);
          pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      });
      function send(method, params = {}) {
        const id = nextId++;
        return new Promise((res, rej) => {
          pending.set(id, { resolve: res, reject: rej });
          ws.send(JSON.stringify({ id, method, params, sessionId: this?._sid }));
        });
      }
      resolve({
        send,
        async attach(targetId) {
          const { sessionId } = await send.call({ _sid: undefined }, "Target.attachToTarget", {
            targetId,
            flatten: true,
          });
          const pageSend = (method, params = {}) =>
            new Promise((res, rej) => {
              const id = nextId++;
              pending.set(id, { resolve: res, reject: rej });
              ws.send(JSON.stringify({ id, method, params, sessionId }));
            });
          return { send: pageSend };
        },
      });
    });
    ws.once("error", reject);
  });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  log("waiting for dev server...");
  await waitForServer();
  log("server is up");

  log("launching headless Chrome with CDP on port " + CDP_PORT);
  const chrome = spawn(
    "google-chrome",
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      `--remote-debugging-port=${CDP_PORT}`,
      "--remote-debugging-address=127.0.0.1",
      "--user-data-dir=/tmp/chrome-cdp",
      "--window-size=1440,900",
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "ignore"] }
  );

  try {
    const version = await waitForCdp();
    const client = await connect(version.webSocketDebuggerUrl);

    const { targetId } = await client.send("Target.createTarget", {
      url: "about:blank",
    });
    const page = await client.attach(targetId);
    await page.send("Page.enable");
    await page.send("Runtime.enable");
    await page.send("Network.enable");
    await page.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1.5,
      mobile: false,
    });

    async function goto(url) {
      log("→", url);
      await page.send("Page.navigate", { url });
      await sleep(900);
    }

    async function shoot(name) {
      const file = path.join(OUT_DIR, `${name}.png`);
      const { data } = await page.send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: true,
      });
      await writeFile(file, Buffer.from(data, "base64"));
      log("  ✓", path.relative(ROOT, file));
    }

    async function evalInPage(expr, awaitPromise = false) {
      return page.send("Runtime.evaluate", {
        expression: expr,
        returnByValue: true,
        awaitPromise,
      });
    }

    // First navigate to the app origin so fetch() URLs resolve.
    await goto(`${BASE}/login`);
    await sleep(800);

    // Seed via API: signup (handle existing user), then create customers + invoices.
    log("seeding data via API...");
    const seed = await evalInPage(
      `(async()=>{
        // Try signup; if user exists (409), log in with same credentials.
        const signupRes = await fetch('/api/auth/signup',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'Screenshot User',email:${JSON.stringify(EMAIL)},password:${JSON.stringify(PASSWORD)}})});
        if (signupRes.status === 409) {
          await fetch('/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:${JSON.stringify(EMAIL)},password:${JSON.stringify(PASSWORD)}})});
        }
        const c1 = await fetch('/api/customers',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'Acme Studios',email:'billing@acme.test',company:'Acme Studios Inc.',phone:'+1 555 0123',address:'500 Market St\\nSan Francisco, CA'})}).then(r=>r.json());
        const c2 = await fetch('/api/customers',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'Globex Corp',email:'ap@globex.test',company:'Globex Corp'})}).then(r=>r.json());
        const c3 = await fetch('/api/customers',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'Initech',email:'accounts@initech.test',company:'Initech LLC'})}).then(r=>r.json());
        const cur = new Date();
        const due = new Date(cur.getTime()+1000*60*60*24*14);
        const curStr = cur.toISOString().slice(0,10);
        const dueStr = due.toISOString().slice(0,10);
        const year = cur.getFullYear();
        const build = async (suffix, customerId, items, status) => {
          const inv = await fetch('/api/invoices',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
            invoiceNumber:'INV-'+year+'-'+suffix,
            customerId,
            issuedDate:curStr,
            dueDate:dueStr,
            taxRate:8.5,
            discount:0,
            currency:'USD',
            notes:'Thank you for your business!',
            items
          })}).then(r=>r.json());
          if (status !== 'DRAFT') {
            await fetch('/api/invoices/'+inv.id,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({status})});
          }
          return inv;
        };
        const i1 = await build('0042', c1.id, [{description:'Design retainer — October',quantity:1,unitPrice:4500},{description:'Additional illustrations (3 hrs)',quantity:3,unitPrice:120}], 'SENT');
        const i2 = await build('0041', c2.id, [{description:'Q3 consulting',quantity:12,unitPrice:175}], 'PAID');
        await build('0040', c3.id, [{description:'Annual support',quantity:1,unitPrice:2400}], 'OVERDUE');
        const share = await fetch('/api/invoices/'+i1.id+'/share',{method:'POST'}).then(r=>r.json());
        return { invoiceId: i1.id, shareUrl: share.shareUrl };
      })();`,
      true
    );
    const seedValue = seed.result?.value ?? {};
    log(
      "seeded:",
      JSON.stringify(seedValue).slice(0, 200),
      "signup status:",
      seedValue.signupStatus
    );

    // Capture surfaces.
    await goto(`${BASE}/login`);
    await sleep(400);
    await shoot("01-login");

    await goto(`${BASE}/dashboard`);
    await sleep(700);
    await shoot("02-dashboard");

    await goto(`${BASE}/dashboard/invoices`);
    await sleep(700);
    await shoot("03-invoices-list");

    if (seedValue.invoiceId) {
      await goto(`${BASE}/dashboard/invoices/${seedValue.invoiceId}`);
      await sleep(900);
      await shoot("04-invoice-detail");
    }

    await goto(`${BASE}/dashboard/customers`);
    await sleep(700);
    await shoot("05-customers");

    await goto(`${BASE}/dashboard/activity`);
    await sleep(700);
    await shoot("06-activity");

    if (seedValue.shareUrl) {
      await goto(seedValue.shareUrl);
      await sleep(2000);
      await shoot("07-public-portal");
    }

    log("done");
  } finally {
    chrome.kill("SIGTERM");
    await sleep(300);
    chrome.kill("SIGKILL");
  }
}

main().catch((err) => {
  output.write(`[capture] FATAL: ${err.stack || err.message}\n`);
  process.exit(1);
});
