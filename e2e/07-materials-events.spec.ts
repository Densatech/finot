import { USERS, expect, login, test } from "./fixtures";

test.describe.serial("service admin: materials and group events", () => {
  test("adds a link and a file material to the group", async ({ page }) => {
    await login(page, USERS.serviceAdmin);
    await page.goto("/dashboard/manage-ageglot");
    await page.getByRole("tab", { name: /materials/i }).click();

    await page.getByRole("button", { name: /(add|upload) material/i }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByRole("radio", { name: /external link/i }).click();
    await dialog.getByLabel(/^title/i).fill("E2E Hymn Book Link");
    await dialog.getByLabel(/^link/i).fill("https://example.org/hymns");
    await page.getByRole("button", { name: /^upload$/i }).click();
    await expect(page.getByText("E2E Hymn Book Link")).toBeVisible();

    await page.getByRole("button", { name: /(add|upload) material/i }).click();
    dialog = page.getByRole("dialog");
    await dialog.getByLabel(/^title/i).fill("E2E Choir Notes");
    await dialog.getByLabel(/^file/i).setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("Kyrie eleison") });
    await page.getByRole("button", { name: /^upload$/i }).click();
    await expect(page.getByText("E2E Choir Notes")).toBeVisible();

    // The uploaded file is actually served back.
    const href = await page.locator("li", { hasText: "E2E Choir Notes" }).getByRole("link").getAttribute("href");
    expect(href).toBeTruthy();
    const res = await page.request.get(href!);
    expect(res.status()).toBe(200);
    expect(await res.text()).toBe("Kyrie eleison");
  });

  test("group member sees both materials in Resources", async ({ page }) => {
    await login(page, USERS.student);
    await page.goto("/dashboard/resources");
    await expect(page.getByText("E2E Hymn Book Link")).toBeVisible();
    await expect(page.getByText("E2E Choir Notes")).toBeVisible();
  });

  test("edits then deletes a group event", async ({ page }) => {
    await login(page, USERS.serviceAdmin);
    await page.goto("/dashboard/manage-ageglot");

    await page.getByRole("button", { name: /new group event/i }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByLabel(/^title/i).fill("E2E Rehearsal");
    await dialog.getByLabel(/^description/i).fill("Before the feast");
    await dialog.getByLabel(/^start/i).fill("2030-11-01T17:00");
    await dialog.getByLabel(/^end/i).fill("2030-11-01T19:00");
    await page.getByRole("button", { name: /(save|create) event/i }).click();
    await expect(page.getByText("E2E Rehearsal")).toBeVisible();

    await page.getByRole("button", { name: /^edit (event )?E2E Rehearsal$/i }).click();
    dialog = page.getByRole("dialog");
    await expect(dialog.getByLabel(/^title/i)).toHaveValue("E2E Rehearsal");
    await dialog.getByLabel(/^title/i).fill("E2E Rehearsal (moved)");
    await dialog.getByLabel(/place/i).fill("Main hall");
    await page.getByRole("button", { name: /save changes|update event/i }).click();
    await expect(page.getByText("E2E Rehearsal (moved)")).toBeVisible();
    await expect(page.getByText("Main hall")).toBeVisible();

    await page.getByRole("button", { name: /^delete (event )?E2E Rehearsal \(moved\)$/i }).click();
    await page.getByRole("dialog").getByRole("button", { name: /^delete$/i }).click();
    await expect(page.getByText("E2E Rehearsal (moved)")).toHaveCount(0);

    await page.reload();
    await expect(page.getByText("Choir Practice")).toBeVisible();
    await expect(page.getByText("E2E Rehearsal (moved)")).toHaveCount(0);
  });
});

// 1×1 PNG — the backend validates real image data.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

test("student uploads a profile photo and it is served", async ({ page }) => {
  await login(page, USERS.student);
  await page.goto("/dashboard/profile/edit");
  await page.locator('input[type="file"]').setInputFiles({ name: "me.png", mimeType: "image/png", buffer: PNG });
  await page.getByRole("button", { name: /save changes/i }).click();
  await page.waitForURL("**/dashboard/profile");

  const img = page.getByRole("main").locator('img[src*="/media/"]').first();
  await expect(img).toBeVisible();
  const res = await page.request.get((await img.getAttribute("src"))!);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("image/png");
});
