import { USERS, expect, login, test } from "./fixtures";

// Chapa is never contacted: initiate/verify are intercepted in the browser.

test("guest donation in Amharic sends the backend fund code", async ({ page }) => {
  let body: Record<string, unknown> | null = null;
  await page.route("**/api/donations/initiate/", async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ status: 201, json: { checkout_url: "http://localhost:5177/donation/success?tx_ref=tx-e2e-guest", tx_ref: "tx-e2e-guest" } });
  });
  let verifyCalls = 0;
  await page.route("**/api/donations/verify/tx-e2e-guest/", async (route) => {
    verifyCalls += 1;
    const pending = verifyCalls === 1;
    await route.fulfill({
      status: pending ? 202 : 200,
      json: {
        status: pending ? "Payment pending" : "Payment Successful",
        payment_status: pending ? "PENDING" : "COMPLETED",
        amount: 50,
        currency: "ETB",
        tx_ref: "tx-e2e-guest",
        date: new Date().toISOString(),
        donor_name: "Hana Tesfaye",
      },
    });
  });

  await page.goto("/donate");
  await page.evaluate(() => localStorage.setItem("i18nextLng", "am"));
  await page.reload();
  const form = page.locator("form");
  await form.locator("input").nth(0).fill("Hana");
  await form.locator("input").nth(1).fill("Tesfaye");
  await form.locator('input[type="email"]').fill("hana@example.com");
  await form.locator("select").selectOption("Weekly Donation");
  await form.locator('input[type="number"]').fill("50");
  await form.locator('button[type="submit"]').click();

  await page.waitForURL("**/donation/success?tx_ref=tx-e2e-guest");
  expect(body).toMatchObject({ fund_category: "Weekly Donation", amount: 50, email: "hana@example.com" });
  await expect(page.getByText("Hana Tesfaye")).toBeVisible({ timeout: 20_000 }); // after the pending retry
  expect(verifyCalls).toBeGreaterThanOrEqual(2);
  await page.evaluate(() => localStorage.setItem("i18nextLng", "en"));
});

test("amounts below 1 ETB are rejected before contacting the server", async ({ page }) => {
  let called = false;
  await page.route("**/api/donations/initiate/", async (route) => {
    called = true;
    await route.abort();
  });
  await page.goto("/donate");
  const form = page.locator("form");
  await form.locator("input").nth(0).fill("A");
  await form.locator("input").nth(1).fill("B");
  await form.locator('input[type="email"]').fill("a@example.com");
  await form.locator("select").selectOption("Other");
  await form.locator('input[type="number"]').fill("0.5");
  await form.locator('button[type="submit"]').click();
  await expect(page.getByText(/at least 1 ETB/i)).toBeVisible();
  expect(called).toBe(false);
});

test("member donation goes to checkout and history loads", async ({ page }) => {
  await login(page, USERS.student);
  await page.route("**/api/donations/initiate/", (route) =>
    route.fulfill({ status: 201, json: { checkout_url: "http://localhost:5177/dashboard/donations/history", tx_ref: "tx-e2e-member" } }),
  );
  await page.goto("/dashboard/donations/give");
  await page.locator("form select").selectOption("Building Fund");
  await page.getByRole("button", { name: "100 ETB" }).click();
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL("**/dashboard/donations/history");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/history/i);
});
