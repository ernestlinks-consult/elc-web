// Generates public/brand/og-default.png, the 1200×630 share image. Run it by hand
// if the logo or tagline changes: node scripts/generate-og-image.mjs

import { readFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const logo = readFileSync("public/brand/web-elc-logo-vertical-stack-white.svg", "base64");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

await page.setContent(`
  <body style="margin:0;width:1200px;height:630px;background:#0505C6;color:#fff;
    font-family:Arial,sans-serif;display:flex;flex-direction:column;
    justify-content:center;gap:40px;padding:0 96px;box-sizing:border-box">
    <img src="data:image/svg+xml;base64,${logo}" width="340" alt="">
    <div style="font-size:56px;font-weight:800;line-height:1.15;max-width:960px">
      Making Impact Through Education and Travels.
    </div>
  </body>
`);
await page.screenshot({ path: "public/brand/og-default.png" });
await browser.close();
