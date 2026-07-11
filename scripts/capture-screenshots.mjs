/**
 * Two-phase screenshot capture:
 *   Phase 1 (Node.js only): queries existing DB for a valid invoice + share token.
 *   Phase 2 (Chrome CDP):   opens the app and captures each surface.
 *
 * Usage:
 *   1. Make sure the dev server is up at http://localhost:3000
 *   2. `node scripts/capture-screenshots.mjs`
 */
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { setTimeout as sleep } from "node:timers/promises";
import { stdout as output } from "node:process";
import WS from "ws";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT_DIR = path.join(ROOT, "docs", "screenshots");
const BASE = "http://localhost:3000";
const CDP_PORT = 9334; // use a different port to avoid collision with a running Chrome

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
              try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
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

function cdpClient(wsUrl) {
  const ws = new WS(wsUrl, {
    perMessageDeflate: false,
    maxPayload: 256 * 1024 * 1024,
  });
  let nextId = 1;
  const pending = new Map();

  const send = (method, params = {}, sessionId) =>
    new Promise((res, rej) => {
      const id = nextId++;
      pending.set(id, { resolve: res, reject: rej });
      ws.send(JSON.stringify({ id, method, params, sessionId }));
    });

  ws.on("message", (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
  });

  return new Promise((resolve, reject) => {
    ws.once("open", () => resolve({ ws, send }));
    ws.once("error", reject);
  });
}

// ── Phase 1: get (invoiceId, shareUrl) from the existing DB directly ──────────
async function seedData() {
  log("querying existing DB for invoice data...");
  const { randomBytes, createHash } = await import("node:crypto");
  const { default: Database } = await import("better-sqlite3");
  const { nanoid } = await import("nanoid");
  const dbPath = path.join(ROOT, "dev.db");
  const db = new Database(dbPath);

  const user = db.prepare("SELECT id FROM User LIMIT 1").get();
  if (!user) { db.close(); throw new Error("No user in DB — run the app and sign up first"); }

  let inv = db.prepare(
    "SELECT id, invoiceNumber FROM Invoice WHERE deletedAt IS NULL AND publicTokenHash IS NOT NULL LIMIT 1"
  ).get();

  let invoiceId, shareToken;
  if (inv) {
    shareToken = randomBytes(32).toString("base64url");
    const hash = createHash("sha256").update(shareToken).digest("hex");
    db.prepare("UPDATE Invoice SET publicTokenHash = ? WHERE id = ?").run(hash, inv.id);
    invoiceId = inv.id;
    log(`  using existing invoice ${inv.invoiceNumber} (id=${invoiceId})`);
  } else {
    invoiceId = nanoid();
    shareToken = randomBytes(32).toString("base64url");
    const hash = createHash("sha256").update(shareToken).digest("hex");
    const cur = new Date();
    const due = new Date(cur.getTime() + 14 * 86400000);
    db.prepare(`
      INSERT INTO Invoice (id, invoiceNumber, customerId, userId, status, total, balancePaid,
        taxRate, discount, currency, issuedDate, dueDate, notes, publicTokenHash, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, 'SENT', 5000, 0, 8.5, 0, 'USD', ?, ?, NULL, ?, ?, ?)
    `).run(invoiceId, `INV-${cur.getFullYear()}-SCR`, user.id, cur.toISOString(), due.toISOString(), hash, cur.toISOString(), cur.toISOString());
    log(`  created fresh invoice ${invoiceId}`);
  }
  db.close();

  const base = BASE.replace(/\/$/, "");
  const shareUrl = `${base}/invoice/public/${encodeURIComponent(invoiceId)}?token=${encodeURIComponent(shareToken)}`;
  log(`  shareUrl ready`);
  return { invoiceId, shareUrl };
}

// ── Phase 2: Chrome CDP screenshot capture ───────────────────────────────────
async function captureScreenshots(seed) {
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
      "--user-data-dir=/tmp/chrome-cdp-screenshots-v2",
      "--window-size=1440,900",
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "ignore"] }
  );

  try {
    const version = await waitForCdp();
    const { send } = await cdpClient(version.webSocketDebuggerUrl);

    const { targetId } = await send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
    const page = (method, params = {}) => send(method, params, sessionId);

    await page("Page.enable");
    await page("Runtime.enable");
    await page("Network.enable");
    await page("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1.5,
      mobile: false,
    });

    async function goto(url) {
      log("→", url.replace(BASE, ""));
      await page("Page.navigate", { url });
      await page("Page.loadEventFired").catch(() => null);
      await sleep(900);
    }

    async function shoot(name) {
      const file = path.join(OUT_DIR, `${name}.png`);
      const { data } = await page("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: true,
      });
      await writeFile(file, Buffer.from(data, "base64"));
      log("  ✓", path.relative(ROOT, file));
    }

    await goto(`${BASE}/login`);
    await sleep(500);
    await shoot("01-login");

    await goto(`${BASE}/dashboard`);
    await sleep(900);
    await shoot("02-dashboard");

    await goto(`${BASE}/dashboard/invoices`);
    await sleep(900);
    await shoot("03-invoices-list");

    if (seed.invoiceId) {
      await goto(`${BASE}/dashboard/invoices/${seed.invoiceId}`);
      await sleep(900);
      await shoot("04-invoice-detail");
    }

    await goto(`${BASE}/dashboard/customers`);
    await sleep(700);
    await shoot("05-customers");

    await goto(`${BASE}/dashboard/activity`);
    await sleep(700);
    await shoot("06-activity");

    if (seed.shareUrl) {
      await goto(seed.shareUrl);
      await sleep(2500);
      await shoot("07-public-portal");
    }
  } finally {
    chrome.kill("SIGTERM");
    await sleep(300);
    chrome.kill("SIGKILL");
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  log("waiting for dev server...");
  await waitForServer();
  log("server is up");

  const seed = await seedData();
  if (!seed.invoiceId) throw new Error("Seed produced no invoice ID");
  await captureScreenshots(seed);

  log("done — screenshots are in docs/screenshots/");
}

main().catch((err) => {
  output.write(`[capture] FATAL: ${err.stack || err.message}\n`);
  process.exit(1);
});