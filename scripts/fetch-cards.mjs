// Fetches the live Riftbound card gallery and writes a normalized snapshot to
// src/features/quiz/cards.json. Riot ships the gallery as a Next.js data blob
// at /_next/data/<buildId>/en-us/card-gallery.json — we scrape the buildId from
// the gallery HTML, pull the blob, flatten each card, and drop the icon/CDN
// cruft we don't need. Re-run with `npm run cards` after a set drops.
//
// Data source: https://riftbound.leagueoflegends.com (official card gallery).
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const BASE = "https://riftbound.leagueoflegends.com";
const GALLERY = `${BASE}/en-us/card-gallery/`;
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../src/features/quiz/cards.json");

/** Riot nests scalars as { value: { id, label } } or { values: [...] }. */
const scalar = (node) => node?.value?.label ?? null;
const numeric = (node) => {
  const v = node?.value?.id;
  return typeof v === "number" ? v : v != null && !Number.isNaN(Number(v)) ? Number(v) : null;
};

async function main() {
  console.log("→ resolving buildId…");
  const html = await (await fetch(GALLERY)).text();
  const buildId = html.match(/"buildId":"([^"]+)"/)?.[1];
  if (!buildId) throw new Error("Could not find buildId in gallery HTML");

  console.log(`→ fetching card blob (build ${buildId})…`);
  const blob = await (await fetch(`${BASE}/_next/data/${buildId}/en-us/card-gallery.json`)).json();

  // The card list lives in one of the page "blades"; find the array of cards.
  const blades = blob?.pageProps?.page?.blades ?? [];
  const items =
    blades.map((b) => b?.cards?.items).find((arr) => Array.isArray(arr) && arr.length > 0) ?? [];
  if (items.length === 0) throw new Error("No cards found in blob — page shape may have changed");

  const cards = items
    .map((c) => ({
      id: c.id,
      name: c.name,
      code: c.publicCode ?? null,
      number: c.collectorNumber ?? null,
      set: scalar(c.set),
      type: (c.cardType?.type ?? []).map((t) => t.label).filter(Boolean),
      rarity: scalar(c.rarity),
      domains: (c.domain?.values ?? []).map((d) => d.label).filter(Boolean),
      energy: numeric(c.energy),
      might: numeric(c.might),
      power: numeric(c.power),
      tags: c.tags?.tags ?? [],
      // Ability copy is HTML with :rb_might: style tokens — keep raw, render sanitized.
      text: c.text?.richText?.body ?? "",
      image: c.cardImage?.url ?? null,
    }))
    .filter((c) => c.name && c.image);

  const payload = {
    source: BASE,
    buildId,
    fetchedAt: new Date().toISOString(),
    count: cards.length,
    cards,
  };

  await writeFile(OUT, JSON.stringify(payload) + "\n");
  console.log(`✓ wrote ${cards.length} cards → ${OUT}`);
}

main().catch((err) => {
  console.error("✗ fetch-cards failed:", err.message);
  process.exit(1);
});
