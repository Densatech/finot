import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));

// Dedicated ports (5177/8001) so a regular dev server on 5176/8000 can keep running.
// End-to-end tests run the real Django backend (fresh SQLite DB + seed_e2e) and the Vite dev server.
const backendDir = path.resolve(here, "../backend");
const db = path.resolve(here, "e2e/.tmp/e2e.sqlite3");
const media = path.resolve(here, "e2e/.tmp/media");
const backendEnv = `E2E_LOCAL_MEDIA=${media} DATABASE_URL=sqlite:///${db} FRONTEND_URL=http://localhost:5177 E2E_RELAX_THROTTLES=1 CHAPA_SECRET_KEY=CHASECK_TEST-e2e`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1, // specs share one seeded database
  retries: process.env.CI ? 1 : 0,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e/.report" }]],
  use: {
    baseURL: "http://localhost:5177",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], channel: process.env.PW_CHANNEL ?? "chrome" },
    },
  ],
  webServer: [
    {
      command: `bash -c "mkdir -p ${path.dirname(db)} && rm -f ${db} && cd ${backendDir} && ${backendEnv} uv run python manage.py migrate -v0 && ${backendEnv} uv run python manage.py seed_e2e && ${backendEnv} uv run python manage.py runserver 127.0.0.1:8001 --noreload"`,
      url: "http://127.0.0.1:8001/api/docs/swagger/",
      timeout: 180_000,
      reuseExistingServer: false,
      stdout: "ignore",
      stderr: "pipe",
    },
    {
      command: "npx vite --port 5177 --strictPort",
      url: "http://localhost:5177",
      env: { VITE_DEV_API_PROXY: "http://127.0.0.1:8001" },
      timeout: 120_000,
      reuseExistingServer: false,
    },
  ],
});
