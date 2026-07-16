// Renders the PWA PNG icon set from the SVG sources in public/icons.
// Usage: npm run icons  (re-run after editing icon.svg / icon-maskable.svg)
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");

const JOBS = [
  ["icon.svg", 192, "icon-192.png"],
  ["icon.svg", 512, "icon-512.png"],
  ["icon-maskable.svg", 192, "icon-maskable-192.png"],
  ["icon-maskable.svg", 512, "icon-maskable-512.png"],
  ["icon-maskable.svg", 180, "apple-touch-icon.png"], // iOS ignores transparency → full bleed
];

for (const [src, size, out] of JOBS) {
  await sharp(path.join(dir, src), { density: Math.ceil((72 * size) / 512) })
    .resize(size, size)
    .png()
    .toFile(path.join(dir, out));
  console.log(`✓ ${out} (${size}x${size})`);
}
