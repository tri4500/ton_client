import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

const manifestUrl =
  "https://raw.githubusercontent.com/tritri0405/ton-client/main/manifest.json";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <App />
  </TonConnectUIProvider>
);
