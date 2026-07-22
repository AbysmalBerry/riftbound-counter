import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_ACCENT } from "@/theme/accents";

/**
 * Device-local app preferences (`rb.prefs`): vibration on every tap, the
 * animation kill-switch, and the chosen accent theme.
 */
interface PreferencesState {
  haptics: boolean;
  setHaptics: (on: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (on: boolean) => void;
  accent: string;
  setAccent: (id: string) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      haptics: true,
      setHaptics: (haptics) => set({ haptics }),
      reduceMotion: false,
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      accent: DEFAULT_ACCENT,
      setAccent: (accent) => set({ accent }),
    }),
    { name: "rb.prefs" },
  ),
);
