import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../.auth/user.json");

setup("authenticate", async ({ page }) => {
  const email = `setup-${Date.now()}@example.com`;

  await page.goto("/signup");
  await page.fill('input[id="name"]', "Test User");
  await page.fill('input[id="email"]', email);
  await page.fill('input[id="password"]', "password123");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });

  await page.context().storageState({ path: authFile });
});
