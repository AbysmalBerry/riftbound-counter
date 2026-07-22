import type { Card, Question, QuizMode } from "./types";

/** Deterministic PRNG so question generation is unit-testable. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** In-place Fisher–Yates using the supplied rng. Returns the same array. */
export function shuffle<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const OPTION_COUNT = 4;

/** The text a given mode asks the player to match to the art. */
export function optionKey(card: Card, mode: QuizMode): string {
  return mode === "name" ? card.name : card.text;
}

/** How "close" a distractor is to the answer — higher picks harder look-alikes. */
function similarity(a: Card, b: Card): number {
  let s = 0;
  if (a.type[0] && a.type[0] === b.type[0]) s += 2;
  if (a.domains.some((d) => b.domains.includes(d))) s += 1;
  if (a.set && a.set === b.set) s += 1;
  return s;
}

/**
 * Build a single MCQ for `correct` drawn from `pool`. Distractors are unique by
 * their option text (so no duplicate choices, and never a second copy of the
 * right answer), biased toward cards similar to the answer to keep it hard.
 */
export function buildQuestion(
  pool: Card[],
  correct: Card,
  mode: QuizMode,
  rng: () => number,
): Question {
  const correctKey = optionKey(correct, mode);
  const usedKeys = new Set([correctKey]);

  // Candidate distractors: valid option text, distinct from the answer.
  const candidates = pool.filter((c) => {
    if (c.id === correct.id) return false;
    const key = optionKey(c, mode);
    if (!key.trim() || usedKeys.has(key)) return false;
    return true;
  });

  // Sort by similarity (desc) with a random tiebreak, then take unique keys.
  const ranked = shuffle(candidates.slice(), rng).sort(
    (a, b) => similarity(correct, b) - similarity(correct, a),
  );

  const distractors: string[] = [];
  for (const c of ranked) {
    const key = optionKey(c, mode);
    if (usedKeys.has(key)) continue;
    usedKeys.add(key);
    distractors.push(key);
    if (distractors.length === OPTION_COUNT - 1) break;
  }

  const options = shuffle([correctKey, ...distractors], rng);
  return { card: correct, mode, options, answer: options.indexOf(correctKey) };
}

/**
 * Pick the next question from `pool`, avoiding the most recent `recentIds` so
 * the same card doesn't reappear back-to-back. Returns null if the pool is empty.
 */
export function nextQuestion(
  pool: Card[],
  mode: QuizMode,
  rng: () => number,
  recentIds: string[] = [],
): Question | null {
  if (pool.length === 0) return null;
  const recent = new Set(recentIds);
  const fresh = pool.filter((c) => !recent.has(c.id));
  const source = fresh.length > 0 ? fresh : pool;
  const correct = source[Math.floor(rng() * source.length)];
  return buildQuestion(pool, correct, mode, rng);
}
