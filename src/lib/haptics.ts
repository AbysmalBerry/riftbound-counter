import { usePreferences } from "@/stores/usePreferences";

/** Vibration feedback on devices that support it (Android/PWA); silent no-op elsewhere. */
export function buzz(pattern: number | number[] = 10): void {
  try {
    if (!usePreferences.getState().haptics) return;
    navigator.vibrate?.(pattern);
  } catch {
    // vibration unavailable (iOS Safari, desktop) — feedback stays visual
  }
}
