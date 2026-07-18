import type { CapacitorConfig } from "@capacitor/cli";

// Capacitor wraps the built web app (dist/) as native iOS and Android apps.
// Run `npm run native:sync` after a build to copy the web assets into the
// native projects. See docs/NATIVE_SETUP.md for the full Mac workflow.
const config: CapacitorConfig = {
  appId: "com.subsentry.app",
  appName: "SubSentry",
  webDir: "dist",
  backgroundColor: "#0c1116",
  ios: {
    contentInset: "always",
  },
  android: {
    backgroundColor: "#0c1116",
  },
};

export default config;
