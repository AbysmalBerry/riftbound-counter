import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Swords } from "lucide-react";
import { buzz } from "@/lib/haptics";

/** Route → header title. The play table renders outside this shell. */
const TITLES: Record<string, string> = {
  "/": "Riftbound Counter",
  "/setup": "Match setup",
};

/**
 * Minimal chrome for the two scrollable pages: a title, and a back arrow once
 * you're off the hub. The counter itself is full-bleed and skips this entirely.
 */
export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const atRoot = location.pathname === "/";
  const title = TITLES[location.pathname] ?? "Riftbound Counter";

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-edge bg-ink/80 px-4 py-3 backdrop-blur-md">
        {atRoot ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-hero-brand shadow-hero">
            <Swords className="h-5 w-5 text-white" />
          </span>
        ) : (
          <button
            onClick={() => {
              buzz(8);
              navigate("/");
            }}
            aria-label="Back"
            className="press flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-edge bg-panel text-slate-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <h1
          key={location.pathname}
          className="animate-page-in font-display text-lg font-bold tracking-tight"
        >
          {title}
        </h1>
      </header>

      {/* Keyed on the route so each page slides in fresh */}
      <section key={location.pathname} className="animate-page-in flex-1 p-4">
        <Outlet />
      </section>
    </div>
  );
}
