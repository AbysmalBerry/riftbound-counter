import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Device-local app preferences (`rb.prefs`). The counter lives on a phone in
 * the middle of a table, so both of these are about physical comfort rather
 * than looks: vibration on every tap, and the animation kill-switch.
 */
interface PreferencesState {
  haptics: boolean;
  setHaptics: (on: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (on: boolean) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      haptics: true,
      setHaptics: (haptics) => set({ haptics }),
      reduceMotion: false,
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
    }),
    { name: "rb.prefs" },
  ),
);
