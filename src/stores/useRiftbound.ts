import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  clampScore,
  clampCounter,
  clampBuffValue,
  defaultTeamName,
  winningTeamIndex,
  BUFF_NAME_MAX,
  NAME_MAX,
  THEME_IDS,
  WIN_1V1,
  type BuffCard,
  type GameMode,
  type Team,
  type ThemeId,
} from "@/features/games/riftbound";

const newId = (): string =>
  crypto.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** One finished (or abandoned) game, logged when the table is reset. */
export interface MatchRecord {
  id: string;
  mode: GameMode;
  winAt: number;
  /** Final standings, in seat order. */
  teams: { name: string; points: number; theme: ThemeId }[];
  /** Name of the team that reached the win threshold, or null. */
  winnerName: string | null;
  durationSec: number;
  endedAt: number; // epoch ms
}

/** Local-only history cap — oldest matches fall off. */
const HISTORY_CAP = 30;

/** Build a fresh set of teams, reusing prior names/themes/toggles by index. */
function makeTeams(count: number, size: number, prev: Team[] = []): Team[] {
  return Array.from({ length: count }, (_, i) => {
    const before = prev[i];
    // Keep custom names across mode changes, but re-label untouched defaults
    // ("Player 2" → "Team 2" and vice versa).
    const custom =
      before && !/^(Player|Team) \d+$/.test(before.name)
        ? before.name
        : undefined;
    return {
      id: newId(),
      name: custom ?? defaultTeamName(i, size),
      theme: before?.theme ?? THEME_IDS[i % THEME_IDS.length],
      size,
      points: 0,
      xp: 0,
      xpEnabled: before?.xpEnabled ?? true,
      buffsEnabled: before?.buffsEnabled ?? true,
      buffCards: [],
    };
  });
}

export interface MatchConfig {
  mode: GameMode;
  /** Number of scoring panels (teams / solo players). */
  teamCount: number;
  /** Players per panel (1 = solo / free-for-all). */
  teamSize: number;
  winAt: number;
}

/**
 * Riftbound match state (`riftbound.match`, device-local) — persisted so an
 * accidental reload mid-game doesn't wipe the score or the clock. Mode,
 * teams, seat settings and match history live here too, all local for now.
 */
interface RiftboundState {
  mode: GameMode;
  winAt: number;
  /** Players per team for custom setups (remembered between games). */
  teamSize: number;
  teams: Team[];
  /** Which team goes first this game — team id, null until the toss. */
  first: string | null;
  /** Clock seconds accumulated before the current running stretch. */
  elapsed: number;
  running: boolean;
  /** Epoch ms when the clock was last resumed; null while paused. */
  resumedAt: number | null;
  /** Past games, newest first. */
  history: MatchRecord[];

  addPoints: (teamId: string, delta: number) => void;
  addXp: (teamId: string, delta: number) => void;
  addBuffCard: (teamId: string, name: string, value: number) => void;
  adjustBuffCard: (teamId: string, id: string, delta: number) => void;
  removeBuffCard: (teamId: string, id: string) => void;
  setTeamName: (teamId: string, name: string) => void;
  setTeamTheme: (teamId: string, theme: ThemeId) => void;
  setXpEnabled: (teamId: string, on: boolean) => void;
  setBuffsEnabled: (teamId: string, on: boolean) => void;
  setFirst: (teamId: string) => void;
  toggleClock: () => void;
  /** Rebuild the table for a mode/size — keeps names & themes where it can. */
  configureMatch: (cfg: MatchConfig) => void;
  setWinAt: (n: number) => void;
  /** Logs the game to history (if anything happened), then zeroes the table. */
  reset: (clearNames?: boolean) => void;
  removeMatch: (id: string) => void;
  clearHistory: () => void;
}

/** Immutable update of one team by id. */
const patchTeam = (teams: Team[], id: string, fn: (t: Team) => Team): Team[] =>
  teams.map((t) => (t.id === id ? fn(t) : t));

