import { USERS, expect, login, test } from "./fixtures";

test("event manager creates a global event", async ({ page }) => {
  await login(page, USERS.staff);
  await page.goto("/dashboard/event-management");
  await page.getByRole("button", { name: /new .*event/i }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Title").fill("E2E Global Event");
  await dialog.getByLabel("Description").fill("Created by the e2e suite");
  await dialog.getByLabel(/^start/i).fill("2030-12-01T09:00");
  await dialog.getByLabel(/^end/i).fill("2030-12-01T11:00");
  await page.getByRole("button", { name: /save event|create event/i }).click();
  await expect(page.getByText("E2E Global Event")).toBeVisible();
});

test("service admin marks attendance with Late + remark and it persists", async ({ page }) => {
  await login(page, USERS.serviceAdmin);
  await page.goto("/dashboard/manage-ageglot");
  await page.getByRole("tab", { name: /attendance/i }).click();
  const row = page.locator("li", { hasText: "Selam Tester" });
  await row.getByRole("radio", { name: /late/i }).click();
  await row.getByLabel(/remark/i).fill("bus");
  await page.getByRole("button", { name: /save attendance/i }).click();
  await expect(page.getByText(/attendance (saved|recorded)/i)).toBeVisible();

  await page.reload();
  await page.getByRole("tab", { name: /attendance/i }).click();
  const again = page.locator("li", { hasText: "Selam Tester" });
  await expect(again.getByRole("radio", { name: /late/i })).toHaveAttribute("aria-checked", "true");
  await expect(again.getByLabel(/remark/i)).toHaveValue("bus");
});

test("coordinator filters by batch, adds a session and takes attendance", async ({ page }) => {
  await login(page, USERS.coordinator);
  await page.goto("/dashboard/courses");
  await expect(page.getByText("Orthodox Dogma")).toBeVisible();
  await page.getByRole("radio", { name: "Batch 1" }).click();
  await expect(page.getByText("Orthodox Dogma")).toBeVisible();
  await page.getByRole("radio", { name: "Batch 3" }).click();
  await expect(page.getByText("Orthodox Dogma")).toHaveCount(0);
  await page.getByRole("radio", { name: /all batches/i }).click();

  await page.getByRole("main").getByRole("link", { name: /take attendance|sessions/i }).first().click();
  await page.waitForURL(/\/dashboard\/courses\/.+\/attendance/);
  await page.getByRole("button", { name: /create session|new session/i }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel(/date/i).fill("2030-01-15");
  await dialog.getByLabel(/topic/i).fill("E2E topic");
  await page.getByRole("button", { name: /^create$/i }).click();
  await expect(page.getByText("E2E topic")).toBeVisible();

  const row = page.locator("li", { hasText: "Selam" });
  await row.getByRole("radio", { name: /absent/i }).click();
  await page.getByRole("button", { name: /save attendance/i }).click();
  await expect(page.getByText(/attendance saved/i)).toBeVisible();
});

test("student sees the coordinator's mark in the course tab", async ({ page }) => {
  await login(page, USERS.student);
  await page.goto("/dashboard/attendance");
  await page.getByRole("tab", { name: /course/i }).click();
  await expect(page.getByText("Orthodox Dogma").first()).toBeVisible();
  await expect(page.getByText(/absent/i).first()).toBeVisible();
});
