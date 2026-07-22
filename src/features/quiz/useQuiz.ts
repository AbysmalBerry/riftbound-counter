import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Filters, QuizMode } from "./types";
import { EMPTY_FILTERS } from "./data";

type Facet = keyof Filters;

interface QuizState {
  mode: QuizMode;
  filters: Filters;
  /** Lifetime scoreboard, kept across sessions. */
  answered: number;
  correct: number;
  bestStreak: number;

  setMode: (mode: QuizMode) => void;
  toggleFacet: <K extends Facet>(facet: K, value: Filters[K][number]) => void;
  clearFilters: () => void;
  record: (wasCorrect: boolean, streak: number) => void;
  resetStats: () => void;
}

export const useQuiz = create<QuizState>()(
  persist(
    (set) => ({
      mode: "name",
      filters: EMPTY_FILTERS,
      answered: 0,
      correct: 0,
      bestStreak: 0,

      setMode: (mode) => set({ mode }),

      toggleFacet: (facet, value) =>
        set((s) => {
          const current = s.filters[facet] as (typeof value)[];
          const next = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
          return { filters: { ...s.filters, [facet]: next } };
        }),

      clearFilters: () => set({ filters: EMPTY_FILTERS }),

      record: (wasCorrect, streak) =>
        set((s) => ({
          answered: s.answered + 1,
          correct: s.correct + (wasCorrect ? 1 : 0),
          bestStreak: Math.max(s.bestStreak, streak),
        })),

      resetStats: () => set({ answered: 0, correct: 0, bestStreak: 0 }),
    }),
    {
      name: "rb.quiz",
      // Don't persist mid-flight; only preferences + lifetime stats.
      partialize: (s) => ({
        mode: s.mode,
        filters: s.filters,
        answered: s.answered,
        correct: s.correct,
        bestStreak: s.bestStreak,
      }),
    },
  ),
);
