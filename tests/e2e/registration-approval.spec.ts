import { test, expect } from "@playwright/test";

const adminEmail = process.env.E2E_SUPER_ADMIN_EMAIL;
const adminPassword = process.env.E2E_SUPER_ADMIN_PASSWORD;

test.describe("public registration + admin approval", () => {
  test.skip(!adminEmail || !adminPassword, "Missing E2E_SUPER_ADMIN_EMAIL or E2E_SUPER_ADMIN_PASSWORD");

  test("student submits registration and admin approves", async ({ page }) => {
    const timestamp = Date.now();
    const email = `student+${timestamp}@example.com`;

    await page.goto("/register");
    await page.getByLabel("First name").fill("Ava");
    await page.getByLabel("Last name").fill("Student");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Phone").fill("5551234567");
    await page.getByLabel("Grade level").fill("5");

    await page.getByLabel("Upload documents").setInputFiles("public/landing_page.jpg");
    await page.getByRole("button", { name: "Submit request" }).click();

    await expect(page).toHaveURL(/\/register\/status\?email=/);
    await expect(page.getByText("Registration status")).toBeVisible();
    await expect(page.getByText("pending", { exact: false })).toBeVisible();

    await page.goto("/login");
    await page.getByLabel("Email").fill(adminEmail);
    await page.getByLabel("Password").fill(adminPassword);
    await page.getByLabel("Login as role").selectOption("super_admin");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByText("Pending registrations")).toBeVisible();

    const requestCard = page.locator("div.rounded-xl.border.bg-slate-50").first();
    await requestCard.getByLabel("Assign school").selectOption({ index: 1 });
    await requestCard.getByLabel("Assign grade").fill("5");
    await requestCard.getByRole("button", { name: "Approve" }).click();

    await expect(page.getByText("Request approved.")).toBeVisible();

    await page.goto(`/register/status?email=${encodeURIComponent(email)}`);
    await expect(page.getByText("approved", { exact: false })).toBeVisible();
  });
});
