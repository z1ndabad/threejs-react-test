import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

async function deferRender() {
  const { worker } = await import("./mocks/browser.ts");
  return worker.start();
}
//TODO: make this conditional when live data is available

deferRender().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />,
    </StrictMode>,
  );
});
