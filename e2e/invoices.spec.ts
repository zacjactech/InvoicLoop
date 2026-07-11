import { test, expect } from "@playwright/test";

test.describe("Invoices", () => {
  test("invoices page loads correctly", async ({ page }) => {
    await page.goto("/dashboard/invoices");
    await expect(page.getByRole("heading", { name: "Invoices Directory" })).toBeVisible();
  });

  test("create a customer first, then create an invoice", async ({ page }) => {
    // Create a customer
    await page.goto("/dashboard/customers");
    await page.click('button:has-text("Add Client")');
    await page.fill('input:below(:text("Name"))', "Acme Corp");
    await page.fill('input[type="email"]:below(:text("Email"))', "acme@example.com");
    await page.click('button:has-text("Create")');
    await expect(page.locator("text=Acme Corp").first()).toBeVisible({ timeout: 10000 });

    // Create an invoice
    await page.goto("/dashboard/invoices/new");
    await expect(page.getByRole("heading", { name: "Split-Screen Creator" })).toBeVisible();

    // Wait for customers to load in the select
    await page.waitForFunction(() => {
      const select = document.querySelector("select");
      return select && select.options.length > 1;
    }, { timeout: 10000 });

    // Select customer by index
    await page.selectOption("select", { index: 1 });

    // Fill line item
    await page.fill('input[placeholder="Description"]', "Web Development Services");
    await page.fill('input[type="number"]:nth-of-type(1)', "2");
    await page.fill('input[type="number"]:nth-of-type(2)', "1500");

    // Submit
    await page.click('button:has-text("Publish")');
    await page.waitForURL(/\/dashboard\/invoices\//, { timeout: 10000 });
    await expect(page.locator("text=Web Development Services")).toBeVisible();
  });

  test("responsive: page renders on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard/invoices");
    await expect(page.getByRole("heading", { name: "Invoices Directory" })).toBeVisible();
  });
});
