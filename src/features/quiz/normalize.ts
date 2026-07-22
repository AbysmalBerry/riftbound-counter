import type { Card } from "./types";

/**
 * Flattens the official gallery's Next.js data blob into our Card shape. This
 * is the browser twin of scripts/fetch-cards.mjs — keep the two in sync; the
 * script seeds the bundled cards.json, this powers the in-app "Update cards".
 *
 * The blob is external and loosely typed, so the Raw* interfaces below describe
 * only the fields we read; everything is optional and defensively accessed.
 */

interface RawScalar {
  value?: { id?: string | number; label?: string };
}
interface RawCard {
  id?: string;
  name?: string;
  publicCode?: string;
  collectorNumber?: number;
  set?: RawScalar;
  cardType?: { type?: { label?: string }[] };
  rarity?: RawScalar;
  domain?: { values?: { label?: string }[] };
  energy?: RawScalar;
  might?: RawScalar;
  power?: RawScalar;
  tags?: { tags?: string[] };
  text?: { richText?: { body?: string } };
  cardImage?: { url?: string };
}
interface RawBlob {
  pageProps?: { page?: { blades?: { cards?: { items?: RawCard[] } }[] } };
}

/** Riot nests scalars as { value: { id, label } }. */
function scalarLabel(node: RawScalar | undefined): string | null {
  return node?.value?.label ?? null;
}

function numericId(node: RawScalar | undefined): number | null {
  const v = node?.value?.id;
  if (typeof v === "number") return v;
  if (v != null && !Number.isNaN(Number(v))) return Number(v);
  return null;
}

/** Pull the Next.js buildId out of the gallery HTML (needed for the data URL). */
export function extractBuildId(html: string): string | null {
  return html.match(/"buildId":"([^"]+)"/)?.[1] ?? null;
}

export function normalizeCards(blob: unknown): Card[] {
  const blades = (blob as RawBlob)?.pageProps?.page?.blades ?? [];
  const items =
    blades.map((b) => b?.cards?.items).find((arr) => Array.isArray(arr) && arr.length > 0) ?? [];

  return items
    .map((c): Card => ({
      id: c.id ?? "",
      name: c.name ?? "",
      code: c.publicCode ?? null,
      number: c.collectorNumber ?? null,
      set: scalarLabel(c.set),
      type: (c.cardType?.type ?? []).map((t) => t.label).filter((l): l is string => Boolean(l)),
      rarity: scalarLabel(c.rarity),
      domains: (c.domain?.values ?? []).map((d) => d.label).filter((l): l is string => Boolean(l)),
      energy: numericId(c.energy),
      might: numericId(c.might),
      power: numericId(c.power),
      tags: c.tags?.tags ?? [],
      text: c.text?.richText?.body ?? "",
      image: c.cardImage?.url ?? "",
    }))
    .filter((c) => Boolean(c.name && c.image));
}
