import { AlertCircle, Check, Download, Loader2, RefreshCw } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { buzz } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/stores/usePreferences";
import { ACCENTS } from "@/theme/accents";
import { useCards, useHydrateCards } from "@/features/quiz/useCards";

/** Accent theme swatches — recolors all brand chrome app-wide. */
function ThemeSection() {
  const accent = usePreferences((s) => s.accent);
  const setAccent = usePreferences((s) => s.setAccent);

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <CardTitle>Accent theme</CardTitle>
        <p className="mt-1 text-xs text-slate-500">
          Recolors buttons, highlights and the app chrome.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {ACCENTS.map((a) => {
          const on = accent === a.id;
          return (
            <button
              key={a.id}
              onClick={() => {
                buzz(8);
                setAccent(a.id);
              }}
              aria-pressed={on}
              className={cn(
                "press flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors",
                on ? "border-brand/70 bg-brand/10" : "border-edge bg-panel",
              )}
            >
              <span
                className="h-5 w-5 shrink-0 rounded-full ring-1 ring-white/20"
                style={{ backgroundColor: a.swatch }}
              />
              <span className={cn("text-sm font-medium", on ? "text-slate-100" : "text-slate-300")}>
                {a.label}
              </span>
              {on && <Check className="ml-auto h-4 w-4 text-brand-400" />}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/** Comfort toggles that already live in the preferences store. */
function GeneralSection() {
  const { haptics, setHaptics, reduceMotion, setReduceMotion } = usePreferences();

  const rows = [
    {
      label: "Haptics",
      hint: "Vibrate on taps (supported devices).",
      checked: haptics,
      set: setHaptics,
    },
    {
      label: "Reduce motion",
      hint: "Minimize animations and transitions.",
      checked: reduceMotion,
      set: setReduceMotion,
    },
  ];

  return (
    <Card className="flex flex-col gap-3">
      <CardTitle>General</CardTitle>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-slate-200">{r.label}</span>
            <span className="block text-xs text-slate-500">{r.hint}</span>
          </span>
          <Switch
            checked={r.checked}
            onChange={(v) => {
              buzz(8);
              r.set(v);
            }}
            aria-label={r.label}
          />
        </div>
      ))}
    </Card>
  );
}

/** Card data — shows the active set and refetches the full gallery on demand. */
function CardDataSection() {
  const cards = useCards((s) => s.cards);
  const fetchedAt = useCards((s) => s.fetchedAt);
  const updated = useCards((s) => s.updated);
  const status = useCards((s) => s.status);
  const error = useCards((s) => s.error);
  const update = useCards((s) => s.update);

  const loading = status === "loading";

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <CardTitle>Card data</CardTitle>
        <p className="mt-1 text-xs text-slate-500">
          {cards.length} cards · {updated ? "updated" : "bundled"}{" "}
          {new Date(fetchedAt).toLocaleDateString()}
        </p>
      </div>

      <Button
        onClick={() => {
          buzz(10);
          update();
        }}
        disabled={loading}
        variant="outline"
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Updating…
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" /> Update cards
          </>
        )}
      </Button>

      {status === "success" && (
        <p className="flex items-center gap-2 text-sm text-emerald-400">
          <Check className="h-4 w-4" /> Updated to {cards.length} cards.
        </p>
      )}
      {status === "error" && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <p className="flex items-start gap-2 text-xs text-slate-500">
        <Download className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Downloads the latest cards from the official gallery and stores them on this
        device. Works offline afterward; card art still needs a connection.
      </p>
    </Card>
  );
}

/** App settings — theme, comfort toggles, and card-data refresh. */
export default function SettingsPage() {
  useHydrateCards();
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <ThemeSection />
      <GeneralSection />
      <CardDataSection />
    </div>
  );
}
