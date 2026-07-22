import snapshot from "./cards.json";
import type { Card, CardSnapshot, Filters } from "./types";

const data = snapshot as CardSnapshot;

/** The card set shipped in the bundle — seed + offline fallback. */
export const BUNDLED_CARDS: Card[] = data.cards;
export const BUNDLED_SNAPSHOT = { fetchedAt: data.fetchedAt, count: data.count };

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

const TYPE_ORDER = ["Unit", "Spell", "Gear", "Legend", "Battlefield", "Rune"];
const RARITY_ORDER = ["Common", "Uncommon", "Rare", "Epic", "Showcase"];

export interface FilterOptions {
  types: string[];
  domains: string[];
  sets: string[];
  rarities: string[];
  might: number[];
}

/** Distinct, display-ordered option lists derived from a given card set. */
export function filterOptions(cards: Card[]): FilterOptions {
  const types = new Set<string>();
  const domains = new Set<string>();
  const sets = new Set<string>();
  const rarities = new Set<string>();
  const might = new Set<number>();
  for (const c of cards) {
    c.type.forEach((t) => types.add(t));
    c.domains.forEach((d) => domains.add(d));
    if (c.set) sets.add(c.set);
    if (c.rarity) rarities.add(c.rarity);
    if (c.might != null) might.add(c.might);
  }
  return {
    types: [...types].sort((a, b) => TYPE_ORDER.indexOf(a) - TYPE_ORDER.indexOf(b)),
    domains: [...domains].sort(
      (a, b) => Object.keys(DOMAIN_COLORS).indexOf(a) - Object.keys(DOMAIN_COLORS).indexOf(b),
    ),
    sets: [...sets],
    rarities: [...rarities].sort((a, b) => RARITY_ORDER.indexOf(a) - RARITY_ORDER.indexOf(b)),
    might: [...might].sort((a, b) => a - b),
  };
}

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
export function eligible(cards: Card[], mode: "name" | "effect", f: Filters): Card[] {
  return cards.filter((c) => matches(c, f) && (mode === "name" || c.text.trim().length > 0));
}
