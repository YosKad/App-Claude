import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StoreProvider } from "./state/store";
import { App } from "./App";
import { initNative } from "./native/init";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
);

// Style native chrome (status bar) and hide the splash once loaded. No-op on web.
void initNative();
