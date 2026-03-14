import { test, expect } from "@playwright/test";

test("redirects unauthenticated users from protected enrollment route to login", async ({ page }) => {
  await page.goto("/enrollment");
  await expect(page).toHaveURL(/\/login/);
});

test("home page renders key SIS heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("NextGen Student Information System")).toBeVisible();
});
