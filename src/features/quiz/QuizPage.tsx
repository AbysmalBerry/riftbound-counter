import { useMemo, useRef, useState } from "react";
import {
  Check,
  Flame,
  ListFilter,
  RotateCcw,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buzz } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { Ability } from "./Ability";
import { DOMAIN_COLORS, FILTER_OPTIONS, SNAPSHOT, eligible } from "./data";
import { mulberry32, nextQuestion } from "./quiz";
import { useQuiz } from "./useQuiz";
import type { Card as CardT, Filters, Question, QuizMode } from "./types";

/** Sanity CDN resize — request a display-sized image, not the full 744px art. */
function img(url: string, w = 520): string {
  return `${url}${url.includes("?") ? "&" : "?"}w=${w}&q=80&auto=format`;
}

const MODES: { id: QuizMode; label: string; hint: string }[] = [
  { id: "name", label: "Guess the name", hint: "See the art, name the card" },
  { id: "effect", label: "Guess the effect", hint: "See the art, pick its ability" },
];

/* -------------------------------------------------------------------------- */
/* Art window — cropped to the illustration so the name/effect stay hidden.    */
/* -------------------------------------------------------------------------- */

function ArtWindow({ card, revealed }: { card: CardT; revealed: boolean }) {
  return (
    <div
      className="relative mx-auto w-full max-w-[320px] overflow-hidden rounded-2xl border border-edge bg-panel shadow-card transition-[aspect-ratio] duration-500"
      style={{ aspectRatio: revealed ? "744 / 1039" : "744 / 600" }}
    >
      <img
        src={img(card.image, revealed ? 520 : 640)}
        alt={revealed ? card.name : "Mystery Riftbound card"}
        className="absolute left-0 top-0 w-full select-none"
        draggable={false}
      />
      {!revealed && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-panel to-transparent" />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Play view                                                                   */
/* -------------------------------------------------------------------------- */

function QuizPlay({
  mode,
  pool,
  onExit,
}: {
  mode: QuizMode;
  pool: CardT[];
  onExit: () => void;
}) {
  const record = useQuiz((s) => s.record);
  const rng = useRef(mulberry32((Date.now() & 0xffffffff) >>> 0)).current;
  const recent = useRef<string[]>([]);

  const draw = (): Question | null => {
    const q = nextQuestion(pool, mode, rng, recent.current);
    if (q) {
      recent.current = [q.card.id, ...recent.current].slice(0, 12);
    }
    return q;
  };

  const [question, setQuestion] = useState<Question | null>(draw);
  const [chosen, setChosen] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [seen, setSeen] = useState(0);
  const [hits, setHits] = useState(0);

  if (!question) {
    return (
      <Card className="text-center">
        <p className="text-slate-300">No cards match these filters.</p>
      </Card>
    );
  }

  const answered = chosen !== null;

  const pick = (i: number) => {
    if (answered) return;
    const right = i === question.answer;
    buzz(right ? 12 : 20);
    setChosen(i);
    const newStreak = right ? streak + 1 : 0;
    setStreak(newStreak);
    setSeen((n) => n + 1);
    if (right) setHits((n) => n + 1);
    record(right, newStreak);
  };

  const next = () => {
    buzz(8);
    setChosen(null);
    setQuestion(draw());
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      {/* Session bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            buzz(8);
            onExit();
          }}
          className="press flex items-center gap-1.5 rounded-lg border border-edge bg-panel px-3 py-1.5 text-sm text-slate-300"
        >
          <ListFilter className="h-4 w-4" /> Filters
        </button>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1 text-slate-400">
            <Target className="h-4 w-4" />
            <span className="tnum">
              {hits}/{seen}
            </span>
          </span>
          <span
            className={cn(
              "flex items-center gap-1 rounded-lg px-2 py-1 font-semibold tnum",
              streak >= 3 ? "bg-amber-400/15 text-amber-300" : "text-slate-400",
            )}
          >
            <Flame className={cn("h-4 w-4", streak >= 3 && "animate-flame-pulse")} />
            {streak}
          </span>
        </div>
      </div>

      <ArtWindow card={question.card} revealed={answered} />

      {/* Prompt + revealed identity */}
      <div className="text-center">
        {answered ? (
          <p className="font-display text-lg font-bold text-slate-100">
            {question.card.name}
            <span className="ml-2 text-sm font-normal text-slate-500">{question.card.code}</span>
          </p>
        ) : (
          <p className="text-sm font-medium text-slate-400">
            {mode === "name" ? "Which card is this?" : "What does this card do?"}
          </p>
        )}
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2.5">
        {question.options.map((opt, i) => {
          const isCorrect = i === question.answer;
          const isChosen = i === chosen;
          const state = !answered
            ? "idle"
            : isCorrect
              ? "correct"
              : isChosen
                ? "wrong"
                : "dim";
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={answered}
              className={cn(
                "press flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
                state === "idle" && "border-edge bg-panel hover:bg-edge/60",
                state === "correct" && "border-emerald-500/60 bg-emerald-500/15",
                state === "wrong" && "border-red-500/60 bg-red-500/15",
                state === "dim" && "border-edge/50 bg-panel/40 opacity-60",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                  state === "correct" && "border-emerald-400 bg-emerald-400 text-emerald-950",
                  state === "wrong" && "border-red-400 bg-red-400 text-red-950",
                  (state === "idle" || state === "dim") && "border-slate-600 text-slate-400",
                )}
              >
                {state === "correct" ? (
                  <Check className="h-3.5 w-3.5" />
                ) : state === "wrong" ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 text-sm",
                  mode === "name" ? "font-semibold text-slate-100" : "leading-relaxed text-slate-200",
                )}
              >
                {mode === "name" ? opt : <Ability text={opt} />}
              </span>
            </button>
          );
        })}
      </div>

      {answered && (
        <Button onClick={next} className="animate-pop-in w-full">
          Next card
        </Button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Setup view                                                                  */
/* -------------------------------------------------------------------------- */

function FilterGroup<K extends keyof Filters>({
  facet,
  label,
  options,
  render,
}: {
  facet: K;
  label: string;
  options: Filters[K];
  render?: (v: Filters[K][number]) => React.ReactNode;
}) {
  const active = useQuiz((s) => s.filters[facet]) as (string | number)[];
  const toggle = useQuiz((s) => s.toggleFacet);

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const on = active.includes(opt);
          return (
            <button
              key={String(opt)}
              onClick={() => {
                buzz(6);
                toggle(facet, opt as Filters[K][number]);
              }}
              className={cn(
                "press inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                on
                  ? "border-brand/60 bg-brand/15 text-brand-400"
                  : "border-edge bg-panel text-slate-300",
              )}
            >
              {render ? render(opt as Filters[K][number]) : String(opt)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuizSetup({ onStart }: { onStart: () => void }) {
  const mode = useQuiz((s) => s.mode);
  const setMode = useQuiz((s) => s.setMode);
  const filters = useQuiz((s) => s.filters);
  const clearFilters = useQuiz((s) => s.clearFilters);
  const { answered, correct, bestStreak, resetStats } = useQuiz();

  const count = useMemo(() => eligible(mode, filters).length, [mode, filters]);
  const anyFilter = Object.values(filters).some((a) => a.length > 0);
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      {/* Mode */}
      <div className="flex flex-col gap-2 rounded-xl border border-edge bg-panel p-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              buzz(8);
              setMode(m.id);
            }}
            className={cn(
              "press flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
              mode === m.id ? "bg-brand/15" : "hover:bg-edge/50",
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                mode === m.id ? "bg-brand/20 text-brand-400" : "bg-edge text-slate-400",
              )}
            >
              {m.id === "name" ? <Sparkles className="h-5 w-5" /> : <Target className="h-5 w-5" />}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block text-base font-semibold",
                  mode === m.id ? "text-slate-100" : "text-slate-300",
                )}
              >
                {m.label}
              </span>
              <span className="block text-xs text-slate-500">{m.hint}</span>
            </span>
            {mode === m.id && <Check className="h-5 w-5 shrink-0 text-brand-400" />}
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          {anyFilter && (
            <button
              onClick={() => {
                buzz(6);
                clearFilters();
              }}
              className="press text-xs font-medium text-brand-400"
            >
              Clear all
            </button>
          )}
        </div>
        <FilterGroup facet="types" label="Type" options={FILTER_OPTIONS.types} />
        <FilterGroup
          facet="domains"
          label="Domain"
          options={FILTER_OPTIONS.domains}
          render={(d) => (
            <>
              <span
                className="h-2.5 w-2.5 rounded-full ring-1 ring-white/20"
                style={{ backgroundColor: DOMAIN_COLORS[d as string] }}
              />
              {d}
            </>
          )}
        />
        <FilterGroup
          facet="might"
          label="Might"
          options={FILTER_OPTIONS.might}
          render={(m) => <>⚔ {m}</>}
        />
        <FilterGroup facet="sets" label="Set" options={FILTER_OPTIONS.sets} />
        <FilterGroup facet="rarities" label="Rarity" options={FILTER_OPTIONS.rarities} />
      </Card>

      <Button onClick={onStart} disabled={count < 2} className="w-full">
        {count < 2 ? "Not enough cards" : `Start — ${count} cards`}
      </Button>

      {/* Lifetime stats */}
      <Card className="flex items-center justify-between">
        <div className="flex gap-6">
          <div>
            <p className="text-2xl font-bold text-slate-100 tnum">{accuracy}%</p>
            <p className="text-xs text-slate-500">
              accuracy · {correct}/{answered}
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-2xl font-bold text-amber-300 tnum">
              <Flame className="h-5 w-5" />
              {bestStreak}
            </p>
            <p className="text-xs text-slate-500">best streak</p>
          </div>
        </div>
        {answered > 0 && (
          <button
            onClick={() => {
              buzz(8);
              resetStats();
            }}
            aria-label="Reset stats"
            className="press rounded-lg p-2 text-slate-500 hover:bg-edge hover:text-slate-300"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </Card>

      <p className="px-1 text-center text-xs text-slate-500">
        {SNAPSHOT.count} cards · snapshot {new Date(SNAPSHOT.fetchedAt).toLocaleDateString()}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Flashcard quiz — set filters + mode, then run an endless MCQ session. */
export default function QuizPage() {
  const [playing, setPlaying] = useState(false);
  const mode = useQuiz((s) => s.mode);
  const filters = useQuiz((s) => s.filters);
  const pool = useMemo(() => eligible(mode, filters), [mode, filters]);

  return playing ? (
    <QuizPlay mode={mode} pool={pool} onExit={() => setPlaying(false)} />
  ) : (
    <QuizSetup onStart={() => setPlaying(true)} />
  );
}
