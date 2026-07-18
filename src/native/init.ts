// Native-only initialisation. On the web every call here is a no-op, so the
// same bundle runs in the browser (for dev + QA) and inside the Capacitor shell.
import { Capacitor } from "@capacitor/core";

const BRAND_DARK = "#0c1116";

export async function initNative(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    // Light content (white icons) on our dark background.
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setBackgroundColor({ color: BRAND_DARK });
    }
  } catch {
    /* plugin not available — ignore */
  }

  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch {
    /* ignore */
  }
}
