import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-edge/80 bg-gradient-to-b from-elevated/50 to-panel/80 p-5 shadow-card backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("text-sm font-medium text-slate-300", className)}>{children}</div>;
}
