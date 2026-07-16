import { useEffect } from "react";
import { usePreferences } from "@/stores/usePreferences";

/** Mirrors the "Reduce motion" preference onto <html> for the CSS kill-switch. */
export function useApplyPreferences(): void {
  const reduceMotion = usePreferences((s) => s.reduceMotion);
  useEffect(() => {
    document.documentElement.dataset.motion = reduceMotion ? "off" : "on";
  }, [reduceMotion]);
}
