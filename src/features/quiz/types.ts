/** One card in the bundled snapshot (see scripts/fetch-cards.mjs). */
export interface Card {
  id: string;
  name: string;
  code: string | null;
  number: number | null;
  set: string | null;
  type: string[];
  rarity: string | null;
  domains: string[];
  energy: number | null;
  might: number | null;
  power: number | null;
  tags: string[];
  /** Ability copy — HTML with :rb_*: game-symbol tokens. Render via <Ability>. */
  text: string;
  image: string;
}

export interface CardSnapshot {
  source: string;
  buildId: string;
  fetchedAt: string;
  count: number;
  cards: Card[];
}

/** What the player is asked to identify from the card art. */
export type QuizMode = "name" | "effect";

/** Filters narrowing which cards can appear. Empty set = no restriction. */
export interface Filters {
  types: string[];
  domains: string[];
  sets: string[];
  rarities: string[];
  might: number[];
}

export interface Question {
  card: Card;
  mode: QuizMode;
  /** Answer choices; for "name" these are card names, for "effect" ability HTML. */
  options: string[];
  /** Index into `options` that is correct. */
  answer: number;
}
