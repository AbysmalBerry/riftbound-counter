import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

/**
 * The app is served from a subpath (khairimeske.cloud/riftbound/), so every
 * asset URL, the router basename, the service-worker scope and the manifest all
 * hang off this one value. Override with BASE_PATH=/ to host it at a root domain.
 */
const base = process.env.BASE_PATH ?? "/riftbound/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/*.png", "icons/icon.svg"],
      manifest: {
        name: "Riftbound Counter",
        short_name: "Riftbound",
        description: "Face-to-face score counter for the Riftbound TCG",
        theme_color: "#0F0A19",
        background_color: "#0F0A19",
        display: "standalone",
        // Landscape matters here — the 2-up table flips to side-by-side seats.
        orientation: "any",
        id: base,
        scope: base,
        start_url: base,
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        // Long-press the app icon on Android → straight to the table.
        shortcuts: [
          { name: "Play", url: `${base}play`, icons: [{ src: "icons/icon-192.png", sizes: "192x192" }] },
          { name: "Match setup", url: `${base}setup`, icons: [{ src: "icons/icon-192.png", sizes: "192x192" }] },
        ],
      },
      workbox: {
        // Precache the built assets (hashed JS/CSS/fonts/images/icons) — they're
        // immutable per build, so cache-first is safe, fast and offline-ready.
        //
        // Deliberately EXCLUDE html: the app shell is served NetworkFirst below,
        // NOT precached. Precaching pins index.html *together with its response
        // headers*, and its precache revision doesn't change when only a header
        // changes server-side — so a CSP edit (e.g. allowing the card-art CDN)
        // would never reach already-installed PWAs. NetworkFirst means every
        // online launch re-fetches the shell and its current headers.
        globPatterns: ["**/*.{js,css,svg,png,woff2}"],
        // Disable the default navigateFallback: it registers a route that serves
        // the *precached* index.html for navigations, which both re-pins stale
        // headers and (now that html isn't precached) would throw. NetworkFirst
        // below handles navigations instead.
        navigateFallback: null,
        runtimeCaching: [
          {
            // Only real page loads are navigation requests; SPA route changes
            // are client-side and hit the network for nothing. The PWA launches
            // at /riftbound/, so the launch shell is refreshed on each online
            // start and falls back to the last-cached shell when offline.
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "app-shell",
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 8 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: {
    port: Number(process.env.PORT) || 5183,
    // Loopback by default. The dev server has no authentication and known
    // advisories let a visited website read its responses, so exposing it on
    // every interface is opt-in: `HOST=true npm run dev` when you genuinely
    // need to open the app on your phone, and only on a network you trust.
    host: process.env.HOST === "true" ? true : "localhost",
    // Same-origin proxy to the official card gallery for the in-app "Update
    // cards" action — their endpoint sends no CORS header, so the browser
    // can't fetch it directly. nginx mirrors this block in prod (see
    // deploy/nginx-riftbound.conf).
    proxy: {
      [`${base}gallery`]: {
        target: "https://playriftbound.com",
        changeOrigin: true,
        followRedirects: true,
        rewrite: (p) => p.replace(`${base}gallery`, ""),
      },
    },
  },
  build: { target: "es2020", sourcemap: false },
});
