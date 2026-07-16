import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronsUp,
  Crown,
  Flag,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Shield,
  Swords,
  Users,
  X,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useRiftbound } from "@/stores/useRiftbound";
import { THEMES } from "./themes";
import {
  NAME_MAX,
  BUFF_NAME_MAX,
  BUFF_VALUE_MAX,
  MAX_PLAYERS,
  THEME_IDS,
  WIN_MAX,
  WIN_MIN,
  buffTotal,
  defaultWinAt,
  type GameMode,
  type Team,
} from "./riftbound";
import { buzz } from "@/lib/haptics";
import { cn } from "@/lib/utils";

/** Compact −/value/+ stepper used across the setup controls. */
function Stepper({
  value,
  min,
  max,
  onChange,
  label,
  format = (n) => String(n),
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  label: string;
  format?: (n: number) => string;
}) {
  return (
    <div className="flex h-10 shrink-0 items-center rounded-lg border border-edge bg-elevated">
      <button
        onClick={() => {
          buzz(8);
          onChange(Math.max(min, value - 1));
        }}
        aria-label={`Decrease ${label}`}
        className="press flex h-full w-10 items-center justify-center text-slate-400"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-10 px-1 text-center font-score text-xl font-semibold leading-none text-slate-100 tnum">
        {format(value)}
      </span>
      <button
        onClick={() => {
          buzz(8);
          onChange(Math.min(max, value + 1));
        }}
        aria-label={`Increase ${label}`}
        className="press flex h-full w-10 items-center justify-center text-slate-400"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Inline add-a-buff form: card name + value stepper. */
function BuffForm({ teamId }: { teamId: string }) {
  const addBuffCard = useRiftbound((s) => s.addBuffCard);
  const [name, setName] = useState("");
  const [value, setValue] = useState(1);

  const submit = () => {
    buzz(10);
    addBuffCard(teamId, name, value);
    setName("");
    setValue(1);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        maxLength={BUFF_NAME_MAX}
        placeholder="Card name"
        className="h-10 min-w-0 flex-1 rounded-lg border border-edge bg-elevated px-3 text-base text-slate-100 placeholder:text-slate-500 focus:border-brand/50 focus:outline-none"
      />
      <Stepper
        value={value}
        min={1}
        max={BUFF_VALUE_MAX}
        onChange={setValue}
        label="buff value"
      />
      <button
        onClick={submit}
        aria-label="Add buff"
        className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand text-white"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}

/** One team's settings: name, seat color, and which counters show. */
function TeamSettings({ team }: { team: Team }) {
  const setTeamName = useRiftbound((s) => s.setTeamName);
  const setTeamTheme = useRiftbound((s) => s.setTeamTheme);
  const setXpEnabled = useRiftbound((s) => s.setXpEnabled);
  const setBuffsEnabled = useRiftbound((s) => s.setBuffsEnabled);
  const removeBuffCard = useRiftbound((s) => s.removeBuffCard);
  const theme = THEMES[team.theme] ?? THEMES.gold;

  return (
    <Card>
      {/* Name */}
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "h-9 w-9 shrink-0 rounded-full border border-white/15",
            theme.swatch,
          )}
        />
        <input
          defaultValue={team.name}
          key={team.name}
          maxLength={NAME_MAX}
          onFocus={(e) => e.target.select()}
          onBlur={(e) => setTeamName(team.id, e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          aria-label={`${team.name} name`}
          className="h-11 min-w-0 flex-1 rounded-lg border border-edge bg-elevated px-3 text-lg font-semibold text-slate-100 focus:border-brand/50 focus:outline-none"
        />
        {team.size > 1 && (
          <span className="flex shrink-0 items-center gap-1 rounded-lg border border-edge bg-elevated px-2.5 py-1.5 text-sm text-slate-400">
            <Users className="h-4 w-4" />
            {team.size}
          </span>
        )}
      </div>

      {/* Seat color */}
      <p className="mt-4 text-sm font-medium text-slate-400">Seat color</p>
      <div className="mt-2 flex flex-wrap items-center gap-2.5">
        {THEME_IDS.map((id) => (
          <button
            key={id}
            onClick={() => {
              buzz(8);
              setTeamTheme(team.id, id);
            }}
            aria-label={`${team.name}: ${id} background`}
            className={cn(
              "h-9 w-9 rounded-full border",
              THEMES[id].swatch,
              id === team.theme
                ? "border-white ring-2 ring-brand/70"
                : "border-white/15",
            )}
          />
        ))}
      </div>

      {/* Counter toggles */}
      <div className="mt-4 flex flex-col divide-y divide-edge/60 rounded-xl border border-edge/60 bg-elevated/40">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-base text-slate-200">XP counter</span>
          <Switch
            checked={team.xpEnabled}
            onChange={(on) => setXpEnabled(team.id, on)}
            aria-label={`${team.name}: XP counter`}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-base text-slate-200">Buff cards</span>
          <Switch
            checked={team.buffsEnabled}
            onChange={(on) => setBuffsEnabled(team.id, on)}
            aria-label={`${team.name}: buff cards`}
          />
        </div>
      </div>

      {/* Buff cards in play */}
      {team.buffsEnabled && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400">Buffs in play</p>
            {team.buffCards.length > 0 && (
              <span className="flex items-center gap-1 text-sm font-semibold text-brand-400">
                <ChevronsUp className="h-4 w-4" />
                {buffTotal(team.buffCards)} total
              </span>
            )}
          </div>
          {team.buffCards.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {team.buffCards.map((c) => (
                <span
                  key={c.id}
                  className="flex items-center gap-1.5 rounded-lg border border-edge bg-elevated py-1.5 pl-3 pr-1.5 text-base text-slate-200"
                >
                  {c.name}
                  <span className="font-score text-lg font-semibold leading-none text-brand-400">
                    {c.value}
                  </span>
                  <button
                    onClick={() => {
                      buzz(8);
                      removeBuffCard(team.id, c.id);
                    }}
                    aria-label={`Remove ${c.name}`}
                    className="press rounded-md p-1 text-slate-500 hover:bg-edge hover:text-slate-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="mt-2">
            <BuffForm teamId={team.id} />
          </div>
        </div>
      )}
    </Card>
  );
}

const MODES: { id: GameMode; label: string }[] = [
  { id: "1v1", label: "1v1" },
  { id: "2v2", label: "2v2" },
  { id: "custom", label: "Custom" },
];

/** Custom-match controls: team size, team count and win score. */
function CustomControls() {
  const teamSize = useRiftbound((s) => s.teamSize);
  const winAt = useRiftbound((s) => s.winAt);
  const teamCount = useRiftbound((s) => s.teams.length);
  const configureMatch = useRiftbound((s) => s.configureMatch);
  const setWinAt = useRiftbound((s) => s.setWinAt);

  const maxTeams = Math.floor(MAX_PLAYERS / teamSize);

  const setSize = (size: number) => {
    const count = Math.min(teamCount, Math.floor(MAX_PLAYERS / size));
    configureMatch({ mode: "custom", teamCount: count, teamSize: size, winAt });
  };
  const setCount = (count: number) =>
    configureMatch({ mode: "custom", teamCount: count, teamSize, winAt });

  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="text-base font-medium text-slate-200">Team size</span>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => {
                buzz(8);
                setSize(n);
              }}
              className={cn(
                "press h-9 w-11 rounded-lg border text-sm font-bold",
                n === teamSize
                  ? "border-brand/50 bg-brand/15 text-brand-400"
                  : "border-edge bg-elevated text-slate-300",
              )}
            >
              {n === 1 ? "FFA" : n}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-base font-medium text-slate-200">
          {teamSize > 1 ? "Teams" : "Players"}
        </span>
        <Stepper
          value={teamCount}
          min={2}
          max={maxTeams}
          onChange={setCount}
          label="team count"
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-base font-medium text-slate-200">Win score</span>
        <Stepper
          value={winAt}
          min={WIN_MIN}
          max={WIN_MAX}
          onChange={setWinAt}
          label="win score"
        />
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {teamCount * teamSize} players ·{" "}
        {teamSize > 1 ? `${teamCount} teams of ${teamSize}` : "free-for-all"} ·
        first to {winAt}
      </p>
    </Card>
  );
}

/** Match setup: mode, players, seat colors, counters — then into the table. */
export default function RiftboundSetupPage() {
  const navigate = useNavigate();
  const mode = useRiftbound((s) => s.mode);
  const winAt = useRiftbound((s) => s.winAt);
  const teams = useRiftbound((s) => s.teams);
  const elapsed = useRiftbound((s) => s.elapsed);
  const running = useRiftbound((s) => s.running);
  const configureMatch = useRiftbound((s) => s.configureMatch);
  const reset = useRiftbound((s) => s.reset);
  const inProgress = teams.some((t) => t.points > 0) || elapsed > 0 || running;

  const play = () => {
    buzz(12);
    navigate("/play");
  };

  const pickMode = (m: GameMode) => {
    if (m === mode) return;
    buzz(10);
    if (m === "1v1")
      configureMatch({
        mode: m,
        teamCount: 2,
        teamSize: 1,
        winAt: defaultWinAt(m),
      });
    else if (m === "2v2")
      configureMatch({
        mode: m,
        teamCount: 2,
        teamSize: 2,
        winAt: defaultWinAt(m),
      });
    else configureMatch({ mode: m, teamCount: 3, teamSize: 1, winAt: winAt });
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      {/* Hero + start */}
      <div className="relative overflow-hidden rounded-2xl border border-edge/80 p-5 shadow-card">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#03291f_0%,#065f46_38%,#7c4a10_70%,#452a05_100%)]" />
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-black/35 backdrop-blur-sm">
              <Swords className="h-6 w-6 text-amber-200" />
            </span>
            <span>
              <span className="block font-display text-xl font-bold text-white">
                Riftbound
              </span>
              <span className="block text-sm text-white/70">
                First to {winAt} points wins
              </span>
            </span>
          </div>

          {/* Mode selector */}
          <div className="mt-4 flex rounded-xl border border-white/15 bg-black/25 p-1 backdrop-blur-sm">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => pickMode(m.id)}
                className={cn(
                  "press h-10 flex-1 rounded-lg text-base font-bold transition-colors",
                  mode === m.id ? "bg-white text-slate-900" : "text-white/80",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {inProgress ? (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  buzz(12);
                  reset();
                  navigate("/play");
                }}
                className="press flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/25 bg-black/30 font-display text-base font-bold text-white backdrop-blur-sm"
              >
                <RotateCcw className="h-5 w-5" />
                New game
              </button>
              <button
                onClick={play}
                className="press flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-white font-display text-base font-bold text-slate-900 shadow-lg"
              >
                <Play className="h-5 w-5" />
                Resume game
              </button>
            </div>
          ) : (
            <button
              onClick={play}
              className="press mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white font-display text-base font-bold text-slate-900 shadow-lg"
            >
              <Play className="h-5 w-5" />
              Start match
            </button>
          )}
        </div>
      </div>

      {mode === "custom" && <CustomControls />}

      {teams.map((t) => (
        <TeamSettings key={t.id} team={t} />
      ))}

      {/* Rules recap */}
      <Card>
        <CardTitle>How Riftbound scoring works</CardTitle>
        <ul className="mt-3 flex flex-col gap-2.5">
          {[
            { icon: Crown, text: `First to ${winAt} points wins the game.` },
            {
              icon: Swords,
              text: "Conquer a battlefield → score 1 point immediately.",
            },
            {
              icon: Shield,
              text: "Hold a battlefield at the start of your turn → score 1 point.",
            },
            {
              icon: Flag,
              text: "The final point must come from holding — or conquering every battlefield that turn.",
            },
          ].map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-start gap-2.5 text-sm text-slate-300"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand-400">
                <Icon className="h-3.5 w-3.5" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
