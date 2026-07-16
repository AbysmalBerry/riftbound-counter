/**
 * Riftbound (League of Legends TCG) table helpers — pure logic, tested.
 *
 * A match is a list of scoring "teams" (panels). 1v1 and custom free-for-all
 * are just teams of size 1; 2v2 and custom team modes share one score across
 * a team. First team to `winAt` points wins.
 */

/** Standard 1v1 / free-for-all win threshold. */
export const WIN_1V1 = 8;
/** 2v2 win threshold. */
export const WIN_2V2 = 11;
/** Settable win-score bounds for custom matches. */
export const WIN_MIN = 1;
export const WIN_MAX = 30;
/** Hard cap on total players around one phone. */
export const MAX_PLAYERS = 6;
/** Ceiling for the XP sub-counter — keeps the pill readable. */
export const COUNTER_MAX = 99;
/** Max length for a team / player name — keeps the chip on one line. */
export const NAME_MAX = 14;
/** Max length for a buff card name. */
export const BUFF_NAME_MAX = 16;
/** Per-card buff value range: 1..BUFF_VALUE_MAX. */
export const BUFF_VALUE_MAX = 9;

export type GameMode = "1v1" | "2v2" | "custom";

/** A named buff in play — different cards grant different buff amounts. */
export interface BuffCard {
  id: string;
  name: string;
  value: number;
}

/** Seat background themes — class maps live in ./themes. */
export const THEME_IDS = [
  "gold",
  "jungle",
  "crimson",
  "ocean",
  "violet",
  "slate",
  "rose",
  "teal",
] as const;
export type ThemeId = (typeof THEME_IDS)[number];

/** One scoring panel — a solo player (size 1) or a shared-score team. */
export interface Team {
  id: string;
  name: string;
  theme: ThemeId;
  /** Players this panel represents (1 = solo / free-for-all). */
  size: number;
  points: number;
  xp: number;
  xpEnabled: boolean;
  buffsEnabled: boolean;
  buffCards: BuffCard[];
}

/** Per-card buff value clamp: 1..BUFF_VALUE_MAX. */
export const clampBuffValue = (n: number): number =>
  Math.min(BUFF_VALUE_MAX, Math.max(1, Math.round(n)));

/** Combined buff total for a team. */
export const buffTotal = (cards: BuffCard[]): number =>
  cards.reduce((sum, c) => sum + c.value, 0);

/** Victory points clamp: 0..winAt. */
export const clampScore = (n: number, winAt: number): number =>
  Math.min(winAt, Math.max(0, n));

/** Sub-counter (XP) clamp: 0..COUNTER_MAX. */
export const clampCounter = (n: number): number =>
  Math.min(COUNTER_MAX, Math.max(0, n));

/** Index of the first team at/over the win threshold, or -1 if none. */
export const winningTeamIndex = (points: number[], winAt: number): number =>
  points.findIndex((p) => p >= winAt);

/** Default win score for a mode (custom carries its own). */
export const defaultWinAt = (mode: GameMode): number =>
  mode === "2v2" ? WIN_2V2 : WIN_1V1;

/** Default panel label — "Player N" solo, "Team N" for shared-score teams. */
export const defaultTeamName = (index: number, size: number): string =>
  `${size > 1 ? "Team" : "Player"} ${index + 1}`;

/** mm:ss for the match clock. */
export function fmtClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** Match duration for history rows — switches to h/m once it passes an hour. */
export function fmtDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  if (s < 3600) return fmtClock(s);
  const h = Math.floor(s / 3600);
  return `${h}h ${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}m`;
}
