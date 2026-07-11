import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    // Clear auth state to test unauthenticated redirect
    await page.context().clearCookies();
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("InvoiceLoop");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText("Sign In");
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "nonexistent@example.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Invalid email or password")).toBeVisible();
  });

  test("signup page renders correctly", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator("h1")).toContainText("InvoiceLoop");
    await expect(page.locator('input[id="name"]')).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
  });

  test("full signup and login flow", async ({ page }) => {
    const email = `flow-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
    const password = "testpassword123";

    // Sign up
    await page.goto("/signup");
    await page.fill('input[id="name"]', "Flow User");
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Logout
    await page.click('button[title="Sign Out"]');
    await page.waitForURL(/\/login/, { timeout: 10000 });

    // Login
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
  });
});
