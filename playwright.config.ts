import { defineConfig, devices } from "@playwright/test";

const productionURL = "http://localhost:3000";
const developmentURL = "http://localhost:3001";

export default defineConfig({
  testDir: "./tests",
  testMatch: ["e2e/**/*.spec.ts", "a11y/**/*.spec.ts"],
  fullyParallel: true,
  // Sign-in, axe and the build share one machine across about 160 browser tests.
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: { trace: "on-first-retry" },
  // *.dev.spec.ts files cover routes that return 404 in production builds.
  projects: [
    {
      name: "production",
      testIgnore: "**/*.dev.spec.ts",
      use: { ...devices["Desktop Chrome"], baseURL: productionURL },
    },
    {
      name: "integration",
      testMatch: "integration/**/*.spec.ts",
      use: { ...devices["Desktop Chrome"], baseURL: productionURL },
    },
    {
      name: "development",
      testMatch: "**/*.dev.spec.ts",
      use: { ...devices["Desktop Chrome"], baseURL: developmentURL },
    },
  ],
  webServer: [
    {
      command: "npm run build && npm run start",
      url: productionURL,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command: "npm run dev -- --port 3001",
      url: developmentURL,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
});
