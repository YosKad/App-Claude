import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// SubSentry build + test config.
// `base: "./"` keeps asset paths relative so the same build works inside a
// Capacitor native shell (iOS/Android) as well as on the web.
export default defineConfig({
  plugins: [react()],
  base: "./",
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
