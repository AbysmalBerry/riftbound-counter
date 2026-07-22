import { Smartphone, Sparkles } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { usePreferences } from "@/stores/usePreferences";
import { buzz } from "@/lib/haptics";

/** One preference row: icon, label + description, and a toggle on the right. */
function SettingRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
  ariaLabel,
}: {
  icon: typeof Smartphone;
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-edge/60 text-slate-300">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-slate-200">{title}</span>
        <span className="block text-sm text-slate-500">{description}</span>
      </span>
      <Switch checked={checked} onChange={onChange} aria-label={ariaLabel} />
    </div>
  );
}

/** Device-local preferences — haptics and the reduce-motion kill-switch. */
export default function SettingsPage() {
  const haptics = usePreferences((s) => s.haptics);
  const setHaptics = usePreferences((s) => s.setHaptics);
  const reduceMotion = usePreferences((s) => s.reduceMotion);
  const setReduceMotion = usePreferences((s) => s.setReduceMotion);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Card className="flex flex-col gap-3">
        <CardTitle>Preferences</CardTitle>
        <SettingRow
          icon={Smartphone}
          title="Haptics"
          description="Vibrate on taps, where supported."
          checked={haptics}
          ariaLabel="Toggle haptics"
          onChange={(on) => {
            // Buzz on enable so the change is felt immediately.
            setHaptics(on);
            if (on) buzz(10);
          }}
        />
        <SettingRow
          icon={Sparkles}
          title="Reduce motion"
          description="Turn off page and counter animations."
          checked={reduceMotion}
          ariaLabel="Toggle reduce motion"
          onChange={(on) => {
            buzz(8);
            setReduceMotion(on);
          }}
        />
      </Card>

      <p className="px-1 text-center text-xs text-slate-500">
        Preferences are saved on this device only.
      </p>
    </div>
  );
}
