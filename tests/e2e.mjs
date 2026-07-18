// End-to-end QA for SubSentry.
// Drives the built app in a real browser, asserts state changes at each step,
// and captures screenshots. Exits non-zero if any check fails.
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL || "http://localhost:4173/";
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const SHOTS = "tests/shots";

let failures = 0;
function check(name, cond) {
  if (cond) {
    console.log(`  ✓ ${name}`);
  } else {
    console.log(`  ✗ ${name}`);
    failures++;
  }
}

const money = (s) => Number((s || "").replace(/[^0-9.]/g, ""));

const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox"] });
const page = await browser.newPage({
  viewport: { width: 430, height: 900 },
  deviceScaleFactor: 2,
});
const shot = (n) => page.screenshot({ path: `${SHOTS}/${n}.png` });

try {
  await page.goto(BASE, { waitUntil: "networkidle" });

  // --- Onboarding ---
  console.log("Onboarding");
  check("shows the hook headline", await page.getByText("forgot about").isVisible());
  await shot("01-onboarding");
  await page.getByText("Connect email").click();

  // --- Home ---
  console.log("Home");
  await page.waitForSelector('[data-testid="sub-netflix"]');
  const totalBefore = money(await page.locator(".d-h .v").innerText());
  check("home shows a monthly total > 0", totalBefore > 0);
  check("Netflix row is present", await page.getByTestId("sub-netflix").isVisible());
  check("top alert banner is shown", await page.locator(".d-alert").isVisible());
  await shot("02-home");

  // --- Detail ---
  console.log("Detail");
  await page.getByTestId("sub-netflix").click();
  await page.waitForSelector('[data-testid="cancel-cta"]');
  check("detail shows price history", await page.locator(".dt-bars").isVisible());
  check("detail shows trial pill", await page.getByText(/Trial ends/).isVisible());
  await shot("03-detail");

  // --- Concierge (cancel flow) ---
  console.log("Cancel concierge");
  await page.getByTestId("cancel-cta").click();
  await page.waitForSelector('[data-testid="concierge"]');
  await shot("04-concierge");

  // --- Success ---
  console.log("Success");
  await page.waitForSelector('[data-testid="success"]', { timeout: 8000 });
  const savedText = await page.locator(".su-big .v").innerText();
  check("success shows a yearly saving > 0", money(savedText) > 0);
  check("counter shows 1 sub cancelled", (await page.locator(".su-tot .tv").nth(1).innerText()) === "1");
  check("success shows a real confirmation receipt", await page.getByTestId("receipt").isVisible());
  await shot("05-success");
  await page.getByTestId("success-home").click();

  // --- Home reflects the cancellation ---
  console.log("Home after cancel");
  await page.waitForSelector('[data-testid="sub-netflix"]');
  const totalAfter = money(await page.locator(".d-h .v").innerText());
  check("monthly total dropped after cancelling", totalAfter < totalBefore);
  check("a savings badge now appears", await page.locator(".d-h .chg").isVisible());
  check(
    "Netflix row marked removed",
    (await page.getByTestId("sub-netflix").getAttribute("class")).includes("cancelled"),
  );
  await shot("06-home-after");

  // --- Persistence: state survives a reload ---
  console.log("Persistence");
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector('[data-testid="sub-netflix"]');
  check(
    "app reopens past onboarding after reload",
    await page.getByTestId("sub-netflix").isVisible(),
  );
  check(
    "cancellation persisted across reload",
    (await page.getByTestId("sub-netflix").getAttribute("class")).includes("cancelled"),
  );

  // --- Alerts tab ---
  console.log("Alerts");
  await page.getByRole("button", { name: "Alerts" }).click();
  await page.waitForSelector(".al-h");
  check("alerts screen lists at least one alert", (await page.locator(".al-c").count()) >= 1);
  check("trial alert gone after cancel", !(await page.getByText("Free trial ending").isVisible()));
  await shot("07-alerts");

  // --- Insights tab ---
  console.log("Insights");
  await page.getByRole("button", { name: "Insights" }).click();
  await page.waitForSelector(".in-ring");
  check("insights shows category legend", (await page.locator(".in-leg .l").count()) >= 2);
  check("insights shows savings", money(await page.locator(".in-save .v").innerText()) > 0);
  await shot("08-insights");

  // --- Settings + paywall + Pro upgrade ---
  console.log("Settings & paywall");
  await page.getByRole("button", { name: "Settings" }).click();
  await page.waitForSelector('[data-testid="toggle-unusedNudges"]');
  const before = await page.getByTestId("toggle-unusedNudges").getAttribute("class");
  await page.getByTestId("toggle-unusedNudges").click();
  const after = await page.getByTestId("toggle-unusedNudges").getAttribute("class");
  check("settings toggle flips state", before !== after);
  check("plan shows FREE before upgrade", await page.locator(".se-prof .pro.free").isVisible());
  await shot("09-settings");

  await page.getByTestId("open-paywall").click();
  await page.waitForSelector('[data-testid="start-trial"]');
  await shot("10-paywall");

  // Restore with no prior purchase should say so, not silently upgrade.
  await page.getByTestId("restore").click();
  await page.waitForSelector('[data-testid="pw-message"]');
  check(
    "restore with no purchase shows an honest message",
    /No previous purchase/i.test(await page.getByTestId("pw-message").innerText()),
  );

  // Real purchase flow via the billing service.
  await page.getByTestId("start-trial").click();
  await page.waitForSelector('[data-testid="toggle-unusedNudges"]');
  check("purchase upgrades the plan to PRO", await page.locator(".se-prof .pro").innerText() === "PRO");

  // --- Store-billed cancellation takes the honest deep-link path ---
  console.log("Store-billed cancel path (Apple)");
  await page.getByRole("button", { name: "Home" }).click();
  await page.waitForSelector('[data-testid="sub-applemusic"]');
  await page.getByTestId("sub-applemusic").click();
  await page.waitForSelector('[data-testid="cancel-cta"]');
  await page.getByTestId("cancel-cta").click();
  await page.waitForSelector('[data-testid="finish-in-settings"]', { timeout: 8000 });
  check(
    "Apple-billed sub routes user to Settings (not fake auto-cancel)",
    await page.getByTestId("finish-in-settings").isVisible(),
  );
  check(
    "store-billed cancel does NOT show a false success",
    !(await page.getByTestId("success").isVisible().catch(() => false)),
  );
  await shot("11-needs-user");
  // Return to Home: needs_user Back -> detail, detail Back -> home.
  await page.getByRole("button", { name: "Back" }).click();
  await page.locator(".appbar .bk").click();

  // --- Account & data deletion (store requirement); wipes state, so it's last ---
  console.log("Account deletion");
  await page.getByRole("button", { name: "Settings" }).click();
  await page.waitForSelector('[data-testid="open-delete"]');
  await page.getByTestId("open-delete").click();
  await page.waitForSelector('[data-testid="confirm-delete"]');
  await shot("12-delete");
  await page.getByTestId("confirm-delete").click();
  await page.waitForSelector(".on-hero", { timeout: 5000 });
  check(
    "deleting the account returns to a fresh onboarding",
    await page.getByText("forgot about").isVisible(),
  );

  console.log(`\n${failures === 0 ? "ALL E2E CHECKS PASSED" : failures + " E2E CHECK(S) FAILED"}`);
} catch (err) {
  console.error("E2E crashed:", err.message);
  failures++;
} finally {
  await browser.close();
}

process.exit(failures === 0 ? 0 : 1);
