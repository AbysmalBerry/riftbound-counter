/**
 * Accent themes. Each preset is the set of `--ac-*` RGB triplets that
 * src/index.css declares as defaults — swapping them at runtime recolors every
 * bit of brand chrome (buttons, pills, focus rings, the hero tile, the medal)
 * without touching the dark surfaces or the per-seat counter backgrounds.
 *
 * Values are "R G B" strings so Tailwind's `rgb(var(--ac-500) / <alpha>)` keeps
 * working. Keep `rose` first — it's the shipped default.
 */
export interface Accent {
  id: string;
  label: string;
  /** Swatch shown in the picker (the 500 shade as a hex, for convenience). */
  swatch: string;
  vars: {
    "--ac-400": string;
    "--ac-500": string;
    "--ac-600": string;
    "--ac-700": string;
    "--ac-deep": string;
    "--ac-hero-from": string;
  };
}

export const ACCENTS: Accent[] = [
  {
    id: "rose",
    label: "Rose",
    swatch: "#f43f5e",
    vars: {
      "--ac-400": "251 113 133",
      "--ac-500": "244 63 94",
      "--ac-600": "225 29 72",
      "--ac-700": "190 18 60",
      "--ac-deep": "159 18 57",
      "--ac-hero-from": "76 29 149",
    },
  },
  {
    id: "violet",
    label: "Violet",
    swatch: "#8b5cf6",
    vars: {
      "--ac-400": "167 139 250",
      "--ac-500": "139 92 246",
      "--ac-600": "124 58 237",
      "--ac-700": "109 40 217",
      "--ac-deep": "91 33 182",
      "--ac-hero-from": "30 58 138",
    },
  },
  {
    id: "ocean",
    label: "Ocean",
    swatch: "#0ea5e9",
    vars: {
      "--ac-400": "56 189 248",
      "--ac-500": "14 165 233",
      "--ac-600": "2 132 199",
      "--ac-700": "3 105 161",
      "--ac-deep": "7 89 133",
      "--ac-hero-from": "12 74 110",
    },
  },
  {
    id: "emerald",
    label: "Emerald",
    swatch: "#10b981",
    vars: {
      "--ac-400": "52 211 153",
      "--ac-500": "16 185 129",
      "--ac-600": "5 150 105",
      "--ac-700": "4 120 87",
      "--ac-deep": "6 95 70",
      "--ac-hero-from": "6 78 59",
    },
  },
  {
    id: "amber",
    label: "Amber",
    swatch: "#f59e0b",
    vars: {
      "--ac-400": "251 191 36",
      "--ac-500": "245 158 11",
      "--ac-600": "217 119 6",
      "--ac-700": "180 83 9",
      "--ac-deep": "146 64 14",
      "--ac-hero-from": "120 53 15",
    },
  },
  {
    id: "crimson",
    label: "Crimson",
    swatch: "#ef4444",
    vars: {
      "--ac-400": "248 113 113",
      "--ac-500": "239 68 68",
      "--ac-600": "220 38 38",
      "--ac-700": "185 28 28",
      "--ac-deep": "153 27 27",
      "--ac-hero-from": "69 10 10",
    },
  },
];

export const DEFAULT_ACCENT = ACCENTS[0].id;

/** Apply an accent to the document by setting the `--ac-*` variables on <html>. */
export function applyAccent(id: string): void {
  const accent = ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];
  const root = document.documentElement;
  for (const [key, value] of Object.entries(accent.vars)) {
    root.style.setProperty(key, value);
  }
}
