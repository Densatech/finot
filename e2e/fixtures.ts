import { test as base, expect, type Page } from "@playwright/test";

export const PASSWORD = "Finot-Test-2026";
export const USERS = {
  student: "student@finot.test",
  serviceAdmin: "service@finot.test",
  coordinator: "coord@finot.test",
  staff: "mod@finot.test", // QAModerator + QACounselor + EventManager
} as const;

/**
 * Every test fails if the page logs an uncaught error or the API answers 5xx.
 * Expected 4xx (e.g. 404 "no family yet") are part of normal flows and are not errors.
 */
export const test = base.extend<{ guard: void }>({
  guard: [
    async ({ page }, use) => {
      const problems: string[] = [];
      page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
      page.on("console", (msg) => {
        if (msg.type() !== "error") return;
        const text = msg.text();
        if (/Failed to load resource|status of 4\d\d/.test(text)) return; // browser noise for expected 4xx
        problems.push(`console: ${text}`);
      });
      page.on("response", (res) => {
        if (res.status() >= 500 && /\/(api|auth)\//.test(res.url())) problems.push(`HTTP ${res.status()} ${res.url()}`);
      });
      await use();
      expect(problems, problems.join("\n")).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export async function login(page: Page, email: string, password = PASSWORD) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel(/^Password/).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard/);
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: /account menu/i }).click();
  await page.getByRole("menuitem", { name: /log ?out/i }).click();
  await page.waitForURL((url) => url.pathname === "/");
}
