import { USERS, expect, login, test } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await login(page, USERS.student);
});

test("overview shows events, family and stats", async ({ page }) => {
  await expect(page.getByText("Timket Celebration").first()).toBeVisible();
  await expect(page.getByText("Kidus Giorgis")).toBeVisible();
  await expect(page.getByText("Upcoming events").first()).toBeVisible();
});

test("events page shows global and group events", async ({ page }) => {
  await page.goto("/dashboard/events");
  await expect(page.getByText("Choir Practice")).toBeVisible();
  await expect(page.getByText("Timket Celebration")).toBeVisible();
});

test("family page shows mentors", async ({ page }) => {
  await page.goto("/dashboard/family");
  await expect(page.getByText("Dawit Tester").first()).toBeVisible();
  await expect(page.getByText("Hanna Tester").first()).toBeVisible();
});

test("ministry preferences submit and can be replaced while open", async ({ page }) => {
  await page.goto("/dashboard/service/select");
  const selects = page.locator("form select");
  await selects.nth(0).selectOption({ index: 1 });
  await selects.nth(1).selectOption({ index: 2 });
  await selects.nth(2).selectOption({ index: 3 });
  await page.getByRole("button", { name: /submit|update/i }).click();
  await page.waitForURL("**/dashboard/service");
  await expect(page.getByRole("heading", { name: /my selected groups|my choices/i })).toBeVisible();

  await page.goto("/dashboard/service/select");
  await page.locator("form select").nth(0).selectOption({ index: 4 });
  await page.getByRole("button", { name: /update|submit/i }).click();
  await page.waitForURL("**/dashboard/service");
});

test("attendance tabs render (event and course)", async ({ page }) => {
  await page.goto("/dashboard/attendance");
  await expect(page.getByRole("tab", { name: /event/i })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: /course/i }).click();
  await expect(page.getByRole("tab", { name: /course/i })).toHaveAttribute("aria-selected", "true");
});

test("notifications, donations and resources pages load", async ({ page }) => {
  for (const [path, heading] of [
    ["/dashboard/notifications", /notifications/i],
    ["/dashboard/donations", /donation/i],
    ["/dashboard/resources", /resources/i],
    ["/dashboard/profile", /E2E Tester/],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 }).first()).toContainText(heading);
  }
});

test("mobile drawer navigates", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: /open menu/i }).click();
  await page.getByRole("dialog").getByRole("link", { name: /events/i }).first().click();
  await page.waitForURL("**/dashboard/events");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
});
