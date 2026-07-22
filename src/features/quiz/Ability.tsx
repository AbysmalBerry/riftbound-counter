import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DOMAIN_COLORS } from "./data";

/** Collapse the card-text HTML into plain text with line breaks + bullets. */
function toPlainText(html: string): string {
  return html
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&rsquo;/g, "’")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const RUNE_LABEL: Record<string, string> = {
  fury: "Fury",
  calm: "Calm",
  mind: "Mind",
  body: "Body",
  chaos: "Chaos",
  order: "Order",
  rainbow: "Any",
};

/** Render a single :rb_*: token as a compact inline chip. */
function Token({ raw }: { raw: string }): ReactNode {
  const key = raw.slice(1, -1); // strip the surrounding colons

  if (key === "rb_might") {
    return (
      <span className="mx-0.5 inline-flex items-center gap-0.5 rounded bg-amber-400/15 px-1 text-[0.85em] font-semibold text-amber-300">
        ⚔ Might
      </span>
    );
  }
  if (key === "rb_exhaust") {
    return (
      <span className="mx-0.5 inline-flex items-center rounded bg-slate-400/15 px-1 text-[0.85em] font-semibold text-slate-300">
        ⟳ Exhaust
      </span>
    );
  }
  const energy = key.match(/^rb_energy_(\d+)$/);
  if (energy) {
    return (
      <span className="mx-0.5 inline-flex h-[1.15em] min-w-[1.15em] items-center justify-center rounded-full bg-sky-400/20 px-1 text-[0.8em] font-bold text-sky-200">
        {energy[1]}
      </span>
    );
  }
  const rune = key.match(/^rb_rune_(\w+)$/);
  if (rune) {
    const name = rune[1];
    const color =
      name === "rainbow"
        ? "#c084fc"
        : DOMAIN_COLORS[(RUNE_LABEL[name] ?? "").trim()] ?? "#94a3b8";
    return (
      <span className="mx-0.5 inline-flex items-center gap-1 align-middle">
        <span
          className="inline-block h-[0.7em] w-[0.7em] rounded-full ring-1 ring-white/20"
          style={{ backgroundColor: color }}
        />
        <span className="text-[0.8em] text-slate-300">{RUNE_LABEL[name] ?? name}</span>
      </span>
    );
  }
  return <span className="text-slate-400">{key}</span>;
}

const TOKEN_RE = /:[a-z0-9_]+:/gi;

/**
 * Renders Riftbound ability copy: HTML flattened to text, with :rb_*: game
 * symbols swapped for readable inline chips. `title` variant is used when the
 * effect is the question stem vs. an answer option.
 */
export function Ability({ text, className }: { text: string; className?: string }) {
  const plain = toPlainText(text);
  if (!plain) return <span className="italic text-slate-500">No ability text</span>;

  const parts = plain.split(TOKEN_RE);
  const tokens = plain.match(TOKEN_RE) ?? [];

  return (
    <span className={cn("whitespace-pre-wrap", className)}>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < tokens.length && <Token raw={tokens[i]} />}
        </Fragment>
      ))}
    </span>
  );
}
