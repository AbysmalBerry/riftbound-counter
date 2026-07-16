import { useEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronsUp,
  Coins,
  Crown,
  GripHorizontal,
  Medal,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Settings2,
  Shield,
  Sparkles,
  Swords,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { useRiftbound } from "@/stores/useRiftbound";
import { THEMES } from "./themes";
import {
  BUFF_NAME_MAX,
  BUFF_VALUE_MAX,
  buffTotal,
  fmtClock,
  winningTeamIndex,
  type Team,
} from "./riftbound";
import { buzz } from "@/lib/haptics";
import { cn } from "@/lib/utils";

/** Scoring button: Hold or Conquer — both are +1, the label is Riftbound flavor. */
function ScoreButton({
  onClick,
  label,
  icon: Icon,
  text,
  compact,
}: {
  onClick: () => void;
  label: string;
  icon: typeof Shield;
  text: string;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "press flex flex-col items-center justify-center gap-1 rounded-2xl border border-white/10 bg-black/45 text-white shadow-lg backdrop-blur-sm",
        compact ? "h-12 w-12 gap-0.5" : "h-[4.6rem] w-[4.6rem]",
      )}
    >
      <Icon className={compact ? "h-4 w-4" : "h-6 w-6"} />
      <span
        className={cn(
          "font-bold uppercase tracking-wide",
          compact ? "text-[9px]" : "text-xs",
        )}
      >
        {text}
      </span>
    </button>
  );
}

/**
 * Buff row that deletes on a sideways swipe (either direction). A grip handle
 * hints at the gesture. `flipped` mirrors pointer deltas so the rotated seat
 * drags naturally.
 */
