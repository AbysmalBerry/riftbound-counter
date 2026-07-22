import { describe, it, expect } from "vitest";
import { buildQuestion, nextQuestion, mulberry32, shuffle } from "./quiz";
import type { Card } from "./types";

function card(id: string, over: Partial<Card> = {}): Card {
  return {
    id,
    name: `Card ${id}`,
    code: id,
    number: 1,
    set: "Origins",
    type: ["Unit"],
    rarity: "Common",
    domains: ["Fury"],
    energy: 2,
    might: 3,
    power: null,
    tags: [],
    text: `<p>Ability ${id}</p>`,
    image: `http://img/${id}.png`,
    ...over,
  };
}

const pool = Array.from({ length: 12 }, (_, i) => card(String(i)));

describe("shuffle", () => {
  it("is a permutation (no lost or duplicated items)", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = shuffle(arr.slice(), mulberry32(1));
    expect(out.slice().sort((a, b) => a - b)).toEqual(arr);
  });

  it("is deterministic for a given seed", () => {
    expect(shuffle([1, 2, 3, 4, 5], mulberry32(42))).toEqual(
      shuffle([1, 2, 3, 4, 5], mulberry32(42)),
    );
  });
});

describe("buildQuestion", () => {
  it("produces 4 options in name mode with the answer among them", () => {
    const q = buildQuestion(pool, pool[0], "name", mulberry32(7));
    expect(q.options).toHaveLength(4);
    expect(q.options[q.answer]).toBe(pool[0].name);
  });

  it("produces 4 options in effect mode with the answer among them", () => {
    const q = buildQuestion(pool, pool[3], "effect", mulberry32(9));
    expect(q.options).toHaveLength(4);
    expect(q.options[q.answer]).toBe(pool[3].text);
  });

  it("never repeats an option (all choices unique)", () => {
    const q = buildQuestion(pool, pool[5], "name", mulberry32(3));
    expect(new Set(q.options).size).toBe(q.options.length);
  });

  it("does not offer a distractor whose text equals the answer", () => {
    // Two cards share ability text; the duplicate must be filtered out.
    const twins = [
      card("a", { text: "<p>Same</p>" }),
      card("b", { text: "<p>Same</p>" }),
      card("c", { text: "<p>Different C</p>" }),
      card("d", { text: "<p>Different D</p>" }),
      card("e", { text: "<p>Different E</p>" }),
    ];
    const q = buildQuestion(twins, twins[0], "effect", mulberry32(1));
    const correctCount = q.options.filter((o) => o === "<p>Same</p>").length;
    expect(correctCount).toBe(1);
  });

  it("degrades gracefully when too few distractors exist", () => {
    const tiny = [card("x"), card("y")];
    const q = buildQuestion(tiny, tiny[0], "name", mulberry32(2));
    expect(q.options.length).toBeLessThanOrEqual(2);
    expect(q.options[q.answer]).toBe(tiny[0].name);
  });

  it("prefers same-type distractors when available", () => {
    const mixed = [
      card("u1", { type: ["Unit"], name: "Unit One" }),
      card("u2", { type: ["Unit"], name: "Unit Two" }),
      card("u3", { type: ["Unit"], name: "Unit Three" }),
      card("u4", { type: ["Unit"], name: "Unit Four" }),
      card("u5", { type: ["Unit"], name: "Unit Five" }),
      card("s1", { type: ["Spell"], name: "Spell One" }),
      card("s2", { type: ["Spell"], name: "Spell Two" }),
      card("s3", { type: ["Spell"], name: "Spell Three" }),
    ];
    const q = buildQuestion(mixed, mixed[0], "name", mulberry32(11));
    const chosen = mixed.filter((c) => q.options.includes(c.name) && c.id !== "u1");
    // With 4 other Units available, all 3 distractors should be Units.
    expect(chosen.every((c) => c.type[0] === "Unit")).toBe(true);
  });
});

describe("nextQuestion", () => {
  it("returns null for an empty pool", () => {
    expect(nextQuestion([], "name", mulberry32(1))).toBeNull();
  });

  it("avoids recently seen cards when alternatives remain", () => {
    const recent = pool.slice(0, 11).map((c) => c.id);
    const q = nextQuestion(pool, "name", mulberry32(4), recent);
    expect(q!.card.id).toBe(pool[11].id);
  });

  it("falls back to the full pool when everything is recent", () => {
    const recent = pool.map((c) => c.id);
    const q = nextQuestion(pool, "name", mulberry32(4), recent);
    expect(q).not.toBeNull();
  });
});
