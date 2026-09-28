import { expect, test } from "./fixtures";

test("home page renders hero, sections and navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("finot");
  await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
  await expect(page.getByRole("link", { name: /get started/i }).first()).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
});

for (const path of ["/about", "/contact", "/donate", "/anonymous", "/anonymous/questions", "/login", "/register"]) {
  test(`public page ${path} renders inside the layout`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });
}

test("unknown route shows a 404 page", async ({ page }) => {
  await page.goto("/does-not-exist");
  await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible();
});

test("public Q&A shows only approved questions", async ({ page }) => {
  await page.goto("/anonymous/questions");
  await expect(page.getByText("How should I prepare for confession?")).toBeVisible();
  await expect(page.getByText("Pending question awaiting moderation")).toHaveCount(0);
});

test("switching to Amharic loads the translation bundle", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /change language/i }).first().click();
  await page.getByRole("menuitem", { name: "አማርኛ" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "am");
});

test("mobile layout has no horizontal overflow and the menu opens", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
  await page.getByRole("button", { name: /open menu/i }).click();
  await expect(page.getByRole("link", { name: /about/i }).first()).toBeVisible();
});
