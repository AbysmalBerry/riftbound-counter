import type { ThemeId } from "./riftbound";

export interface SeatTheme {
  bg: string;
  glow: string;
  ring: string;
  /** Small preview dot in the picker. */
  swatch: string;
  /** Toss-reveal coin face + its icon/text color. */
  coin: string;
  coinText: string;
}

/** Seat background themes, picked per player (defaults: gold for P1, jungle for P2). */
export const THEMES: Record<ThemeId, SeatTheme> = {
  gold: {
    bg: "bg-[linear-gradient(200deg,#452a05_0%,#7c4a10_45%,#1c0f02_100%)]",
    glow: "bg-amber-400/25",
    ring: "border-amber-300/30",
    swatch: "bg-[linear-gradient(200deg,#b45309,#452a05)]",
    coin: "border-amber-200/70 bg-[radial-gradient(circle_at_35%_30%,#fde68a,#b45309_70%)] shadow-[0_0_60px_rgba(251,191,36,0.55)]",
    coinText: "text-amber-950",
  },
  jungle: {
    bg: "bg-[linear-gradient(160deg,#03291f_0%,#065f46_45%,#02201c_100%)]",
    glow: "bg-emerald-400/20",
    ring: "border-emerald-300/30",
    swatch: "bg-[linear-gradient(200deg,#047857,#03291f)]",
    coin: "border-emerald-200/70 bg-[radial-gradient(circle_at_35%_30%,#a7f3d0,#047857_70%)] shadow-[0_0_60px_rgba(52,211,153,0.55)]",
    coinText: "text-emerald-950",
  },
  crimson: {
    bg: "bg-[linear-gradient(200deg,#450a0a_0%,#991b1b_45%,#1c0202_100%)]",
    glow: "bg-red-500/25",
    ring: "border-red-300/30",
    swatch: "bg-[linear-gradient(200deg,#991b1b,#450a0a)]",
    coin: "border-red-200/70 bg-[radial-gradient(circle_at_35%_30%,#fecaca,#991b1b_70%)] shadow-[0_0_60px_rgba(248,113,113,0.55)]",
    coinText: "text-red-950",
  },
  ocean: {
    bg: "bg-[linear-gradient(200deg,#082f49_0%,#0369a1_45%,#021a2e_100%)]",
    glow: "bg-sky-400/25",
    ring: "border-sky-300/30",
    swatch: "bg-[linear-gradient(200deg,#0369a1,#082f49)]",
    coin: "border-sky-200/70 bg-[radial-gradient(circle_at_35%_30%,#bae6fd,#0369a1_70%)] shadow-[0_0_60px_rgba(56,189,248,0.55)]",
    coinText: "text-sky-950",
  },
  violet: {
    bg: "bg-[linear-gradient(200deg,#2e1065_0%,#6d28d9_45%,#140425_100%)]",
    glow: "bg-violet-400/25",
    ring: "border-violet-300/30",
    swatch: "bg-[linear-gradient(200deg,#6d28d9,#2e1065)]",
    coin: "border-violet-200/70 bg-[radial-gradient(circle_at_35%_30%,#ddd6fe,#6d28d9_70%)] shadow-[0_0_60px_rgba(167,139,250,0.55)]",
    coinText: "text-violet-950",
  },
  slate: {
    bg: "bg-[linear-gradient(200deg,#1e293b_0%,#475569_45%,#0b1220_100%)]",
    glow: "bg-slate-400/20",
    ring: "border-slate-300/30",
    swatch: "bg-[linear-gradient(200deg,#475569,#1e293b)]",
    coin: "border-slate-200/70 bg-[radial-gradient(circle_at_35%_30%,#e2e8f0,#475569_70%)] shadow-[0_0_60px_rgba(148,163,184,0.5)]",
    coinText: "text-slate-950",
  },
  rose: {
    bg: "bg-[linear-gradient(200deg,#4c0519_0%,#be123c_45%,#1c0208_100%)]",
    glow: "bg-rose-400/25",
    ring: "border-rose-300/30",
    swatch: "bg-[linear-gradient(200deg,#be123c,#4c0519)]",
    coin: "border-rose-200/70 bg-[radial-gradient(circle_at_35%_30%,#fecdd3,#be123c_70%)] shadow-[0_0_60px_rgba(251,113,133,0.55)]",
    coinText: "text-rose-950",
  },
  teal: {
    bg: "bg-[linear-gradient(200deg,#042f2e_0%,#0d9488_45%,#021716_100%)]",
    glow: "bg-teal-400/25",
    ring: "border-teal-300/30",
    swatch: "bg-[linear-gradient(200deg,#0d9488,#042f2e)]",
    coin: "border-teal-200/70 bg-[radial-gradient(circle_at_35%_30%,#99f6e4,#0d9488_70%)] shadow-[0_0_60px_rgba(45,212,191,0.55)]",
    coinText: "text-teal-950",
  },
};