function SwipeRow({
  flipped,
  onDelete,
  children,
}: {
  flipped?: boolean;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const pressed = useRef(false);
  const startX = useRef(0);

  const finish = () => {
    pressed.current = false;
    setDragging(false);
    if (Math.abs(dx) > 72) {
      buzz(20);
      onDelete();
    } else {
      setDx(0);
    }
  };

  return (
    <li className="relative overflow-hidden rounded-lg">
      {/* delete reveal behind the row */}
      <div className="absolute inset-0 flex items-center justify-between rounded-lg bg-red-500/25 px-3">
        <Trash2 className="h-4 w-4 text-red-200" />
        <Trash2 className="h-4 w-4 text-red-200" />
      </div>
      <div
        className={cn(
          "relative flex items-center gap-2 rounded-lg border border-white/10 bg-[#15151f] py-1.5 pl-2 pr-1.5",
          !dragging && "transition-transform duration-200",
        )}
        style={{ transform: `translateX(${dx}px)`, touchAction: "pan-y" }}
        onPointerDown={(e) => {
          pressed.current = true;
          startX.current = e.clientX;
        }}
        onPointerMove={(e) => {
          if (!pressed.current) return;
          const raw = e.clientX - startX.current;
          const local = flipped ? -raw : raw;
          // Capture only once it's clearly a drag, so the +/− taps still work.
          if (!dragging && Math.abs(local) > 10) {
            setDragging(true);
            e.currentTarget.setPointerCapture(e.pointerId);
          }
          if (dragging || Math.abs(local) > 10) setDx(local);
        }}
        onPointerUp={finish}
        onPointerCancel={finish}
      >
        <GripHorizontal className="h-4 w-4 shrink-0 text-white/25" />
        {children}
      </div>
    </li>
  );
}

/** In-panel buff dropdown (rotates with the seat): list of cards + add form. */
function BuffSheet({
  team,
  flipped,
  onClose,
}: {
  team: Team;
  flipped?: boolean;
  onClose: () => void;
}) {
  const cards = team.buffCards;
  const addBuffCard = useRiftbound((s) => s.addBuffCard);
  const adjustBuffCard = useRiftbound((s) => s.adjustBuffCard);
  const removeBuffCard = useRiftbound((s) => s.removeBuffCard);
  const [name, setName] = useState("");
  const [value, setValue] = useState(1);

  const submit = () => {
    buzz(10);
    addBuffCard(team.id, name, value);
    setName("");
    setValue(1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          "animate-pop-in w-full max-w-xs rounded-2xl border border-white/15 bg-[#0b0b14]/95 p-4 shadow-2xl",
          flipped && "rotate-180",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 font-display text-lg font-bold text-white">
            {team.name} buffs
            {cards.length > 0 && (
              <span className="flex items-center gap-0.5 rounded-lg border border-white/20 bg-white/10 px-2 py-0.5 text-sm font-bold">
                <ChevronsUp className="h-4 w-4" />
                <span className="font-score text-lg leading-none tnum">
                  {buffTotal(cards)}
                </span>
              </span>
            )}
          </p>
          <button
            onClick={onClose}
            aria-label="Close buffs"
            className="press rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cards in play */}
        {cards.length > 0 ? (
          <>
            <ul className="mt-3 flex max-h-44 flex-col gap-1.5 overflow-y-auto">
              {cards.map((c) => (
                <SwipeRow
                  key={c.id}
                  flipped={flipped}
                  onDelete={() => removeBuffCard(team.id, c.id)}
                >
                  <span className="min-w-0 flex-1 truncate text-base text-white">
                    {c.name}
                  </span>
                  <span className="flex shrink-0 items-center rounded-lg border border-white/15 bg-black/40">
                    <button
                      onClick={() => {
                        buzz(8);
                        adjustBuffCard(team.id, c.id, -1);
                      }}
                      aria-label={`${c.name}: minus 1`}
                      className="press flex h-8 w-9 items-center justify-center text-white/70"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-score text-xl font-semibold leading-none text-white tnum">
                      {c.value}
                    </span>
                    <button
                      onClick={() => {
                        buzz(8);
                        adjustBuffCard(team.id, c.id, 1);
                      }}
                      aria-label={`${c.name}: plus 1`}
                      className="press flex h-8 w-9 items-center justify-center text-white/70"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </span>
                </SwipeRow>
              ))}
            </ul>
            <p className="mt-2 flex items-center gap-1 text-xs text-white/40">
              <GripHorizontal className="h-3.5 w-3.5" />
              Swipe a card sideways to remove it.
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-white/50">
            No buffs in play — add the card and how much it grants.
          </p>
        )}

        {/* Add a card */}
        <div className="mt-3 border-t border-white/10 pt-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            maxLength={BUFF_NAME_MAX}
            placeholder="Card name"
            className="h-11 w-full rounded-lg border border-white/15 bg-black/40 px-3 text-base text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
          />
          <div className="mt-2 flex items-center gap-2">
            <div className="flex h-10 shrink-0 items-center rounded-lg border border-white/15 bg-black/40">
              <button
                onClick={() => setValue((v) => Math.max(1, v - 1))}
                aria-label="Decrease buff value"
                className="press flex h-full w-10 items-center justify-center text-white/70"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-9 text-center font-score text-2xl font-semibold leading-none text-white tnum">
                {value}
              </span>
              <button
                onClick={() => setValue((v) => Math.min(BUFF_VALUE_MAX, v + 1))}
                aria-label="Increase buff value"
                className="press flex h-full w-10 items-center justify-center text-white/70"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button className="h-10 flex-1" onClick={submit}>
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Editable name chip shared by both panel variants. */
function NameChip({
  team,
  compact,
  isFirst,
}: {
  team: Team;
  compact?: boolean;
  isFirst: boolean;
}) {
  const setTeamName = useRiftbound((s) => s.setTeamName);
  const [editing, setEditing] = useState(false);
  return (
    <div className="flex items-center gap-2">
      {isFirst && (
        <span className="animate-pop-in flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-sm font-bold text-white shadow-lg">
          <Medal className="h-4 w-4" />
          1st
        </span>
      )}
      {editing ? (
        <input
          autoFocus
          defaultValue={team.name}
          maxLength={14}
          onFocus={(e) => e.target.select()}
          onBlur={(e) => {
            setTeamName(team.id, e.target.value);
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur();
          }}
          className="w-40 rounded-full border border-white/30 bg-black/50 px-4 py-1 text-center text-base font-semibold text-white outline-none backdrop-blur-sm"
        />
      ) : (
        <button
          onClick={() => {
            buzz(8);
            setEditing(true);
          }}
          title="Tap to rename"
          className={cn(
            "press rounded-full border border-white/10 bg-black/40 font-semibold text-slate-100 backdrop-blur-sm",
            compact ? "px-3 py-0.5 text-sm" : "px-5 py-1.5 text-base",
          )}
        >
          {team.name}
        </button>
      )}
    </div>
  );
}

/** XP stepper pill. */
function XpPill({ team, ring }: { team: Team; ring: string }) {
  const addXp = useRiftbound((s) => s.addXp);
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-white/70">
        <Sparkles className="h-4 w-4" />
        XP
      </span>
      <span
        className={cn(
          "flex items-center gap-1 rounded-full border bg-black/45 p-1 backdrop-blur-sm",
          ring,
        )}
      >
        <button
          onClick={() => {
            buzz(8);
            addXp(team.id, -1);
          }}
          aria-label={`${team.name}: minus 1 XP`}
          className="press flex h-8 w-8 items-center justify-center rounded-full text-white/80"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-6 text-center font-score text-2xl font-semibold leading-none text-white tnum">
          {team.xp}
        </span>
        <button
          onClick={() => {
            buzz(8);
            addXp(team.id, 1);
          }}
          aria-label={`${team.name}: plus 1 XP`}
          className="press flex h-8 w-8 items-center justify-center rounded-full text-white/80"
        >
          <Plus className="h-4 w-4" />
        </button>
      </span>
    </div>
  );
}

/** Buff dropdown trigger pill. */
function BuffPill({
  team,
  ring,
  onOpen,
}: {
  team: Team;
  ring: string;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={() => {
        buzz(8);
        onOpen();
      }}
      aria-label={`${team.name}: buffs`}
      className={cn(
        "press flex h-10 shrink-0 items-center gap-1.5 rounded-full border bg-black/45 px-3.5 text-sm font-semibold text-white backdrop-blur-sm",
        ring,
      )}
    >
      <ChevronsUp className="h-4 w-4" />
      Buffs
      {team.buffCards.length > 0 && (
        <span className="font-score text-xl leading-none tnum">
          {buffTotal(team.buffCards)}
        </span>
      )}
      <ChevronDown className="h-4 w-4 text-white/60" />
    </button>
  );
}

/** One team's panel — full (2-up face-to-face) or compact (grid cell). */
function TeamPanel({
  team,
  winAt,
  compact,
  flipped,
  wide,
  className,
}: {
  team: Team;
  winAt: number;
  compact?: boolean;
  flipped?: boolean;
  /** Compact cell spanning the whole row (odd team counts) — roomier type. */
  wide?: boolean;
  className?: string;
}) {
  const isFirst = useRiftbound((s) => s.first) === team.id;
  const addPoints = useRiftbound((s) => s.addPoints);
  const [buffsOpen, setBuffsOpen] = useState(false);
  const theme = THEMES[team.theme] ?? THEMES.gold;
  const won = team.points >= winAt;

  const score = (delta: number) => {
    buzz(team.points + delta >= winAt && delta > 0 ? [30, 60, 30] : 12);
    addPoints(team.id, delta);
  };

  const dressing = (
    <>
      <div className={cn("absolute inset-0", theme.bg)} />
      <div
        className={cn(
          "absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl",
          theme.glow,
        )}
      />
      {won && (
        <>
          <div className="animate-pop-in absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(251,191,36,0.25),transparent_65%)]" />
          <div className="absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </>
      )}
    </>
  );

  const scoreText = (
    <span
      key={team.points}
      className={cn(
        "animate-pop-in font-score font-normal tnum",
        // leading-none must follow the size or tailwind-merge drops it
        compact
          ? wide
            ? "text-8xl leading-none"
            : "text-6xl leading-none"
          : "text-[150px] leading-none",
        won
          ? "text-amber-100 drop-shadow-[0_0_28px_rgba(251,191,36,0.85)]"
          : "text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]",
      )}
    >
      {team.points}
    </span>
  );

  const victoryBadge = won && (
    <div
      className={cn(
        "animate-pop-in flex items-center gap-2 rounded-full border border-amber-300/50 bg-amber-400/15 font-bold text-amber-200 shadow-[0_0_30px_rgba(251,191,36,0.35)]",
        compact ? "px-2.5 py-0.5 text-xs" : "px-4 py-1.5 text-base",
      )}
    >
      <Crown
        className={cn(
          "animate-flame-pulse",
          compact ? "h-3.5 w-3.5" : "h-5 w-5",
        )}
      />
      Victory!
    </div>
  );

  const sheet = buffsOpen && (
    <BuffSheet
      team={team}
      flipped={flipped}
      onClose={() => setBuffsOpen(false)}
    />
  );

  // Compact grid cell
  if (compact) {
    return (
      <div
        className={cn(
          "relative h-full overflow-hidden",
          flipped && "rotate-180",
          className,
        )}
      >
        {dressing}
        <div className="relative flex h-full flex-col items-center justify-center gap-1.5 p-2">
          <NameChip team={team} compact isFirst={isFirst} />
          {victoryBadge}
          {scoreText}
          <div className="flex items-center gap-2">
            <ScoreButton
              compact
              onClick={() => score(1)}
              label={`${team.name}: hold, plus 1`}
              icon={Shield}
              text="Hold"
            />
            <button
              onClick={() => score(-1)}
              aria-label={`${team.name}: minus 1 point`}
              className="press flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/80 backdrop-blur-sm"
            >
              <Minus className="h-5 w-5" />
            </button>
            <ScoreButton
              compact
              onClick={() => score(1)}
              label={`${team.name}: conquer, plus 1`}
              icon={Swords}
              text="Conquer"
            />
          </div>
          {(team.xpEnabled || team.buffsEnabled) && (
            <div className="mt-0.5 flex flex-wrap items-center justify-center gap-1.5">
              {team.buffsEnabled && (
                <BuffPill
                  team={team}
                  ring={theme.ring}
                  onOpen={() => setBuffsOpen(true)}
                />
              )}
              {team.xpEnabled && <XpPill team={team} ring={theme.ring} />}
            </div>
          )}
        </div>
        {sheet}
      </div>
    );
  }

  // Full 2-up panel
  return (
    <div
      className={cn(
        "relative flex-1 overflow-hidden",
        flipped && "rotate-180 landscape:rotate-0",
      )}
    >
      {dressing}
      <div className="relative flex h-full flex-col items-center p-4">
        <NameChip team={team} isFirst={isFirst} />

        {/* pb keeps the centered group clear of the absolute pill strip below */}
        <div className="flex flex-1 flex-col items-center justify-center pb-12">
          {won ? victoryBadge : <div className="h-9" />}
          {scoreText}
          <button
            onClick={() => score(-1)}
            aria-label={`${team.name}: minus 1 point`}
            className="press -mt-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/80 backdrop-blur-sm"
          >
            <Minus className="h-6 w-6" />
          </button>
        </div>

        <div className="absolute left-4 top-[42%] -translate-y-1/2">
          <ScoreButton
            onClick={() => score(1)}
            label={`${team.name}: hold battlefield, plus 1 point`}
            icon={Shield}
            text="Hold"
          />
        </div>
        <div className="absolute right-4 top-[42%] -translate-y-1/2">
          <ScoreButton
            onClick={() => score(1)}
            label={`${team.name}: conquer battlefield, plus 1 point`}
            icon={Swords}
            text="Conquer"
          />
        </div>

        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
          {team.buffsEnabled ? (
            <BuffPill
              team={team}
              ring={theme.ring}
              onOpen={() => setBuffsOpen(true)}
            />
          ) : (
            <span />
          )}
          {team.xpEnabled && <XpPill team={team} ring={theme.ring} />}
        </div>
      </div>
      {sheet}
    </div>
  );
}

/**
 * Full-screen Riftbound counter — rendered outside the AppShell so the whole
 * viewport is the table. Two teams get the face-to-face layout; 3+ tile a grid.
 */
export default function RiftboundCounterPage() {
  const navigate = useNavigate();
  const teams = useRiftbound((s) => s.teams);
  const winAt = useRiftbound((s) => s.winAt);
  const first = useRiftbound((s) => s.first);
  const elapsed = useRiftbound((s) => s.elapsed);
  const running = useRiftbound((s) => s.running);
  const resumedAt = useRiftbound((s) => s.resumedAt);
  const toggleClock = useRiftbound((s) => s.toggleClock);
  const setFirst = useRiftbound((s) => s.setFirst);
  const reset = useRiftbound((s) => s.reset);

  const [toss, setToss] = useState<
    | { phase: "spin"; kind: "toss" | "flip" }
    | { phase: "reveal"; kind: "toss"; teamId: string }
    | { phase: "reveal"; kind: "flip"; face: "Heads" | "Tails" }
    | null
  >(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [alsoNames, setAlsoNames] = useState(false);

  const tossTimers = useRef<number[]>([]);
  useEffect(() => () => tossTimers.current.forEach(clearTimeout), []);

  const [, tick] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    void (async () => {
      try {
        lock = (await navigator.wakeLock?.request("screen")) ?? null;
      } catch {
        // wake lock unavailable — screen may dim as usual
      }
    })();
    return () => {
      void lock?.release().catch(() => {});
    };
  }, []);

  const clock = fmtClock(
    elapsed + (running && resumedAt ? (Date.now() - resumedAt) / 1000 : 0),
  );

  /**
   * Before anyone goes first this is the opening toss (picks a random team);
   * afterwards it's a plain heads/tails flip for card effects. Reset clears
   * `first`, so a fresh game gets the toss back.
   */
  const doToss = () => {
    if (toss) return;
    const kind = first === null ? "toss" : "flip";
    buzz(15);
    setToss({ phase: "spin", kind });
    tossTimers.current.push(
      window.setTimeout(() => {
        if (kind === "toss") {
          const t = teams[Math.floor(Math.random() * teams.length)];
          setFirst(t.id);
          setToss({ phase: "reveal", kind, teamId: t.id });
          if (!useRiftbound.getState().running) toggleClock();
        } else {
          setToss({
            phase: "reveal",
            kind,
            face: Math.random() < 0.5 ? "Heads" : "Tails",
          });
        }
        buzz([30, 60, 30]);
        tossTimers.current.push(window.setTimeout(() => setToss(null), 1700));
      }, 1400),
    );
  };

  const tossTeam =
    toss?.phase === "reveal" && toss.kind === "toss"
      ? teams.find((t) => t.id === toss.teamId)
      : undefined;
  const revealText =
    toss?.phase !== "reveal"
      ? toss?.kind === "flip"
        ? "Flipping…"
        : "Tossing…"
      : toss.kind === "toss"
        ? `${tossTeam?.name ?? "Player"} goes first!`
        : `${toss.face}!`;

  const twoUp = teams.length === 2;
  const cols = 2;
  const rows = Math.ceil(teams.length / cols);
  const gridFlipped = (i: number) =>
    Math.floor(i / cols) < Math.floor(rows / 2);

  const winIdx = winningTeamIndex(
    teams.map((t) => t.points),
    winAt,
  );

  const controlBar = (
    <div
      className={cn(
        "relative z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-y border-edge bg-ink/95 px-3",
        twoUp &&
          "landscape:h-auto landscape:w-20 landscape:flex-col landscape:border-x landscape:border-y-0 landscape:px-0 landscape:py-3",
      )}
    >
      <div
        className={cn("flex items-center gap-2", twoUp && "landscape:flex-col")}
      >
        <button
          onClick={() => navigate("/setup")}
          aria-label="Match settings"
          className="press flex h-11 w-11 items-center justify-center rounded-full border border-edge bg-panel text-slate-200"
        >
          <Settings2 className="h-5 w-5" />
        </button>
        <button
          onClick={() => {
            buzz(10);
            toggleClock();
          }}
          aria-label={running ? "Pause clock" : "Start clock"}
          className={cn(
            "press flex h-11 items-center gap-2 rounded-full border px-4 font-score text-2xl font-semibold tnum",
            twoUp &&
              "landscape:h-auto landscape:flex-col landscape:gap-1 landscape:px-2 landscape:py-2.5",
            running
              ? "border-brand/40 bg-brand/10 text-brand-400"
              : "border-edge bg-panel text-slate-200",
          )}
        >
          {running ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          <span className="leading-none">{clock}</span>
        </button>
      </div>

      <div
        className={cn("flex items-center gap-2", twoUp && "landscape:flex-col")}
      >
        <button
          onClick={() => {
            setAlsoNames(false);
            setConfirmReset(true);
          }}
          aria-label="Reset match"
          className="press flex h-11 w-11 items-center justify-center rounded-full border border-edge bg-panel text-slate-200"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        <button
          onClick={doToss}
          className={cn(
            "press flex h-11 items-center gap-1.5 rounded-full border px-4 text-base font-bold",
            twoUp &&
              "landscape:h-auto landscape:flex-col landscape:gap-1 landscape:px-2 landscape:py-2.5",
            toss
              ? "border-brand/40 bg-brand/10 text-brand-400"
              : "border-edge bg-panel text-slate-200",
          )}
        >
          {first === null ? (
            <Medal className="h-4 w-4" />
          ) : (
            <Coins className="h-4 w-4" />
          )}
          {first === null ? "Toss" : "Flip"}
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 flex select-none flex-col overflow-hidden bg-ink touch-manipulation",
        twoUp && "landscape:flex-row",
      )}
    >
      {twoUp ? (
        <>
          <TeamPanel team={teams[1]} winAt={winAt} flipped />
          {controlBar}
          <TeamPanel team={teams[0]} winAt={winAt} />
        </>
      ) : (
        <>
          <div
            className="grid flex-1 grid-cols-2 gap-px overflow-hidden"
            style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
          >
            {teams.map((t, i) => (
              <TeamPanel
                key={t.id}
                team={t}
                winAt={winAt}
                compact
                flipped={gridFlipped(i)}
                // Odd counts: the last seat takes the whole bottom row instead
                // of leaving a dead cell.
                wide={teams.length % 2 === 1 && i === teams.length - 1}
                className={
                  teams.length % 2 === 1 && i === teams.length - 1
                    ? "col-span-2"
                    : undefined
                }
              />
            ))}
          </div>
          {controlBar}
        </>
      )}

      {/* Victory confetti over the whole table (re-fires when a team wins) */}
      {winIdx >= 0 && <ConfettiBurst key={teams[winIdx].id} count={44} />}

      {/* Coin overlay — opening toss picks the first team; later flips are heads/tails */}
      {toss && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          {toss.phase === "reveal" && toss.kind === "toss" && (
            <ConfettiBurst count={32} />
          )}
          <p className="rotate-180 font-display text-2xl font-bold text-white drop-shadow-lg">
            {revealText}
          </p>
          <div style={{ perspective: "600px" }}>
            {toss.phase === "spin" ? (
              <div className="animate-coin-flip flex h-28 w-28 items-center justify-center rounded-full border-4 border-amber-200/70 bg-[radial-gradient(circle_at_35%_30%,#fde68a,#d97706_70%)] shadow-[0_0_60px_rgba(251,191,36,0.45)]">
                <Medal className="h-12 w-12 text-amber-900" />
              </div>
            ) : toss.kind === "toss" ? (
              <div
                className={cn(
                  "animate-pop-in flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 px-2 text-center",
                  (THEMES[tossTeam?.theme ?? "gold"] ?? THEMES.gold).coin,
                )}
              >
                <Medal
                  className={cn(
                    "h-7 w-7",
                    (THEMES[tossTeam?.theme ?? "gold"] ?? THEMES.gold).coinText,
                  )}
                />
                <span
                  className={cn(
                    "max-w-full truncate font-display text-sm font-extrabold",
                    (THEMES[tossTeam?.theme ?? "gold"] ?? THEMES.gold).coinText,
                  )}
                >
                  {tossTeam?.name}
                </span>
              </div>
            ) : (
              <div className="animate-pop-in flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 border-amber-200/70 bg-[radial-gradient(circle_at_35%_30%,#fde68a,#b45309_70%)] shadow-[0_0_60px_rgba(251,191,36,0.55)]">
                {toss.face === "Heads" ? (
                  <Crown className="h-8 w-8 text-amber-950" />
                ) : (
                  <Shield className="h-8 w-8 text-amber-950" />
                )}
                <span className="font-score text-3xl font-bold leading-none text-amber-950">
                  {toss.face === "Heads" ? "H" : "T"}
                </span>
              </div>
            )}
          </div>
          <p className="font-display text-2xl font-bold text-white drop-shadow-lg">
            {revealText}
          </p>
        </div>
      )}

      {/* Reset confirmation */}
      {confirmReset && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setConfirmReset(false)}
        >
          <div
            className="w-full max-w-xs rounded-2xl border border-edge bg-panel p-5 shadow-2xl animate-pop-in"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-display text-lg font-bold text-slate-100">
              Reset match?
            </p>
            <p className="mt-1 text-sm text-slate-400">
              The match is saved to history, then points, XP, buffs, the clock
              and the toss go back to zero.
            </p>
            <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={alsoNames}
                onChange={(e) => setAlsoNames(e.target.checked)}
                className="h-4 w-4 rounded accent-brand"
              />
              Also reset names
            </label>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmReset(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  buzz(20);
                  reset(alsoNames);
                  navigate("/setup");
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