export const useRiftbound = create<RiftboundState>()(
  persist(
    (set) => ({
      mode: "1v1",
      winAt: WIN_1V1,
      teamSize: 1,
      teams: makeTeams(2, 1),
      first: null,
      elapsed: 0,
      running: false,
      resumedAt: null,
      history: [],

      addPoints: (teamId, delta) =>
        set((s) => ({
          teams: patchTeam(s.teams, teamId, (t) => ({
            ...t,
            points: clampScore(t.points + delta, s.winAt),
          })),
        })),

      addXp: (teamId, delta) =>
        set((s) => ({
          teams: patchTeam(s.teams, teamId, (t) => ({
            ...t,
            xp: clampCounter(t.xp + delta),
          })),
        })),

      addBuffCard: (teamId, name, value) =>
        set((s) => ({
          teams: patchTeam(s.teams, teamId, (t) => ({
            ...t,
            buffCards: [
              ...t.buffCards,
              {
                id: newId(),
                name: name.trim().slice(0, BUFF_NAME_MAX) || "Buff",
                value: clampBuffValue(value),
              } satisfies BuffCard,
            ],
          })),
        })),

      adjustBuffCard: (teamId, id, delta) =>
        set((s) => ({
          teams: patchTeam(s.teams, teamId, (t) => ({
            ...t,
            buffCards: t.buffCards.map((c) =>
              c.id === id
                ? { ...c, value: clampBuffValue(c.value + delta) }
                : c,
            ),
          })),
        })),

      removeBuffCard: (teamId, id) =>
        set((s) => ({
          teams: patchTeam(s.teams, teamId, (t) => ({
            ...t,
            buffCards: t.buffCards.filter((c) => c.id !== id),
          })),
        })),

      setTeamName: (teamId, name) =>
        set((s) => ({
          teams: patchTeam(s.teams, teamId, (t) => {
            const i = s.teams.findIndex((x) => x.id === teamId);
            return {
              ...t,
              name:
                name.trim().slice(0, NAME_MAX) || defaultTeamName(i, t.size),
            };
          }),
        })),

      setTeamTheme: (teamId, theme) =>
        set((s) => ({
          teams: patchTeam(s.teams, teamId, (t) => ({ ...t, theme })),
        })),

      setXpEnabled: (teamId, on) =>
        set((s) => ({
          teams: patchTeam(s.teams, teamId, (t) => ({ ...t, xpEnabled: on })),
        })),

      setBuffsEnabled: (teamId, on) =>
        set((s) => ({
          teams: patchTeam(s.teams, teamId, (t) => ({
            ...t,
            buffsEnabled: on,
          })),
        })),

      setFirst: (teamId) => set({ first: teamId }),

      toggleClock: () =>
        set((s) =>
          s.running
            ? {
                running: false,
                resumedAt: null,
                elapsed:
                  s.elapsed +
                  (s.resumedAt ? (Date.now() - s.resumedAt) / 1000 : 0),
              }
            : { running: true, resumedAt: Date.now() },
        ),

      configureMatch: ({ mode, teamCount, teamSize, winAt }) =>
        set((s) => ({
          mode,
          winAt,
          teamSize,
          teams: makeTeams(teamCount, teamSize, s.teams),
          first: null,
          elapsed: 0,
          running: false,
          resumedAt: null,
        })),

      setWinAt: (n) => set({ winAt: n }),

      reset: (clearNames = false) =>
        set((s) => {
          const durationSec = Math.round(
            s.elapsed +
              (s.running && s.resumedAt
                ? (Date.now() - s.resumedAt) / 1000
                : 0),
          );
          const played = s.teams.some((t) => t.points > 0) || durationSec > 0;
          const winIdx = winningTeamIndex(
            s.teams.map((t) => t.points),
            s.winAt,
          );
          const record: MatchRecord = {
            id: newId(),
            mode: s.mode,
            winAt: s.winAt,
            teams: s.teams.map((t) => ({
              name: t.name,
              points: t.points,
              theme: t.theme,
            })),
            winnerName: winIdx >= 0 ? s.teams[winIdx].name : null,
            durationSec,
            endedAt: Date.now(),
          };
          return {
            teams: s.teams.map((t, i) => ({
              ...t,
              points: 0,
              xp: 0,
              buffCards: [],
              name: clearNames ? defaultTeamName(i, t.size) : t.name,
            })),
            first: null,
            elapsed: 0,
            running: false,
            resumedAt: null,
            history: played
              ? [record, ...s.history].slice(0, HISTORY_CAP)
              : s.history,
          };
        }),

      removeMatch: (id) =>
        set((s) => ({ history: s.history.filter((m) => m.id !== id) })),

      clearHistory: () => set({ history: [] }),
    }),
    {
      // Standalone app: no prior schema in the wild, so there is nothing to
      // migrate from. Bump `version` and add a `migrate` if the shape changes.
      name: "riftbound.match",
      version: 1,
    },
  ),
);
