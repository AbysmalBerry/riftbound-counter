import { describe, it, expect } from "vitest";
import {
  WIN_1V1,
  WIN_2V2,
  COUNTER_MAX,
  BUFF_VALUE_MAX,
  clampScore,
  clampCounter,
  clampBuffValue,
  buffTotal,
  fmtClock,
  fmtDuration,
  winningTeamIndex,
  defaultWinAt,
  defaultTeamName,
} from "./riftbound";

describe("clampScore", () => {
  it("keeps the score inside the 0..winAt track", () => {
    expect(clampScore(-1, WIN_1V1)).toBe(0);
    expect(clampScore(5, WIN_1V1)).toBe(5);
    expect(clampScore(WIN_1V1 + 3, WIN_1V1)).toBe(WIN_1V1);
    expect(clampScore(11, WIN_2V2)).toBe(11);
  });
});

describe("clampCounter", () => {
  it("keeps the sub-counter inside 0..COUNTER_MAX", () => {
    expect(clampCounter(-5)).toBe(0);
    expect(clampCounter(42)).toBe(42);
    expect(clampCounter(COUNTER_MAX + 1)).toBe(COUNTER_MAX);
  });
});

describe("fmtClock", () => {
  it("formats seconds as mm:ss", () => {
    expect(fmtClock(0)).toBe("00:00");
    expect(fmtClock(59)).toBe("00:59");
    expect(fmtClock(60)).toBe("01:00");
    expect(fmtClock(124.9)).toBe("02:04");
    expect(fmtClock(3600)).toBe("60:00");
  });

  it("never renders negative time", () => {
    expect(fmtClock(-10)).toBe("00:00");
  });
});

describe("buff cards", () => {
  it("clamps a card's value to 1..BUFF_VALUE_MAX", () => {
    expect(clampBuffValue(0)).toBe(1);
    expect(clampBuffValue(3.4)).toBe(3);
    expect(clampBuffValue(BUFF_VALUE_MAX + 5)).toBe(BUFF_VALUE_MAX);
  });

  it("sums the team's buff total", () => {
    expect(buffTotal([])).toBe(0);
    expect(
      buffTotal([
        { id: "a", name: "Sunder", value: 2 },
        { id: "b", name: "Rally", value: 3 },
      ]),
    ).toBe(5);
  });
});

describe("fmtDuration", () => {
  it("uses mm:ss under an hour", () => {
    expect(fmtDuration(0)).toBe("00:00");
    expect(fmtDuration(3599)).toBe("59:59");
  });

  it("switches to h/m from an hour up", () => {
    expect(fmtDuration(3600)).toBe("1h 00m");
    expect(fmtDuration(3600 * 2 + 65 * 60)).toBe("3h 05m");
  });
});

describe("winningTeamIndex", () => {
  it("finds the first team at or over the threshold", () => {
    expect(winningTeamIndex([WIN_1V1, 3], WIN_1V1)).toBe(0);
    expect(winningTeamIndex([2, WIN_1V1], WIN_1V1)).toBe(1);
    expect(winningTeamIndex([5, 10, 11], WIN_2V2)).toBe(2);
  });

  it("returns -1 when no one has reached it", () => {
    expect(winningTeamIndex([0, 0], WIN_1V1)).toBe(-1);
    expect(winningTeamIndex([7, 7], WIN_1V1)).toBe(-1);
  });
});

describe("match config helpers", () => {
  it("defaults win score by mode", () => {
    expect(defaultWinAt("1v1")).toBe(WIN_1V1);
    expect(defaultWinAt("2v2")).toBe(WIN_2V2);
    expect(defaultWinAt("custom")).toBe(WIN_1V1);
  });

  it("labels solo seats and teams differently", () => {
    expect(defaultTeamName(0, 1)).toBe("Player 1");
    expect(defaultTeamName(2, 2)).toBe("Team 3");
  });
});
