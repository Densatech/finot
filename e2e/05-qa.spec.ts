import { USERS, expect, login, logout, test } from "./fixtures";

test.describe.serial("Q&A: ask → answer → moderate → counsel", () => {
  test("student asks public + private questions and answers one", async ({ page }) => {
    await login(page, USERS.student);

    await page.goto("/dashboard/questions/ask");
    await page.getByLabel("Category").selectOption("Spiritual");
    await page.getByLabel("Your question").fill("E2E public question about fasting?");
    await page.getByRole("button", { name: /submit question/i }).click();
    await page.waitForURL(/\/dashboard\/questions$/);

    await page.goto("/dashboard/questions/ask");
    await page.getByText("Private", { exact: true }).click();
    await page.getByLabel("Category").selectOption("Personal");
    await page.getByLabel("Your question").fill("E2E private question for a counselor");
    await page.getByRole("button", { name: /submit question/i }).click();
    await page.waitForURL("**/dashboard/questions?tab=private");
    await expect(page.getByText("E2E private question for a counselor")).toBeVisible();

    await page.goto("/dashboard/questions");
    await page.getByLabel(/write (an|your) answer/i).first().fill("E2E student answer");
    await page.getByRole("button", { name: /reply/i }).first().click();
    await expect(page.getByText(/after a moderator approves/i)).toBeVisible();

    await page.goto("/dashboard/questions?tab=mine");
    await expect(page.getByText("E2E student answer")).toBeVisible();
    await logout(page);
  });

  test("moderator approves the question and the answer", async ({ page }) => {
    await login(page, USERS.staff);
    await page.goto("/dashboard/counselor/approve");
    const q = page.locator("li", { hasText: "E2E public question about fasting?" });
    await q.getByRole("button", { name: /approve/i }).click();
    await expect(q).toHaveCount(0);

    await page.getByRole("tab", { name: /answers/i }).click();
    const a = page.locator("li", { hasText: "E2E student answer" });
    await a.getByRole("button", { name: /approve/i }).click();
    await expect(a).toHaveCount(0);
  });

  test("counselor answers the private question (sees the asker's name)", async ({ page }) => {
    await login(page, USERS.staff);
    await page.goto("/dashboard/counselor/queue");
    const card = page.locator("li", { hasText: "E2E private question for a counselor" });
    await expect(card.getByText("Selam E2E Tester")).toBeVisible();
    await card.getByRole("button", { name: /^answer/i }).click();
    await page.getByLabel("Your answer").fill("E2E counselor reply");
    await page.getByRole("button", { name: /submit answer|send answer/i }).click();
    await page.getByRole("tab", { name: /^answered/i }).click();
    await expect(page.getByText("E2E counselor reply")).toBeVisible();
  });

  test("student sees approved content, the reply and a notification", async ({ page }) => {
    await page.goto("/anonymous/questions");
    await expect(page.getByText("E2E public question about fasting?")).toBeVisible();
    await expect(page.getByText("E2E student answer")).toBeVisible();

    await login(page, USERS.student);
    await page.goto("/dashboard/questions?tab=private");
    await expect(page.getByText("E2E counselor reply")).toBeVisible();
    await page.goto("/dashboard/notifications");
    await expect(page.getByText(/answered/i).first()).toBeVisible();
  });
});
