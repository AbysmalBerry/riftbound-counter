import snapshot from "./cards.json";
import type { Card, CardSnapshot, Filters } from "./types";

const data = snapshot as CardSnapshot;

/** Every card in the bundled set. */
export const CARDS: Card[] = data.cards;

/** When the snapshot was captured — surfaced in the setup footer. */
export const SNAPSHOT = { fetchedAt: data.fetchedAt, count: data.count };

/** Domain → brand color, mirroring Riot's rune palette. */
export const DOMAIN_COLORS: Record<string, string> = {
  Fury: "#ef4444",
  Calm: "#22c55e",
  Mind: "#3b82f6",
  Body: "#f97316",
  Chaos: "#a855f7",
  Order: "#eab308",
  Colorless: "#94a3b8",
};

/** Distinct, display-ordered option lists for the filter UI. */
function distinct(pick: (c: Card) => (string | number)[]): (string | number)[] {
  const seen = new Set<string | number>();
  for (const c of CARDS) for (const v of pick(c)) if (v != null) seen.add(v);
  return [...seen];
}

const TYPE_ORDER = ["Unit", "Spell", "Gear", "Legend", "Battlefield", "Rune"];
const RARITY_ORDER = ["Common", "Uncommon", "Rare", "Epic", "Showcase"];

export const FILTER_OPTIONS = {
  types: (distinct((c) => c.type) as string[]).sort(
    (a, b) => TYPE_ORDER.indexOf(a) - TYPE_ORDER.indexOf(b),
  ),
  domains: (distinct((c) => c.domains) as string[]).sort(
    (a, b) => Object.keys(DOMAIN_COLORS).indexOf(a) - Object.keys(DOMAIN_COLORS).indexOf(b),
  ),
  sets: distinct((c) => (c.set ? [c.set] : [])) as string[],
  rarities: (distinct((c) => (c.rarity ? [c.rarity] : [])) as string[]).sort(
    (a, b) => RARITY_ORDER.indexOf(a) - RARITY_ORDER.indexOf(b),
  ),
  might: (distinct((c) => (c.might != null ? [c.might] : [])) as number[]).sort((a, b) => a - b),
};

export const EMPTY_FILTERS: Filters = {
  types: [],
  domains: [],
  sets: [],
  rarities: [],
  might: [],
};

/** A card passes when it matches every active (non-empty) facet. */
export function matches(card: Card, f: Filters): boolean {
  if (f.types.length && !card.type.some((t) => f.types.includes(t))) return false;
  if (f.domains.length && !card.domains.some((d) => f.domains.includes(d))) return false;
  if (f.sets.length && !(card.set && f.sets.includes(card.set))) return false;
  if (f.rarities.length && !(card.rarity && f.rarities.includes(card.rarity))) return false;
  if (f.might.length && !(card.might != null && f.might.includes(card.might))) return false;
  return true;
}

/** Cards eligible for a given mode + filter set. "effect" needs ability text. */
export function eligible(mode: "name" | "effect", f: Filters): Card[] {
  return CARDS.filter((c) => matches(c, f) && (mode === "name" || c.text.trim().length > 0));
}
