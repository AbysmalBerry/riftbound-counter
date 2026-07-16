import { useMemo } from "react";

// Confetti palette (accent + friends; decorative only)
const COLORS = ["rgb(var(--ac-500))", "rgb(var(--ac-400))", "#A78BFA", "#34D399", "#FBBF24", "#38BDF8"];

interface Piece {
  left: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  round: boolean;
}

/**
 * A one-shot CSS confetti burst falling from the top of the viewport. Remount
 * it (change its `key`) to fire again — it has no replay of its own.
 */
export function ConfettiBurst({ count = 40 }: { count?: number }) {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        size: 6 + Math.random() * 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.35,
        duration: 1.2 + Math.random() * 0.8,
        round: Math.random() < 0.4,
      })),
    [count],
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[70]">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 animate-confetti-fall"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.round ? p.size : p.size * 1.6,
              backgroundColor: p.color,
              borderRadius: p.round ? "9999px" : "2px",
              animationDelay: `${p.delay}s`,
              "--confetti-duration": `${p.duration}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
