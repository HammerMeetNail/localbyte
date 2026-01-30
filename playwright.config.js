// @ts-check
var path = require("path");

/** @type {import('@playwright/test').PlaywrightTestConfig} */
var config = {
  testDir: path.join(__dirname, "tests"),
  timeout: 30 * 1000,
  expect: {
    timeout: 10 * 1000
  },
  webServer: {
    command: "python3 -m http.server 9000 --directory public",
    port: 9000,
    reuseExistingServer: !process.env.CI
  },
  use: {
    baseURL: "http://127.0.0.1:9000",
    trace: "retain-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium"
      }
    }
  ]
};

module.exports = config;

