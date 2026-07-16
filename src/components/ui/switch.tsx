import { cn } from "@/lib/utils";

/** Accessible on/off toggle styled to match the dark theme. */
export function Switch({
  checked,
  onChange,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn(
        "press relative h-6 w-11 shrink-0 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
        checked ? "border-brand-500 bg-brand-600" : "border-edge bg-edge/60",
      )}
    >
      <span
        className={cn(
          "absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow transition-all duration-200",
          checked ? "left-[1.4rem]" : "left-1",
        )}
      />
    </button>
  );
}
