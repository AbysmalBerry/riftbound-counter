import { useEffect } from "react";
import { usePreferences } from "@/stores/usePreferences";
import { applyAccent } from "@/theme/accents";

/** Mirrors device preferences onto <html>: the motion kill-switch + accent theme. */
export function useApplyPreferences(): void {
  const reduceMotion = usePreferences((s) => s.reduceMotion);
  const accent = usePreferences((s) => s.accent);

  useEffect(() => {
    document.documentElement.dataset.motion = reduceMotion ? "off" : "on";
  }, [reduceMotion]);

  useEffect(() => {
    applyAccent(accent);
  }, [accent]);
}
