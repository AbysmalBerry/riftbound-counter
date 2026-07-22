import { useEffect } from "react";
import { create } from "zustand";
import type { Card } from "./types";
import { BUNDLED_CARDS, BUNDLED_SNAPSHOT } from "./data";
import { extractBuildId, normalizeCards } from "./normalize";
import { idbGet, idbSet } from "./idb";

/**
 * Same-origin proxy to the official card gallery. Riot's endpoint sends no CORS
 * header, so a browser can't hit it directly — Vite (dev) and nginx (prod)
 * forward `${BASE_URL}gallery/*` to playriftbound.com server-side. See
 * vite.config.ts and deploy/nginx-riftbound.conf.
 */
const GALLERY_PROXY = `${import.meta.env.BASE_URL}gallery`;

const STORE_KEY = "snapshot";

interface StoredSnapshot {
  fetchedAt: string;
  cards: Card[];
}

type Status = "idle" | "loading" | "success" | "error";

interface CardsState {
  cards: Card[];
  /** ISO timestamp of the active set (bundle date, or when last updated). */
  fetchedAt: string;
  /** True once a downloaded set (not the bundle) is in use. */
  updated: boolean;
  status: Status;
  error: string | null;
  hydrated: boolean;

  /** Load any previously-downloaded set from IndexedDB. Call once on boot. */
  hydrate: () => Promise<void>;
  /** Re-download the full card set through the proxy and persist it. */
  update: () => Promise<void>;
}

export const useCards = create<CardsState>((set, get) => ({
  cards: BUNDLED_CARDS,
  fetchedAt: BUNDLED_SNAPSHOT.fetchedAt,
  updated: false,
  status: "idle",
  error: null,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const stored = await idbGet<StoredSnapshot>(STORE_KEY);
      if (stored?.cards?.length) {
        set({ cards: stored.cards, fetchedAt: stored.fetchedAt, updated: true });
      }
    } catch {
      // A blocked/absent IndexedDB just means we stay on the bundled set.
    } finally {
      set({ hydrated: true });
    }
  },

  update: async () => {
    if (get().status === "loading") return;
    set({ status: "loading", error: null });
    try {
      const html = await (await fetch(`${GALLERY_PROXY}/en-us/card-gallery/`)).text();
      const buildId = extractBuildId(html);
      if (!buildId) throw new Error("Couldn't read the gallery version (is the proxy set up?).");

      const res = await fetch(`${GALLERY_PROXY}/_next/data/${buildId}/en-us/card-gallery.json`);
      if (!res.ok) throw new Error(`Gallery responded with ${res.status}.`);

      const cards = normalizeCards(await res.json());
      if (cards.length === 0) throw new Error("No cards found — the gallery format may have changed.");

      const fetchedAt = new Date().toISOString();
      await idbSet<StoredSnapshot>(STORE_KEY, { fetchedAt, cards });
      set({ cards, fetchedAt, updated: true, status: "success", error: null });
    } catch (err) {
      set({
        status: "error",
        error: err instanceof Error ? err.message : "Update failed.",
      });
    }
  },
}));

/** Load the downloaded card set (if any) once, when a card-aware page mounts. */
export function useHydrateCards(): void {
  const hydrate = useCards((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
}
