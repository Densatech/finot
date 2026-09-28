import { PASSWORD, USERS, expect, login, logout, test } from "./fixtures";

async function fillRegistration(page: import("@playwright/test").Page, email: string, first = "New") {
  await page.goto("/register");
  await page.getByLabel("First name").fill(first);
  await page.getByLabel("Middle name").fill("E2E");
  await page.getByLabel("Last name").fill("Member");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Gender").selectOption("F");
  await page.getByLabel(/^Password/).fill(PASSWORD);
  await page.getByLabel("Confirm password").fill(PASSWORD);
  await page.getByRole("button", { name: /create account/i }).click();
}

test("register → onboarding → complete profile → banner disappears", async ({ page }) => {
  await fillRegistration(page, "New.Member@Finot.test");
  await page.waitForURL("**/dashboard/profile/edit");

  await page.getByLabel("Batch year").selectOption("2");
  await page.getByLabel("Department").fill("Software Engineering");
  await page.getByLabel("Phone").first().fill("0912 345 678");
  await page.getByLabel("Name").fill("Almaz");
  await page.getByLabel("Phone").nth(1).fill("0911223344");
  await page.getByRole("button", { name: /save changes/i }).click();

  await page.waitForURL("**/dashboard/profile");
  await expect(page.getByText("0912345678")).toBeVisible();
  await page.goto("/dashboard");
  await expect(page.getByText(/complete your profile/i)).toHaveCount(0);
});

test("invalid phone shows the backend's field error", async ({ page }) => {
  await login(page, "new.member@finot.test");
  await page.goto("/dashboard/profile/edit");
  await page.getByLabel("Phone").first().fill("12345");
  await page.getByRole("button", { name: /save changes/i }).click();
  await expect(page.getByText(/valid Ethiopian phone/i)).toBeVisible();
});

test("duplicate email with different case is rejected on the field", async ({ page }) => {
  await fillRegistration(page, "NEW.MEMBER@finot.test", "Dup");
  await expect(page.getByText(/already exists/i)).toBeVisible();
});

test("wrong password shows a friendly error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(USERS.student);
  await page.getByLabel(/^Password/).fill("wrong-password");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page.getByRole("alert")).toContainText(/incorrect|invalid|credentials|no active account/i);
});

test("protected route redirects to login and back after signing in", async ({ page }) => {
  await page.goto("/dashboard/family");
  await page.waitForURL("**/login");
  await page.getByLabel("Email address").fill("STUDENT@finot.test");
  await page.getByLabel(/^Password/).fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/dashboard/family");
  await expect(page.getByText("Abba Gebre")).toBeVisible();
});

test("logout revokes the session", async ({ page }) => {
  await login(page, USERS.student);
  const refresh = await page.evaluate(() => localStorage.getItem("refresh_token"));
  await logout(page);
  await page.goto("/dashboard");
  await page.waitForURL("**/login");
  const res = await page.request.post("http://127.0.0.1:8001/auth/jwt/refresh/", { data: { refresh } });
  expect(res.status()).toBe(401);
});

test("student cannot open admin pages", async ({ page }) => {
  await login(page, USERS.student);
  await page.goto("/dashboard/counselor/approve");
  await expect(page).toHaveURL(/\/dashboard$/);
});
