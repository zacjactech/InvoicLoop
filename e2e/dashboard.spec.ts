import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("shows financial summary cards", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Financial Summary" })).toBeVisible();
    await expect(page.locator("text=Monthly Revenue")).toBeVisible();
    await expect(page.locator("text=Overdue Balance")).toBeVisible();
    await expect(page.locator("text=Settlement Rate")).toBeVisible();
  });

  test("sidebar navigation works", async ({ page }) => {
    await page.goto("/dashboard");

    // Navigate to Invoices
    await page.click('a[href="/dashboard/invoices"]');
    await expect(page.getByRole("heading", { name: "Invoices Directory" })).toBeVisible();

    // Navigate to Customers
    await page.click('a[href="/dashboard/customers"]');
    await expect(page.getByRole("heading", { name: "Customers Ledger" })).toBeVisible();

    // Navigate back to Dashboard
    await page.click('a[href="/dashboard"]');
    await expect(page.getByRole("heading", { name: "Financial Summary" })).toBeVisible();
  });

  test("404 page works for authenticated user", async ({ page }) => {
    await page.goto("/dashboard/nonexistent-page");
    await expect(page.locator("h1")).toContainText("404");
    await expect(page.locator("text=Page not found")).toBeVisible();
    await expect(page.locator('a[href="/dashboard"]')).toBeVisible();
  });
});
