// Renders the app icon and splash to PNGs in resources/ for @capacitor/assets.
import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox"] });

async function render(html, out, size) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.goto("file://" + resolve(root, html));
  await page.waitForTimeout(200);
  await page.screenshot({ path: resolve(root, out), clip: { x: 0, y: 0, width: size, height: size } });
  await page.close();
  console.log("wrote", out);
}

await render("scripts/icon.html", "resources/icon.png", 1024);
await render("scripts/splash.html", "resources/splash.png", 2732);
await render("scripts/splash.html", "resources/splash-dark.png", 2732);
// A small preview for the repo / handoff.

await browser.close();
