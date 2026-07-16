import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/teko";
import "@/index.css";

// The app is served from a subpath, so Vite's base is also the router basename
// — keeps dev, `vite preview` and the deployed /riftbound/ mount identical.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
