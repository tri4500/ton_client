import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import Payment from "./Payment.tsx";
import "./index.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

import { BrowserRouter, Route, Routes } from "react-router-dom";

const manifestUrl =
  "https://raw.githubusercontent.com/tritri0405/ton-client/main/manifest.json";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <BrowserRouter>
      <Routes>
        <Route path="/wallet" element={<App />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </BrowserRouter>
  </TonConnectUIProvider>
);
