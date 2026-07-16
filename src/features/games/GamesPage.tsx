import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  History,
  Swords,
  Timer,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { useRiftbound } from "@/stores/useRiftbound";
import { fmtDuration } from "./riftbound";
import { buzz } from "@/lib/haptics";
import { cn } from "@/lib/utils";

type Tab = "games" | "history";

/** Riftbound games logged locally each time the table is reset. */
function HistoryTab() {
  const history = useRiftbound((s) => s.history);
  const removeMatch = useRiftbound((s) => s.removeMatch);
  const clearHistory = useRiftbound((s) => s.clearHistory);

  if (history.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 py-10 text-center">
        <History className="h-8 w-8 text-slate-600" />
        <p className="text-base font-medium text-slate-300">No matches yet</p>
        <p className="text-sm text-slate-500">
          Finished games land here when you reset the table.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle>Recent matches</CardTitle>
        <button
          onClick={clearHistory}
          title="Clear history"
          className="press rounded-lg p-1.5 text-slate-500 hover:bg-edge hover:text-slate-300"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {history.map((m) => (
          <li
            key={m.id}
            className="flex items-center gap-3 rounded-xl border border-edge/60 bg-elevated/40 px-3 py-2.5"
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                m.winnerName
                  ? "bg-amber-400/10 text-amber-300"
                  : "bg-edge/60 text-slate-500",
              )}
            >
              <Trophy className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-base font-semibold text-slate-200">
                {m.winnerName ? `${m.winnerName} won` : "Unfinished"}
              </span>
              <span className="block truncate text-sm text-slate-500">
                {m.mode === "custom" ? `${m.teams.length}-player` : m.mode} ·{" "}
                {m.teams.map((t) => t.points).join(" – ")}
              </span>
            </span>
            <span className="shrink-0 text-right text-sm text-slate-500">
              <span className="flex items-center justify-end gap-1 tnum">
                <Timer className="h-3.5 w-3.5" />
                {fmtDuration(m.durationSec)}
              </span>
              <span className="block text-xs">
                {new Date(m.endedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
                {" · "}
                {new Date(m.endedAt).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </span>
            <button
              onClick={() => {
                buzz(8);
                removeMatch(m.id);
              }}
              aria-label={`Delete match from ${new Date(m.endedAt).toLocaleDateString()}`}
              className="press shrink-0 rounded-lg p-1.5 text-slate-500 hover:bg-edge hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function GamesTab() {
  return (
    <>
      <Link
        to="/setup"
        onClick={() => buzz(10)}
        className="press block"
      >
        <div className="relative overflow-hidden rounded-2xl border border-edge/80 p-5 shadow-card">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,#03291f_0%,#065f46_38%,#7c4a10_70%,#452a05_100%)]" />
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="absolute -bottom-10 -left-6 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-black/35 shadow-lg backdrop-blur-sm">
              <Swords className="h-7 w-7 text-amber-200" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-xl font-bold text-white">
                Riftbound Counter
              </span>
              <span className="mt-0.5 block text-sm text-white/70">
                Two-seat tracker for the League of Legends TCG — set up players
                and counters, then play.
              </span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-white/70" />
          </div>
          <div className="relative mt-4 flex items-center gap-2 text-xs font-medium text-white/60">
            <Timer className="h-3.5 w-3.5" />
            Face-to-face layout — hand the phone to the table, not to each
            player.
          </div>
        </div>
      </Link>

      <p className="px-1 text-center text-xs text-slate-500">
        More table tools can land here later — dice, draft timer, life totals.
      </p>
    </>
  );
}

/** Games hub — table tools on one tab, local match history on the other. */
export default function GamesPage() {
  const [tab, setTab] = useState<Tab>("games");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      {/* Segmented tab switch */}
      <div className="flex rounded-xl border border-edge bg-panel p-1">
        {(
          [
            { id: "games", label: "Games", icon: Swords },
            { id: "history", label: "History", icon: History },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              buzz(8);
              setTab(id);
            }}
            className={cn(
              "press flex h-10 flex-1 items-center justify-center gap-2 rounded-lg text-base font-semibold transition-colors",
              tab === id ? "bg-brand/15 text-brand-400" : "text-slate-400",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "games" ? <GamesTab /> : <HistoryTab />}
    </div>
  );
}
