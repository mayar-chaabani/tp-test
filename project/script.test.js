import { describe, test, expect, vi } from "vitest";
import {
  formatTime,
  isMatch,
  incrementMoves,
  shuffledIndexes,
} from "./script.js";

describe("unit tests", () => {
  test("formatTime converts seconds to mm:ss", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(59)).toBe("00:59");
    expect(formatTime(61)).toBe("01:01");
    expect(formatTime(600)).toBe("10:00");
  });

  test("formatTime handles large values", () => {
    expect(formatTime(3599)).toBe("59:59");
    expect(formatTime(3600)).toBe("60:00");
  });

  test("formatTime input validation for negatives and non-numbers", () => {
    expect(formatTime(-1)).toBe("00:00");
    expect(formatTime(NaN)).toBe("00:00");
    expect(formatTime(Infinity)).toBe("00:00");
    expect(formatTime("61")).toBe("00:00");
  });

  test("isMatch returns true for matching cards", () => {
    const card1 = { dataset: { image: "js" } };
    const card2 = { dataset: { image: "js" } };
    expect(isMatch(card1, card2)).toBe(true);
  });

  test("isMatch returns false for non-matching cards", () => {
    const card1 = { dataset: { image: "js" } };
    const card2 = { dataset: { image: "css" } };
    expect(isMatch(card1, card2)).toBe(false);
  });

  test("isMatch returns false when one card is missing", () => {
    const card = { dataset: { image: "js" } };
    expect(isMatch(card, null)).toBe(false);
    expect(isMatch(null, card)).toBe(false);
  });

  test("isMatch returns false for malformed card objects", () => {
    const malformed1 = {};
    const malformed2 = { dataset: {} };
    expect(isMatch(malformed1, malformed2)).toBe(false);
  });

  test("isMatch returns false for bad primitive inputs", () => {
    expect(isMatch("a", "b")).toBe(false);
    expect(isMatch(1, 2)).toBe(false);
    expect(isMatch({ dataset: { image: 1 } }, { dataset: { image: "1" } })).toBe(false);
  });

  test("incrementMoves increases moves by 1", () => {
    expect(incrementMoves(0)).toBe(1);
    expect(incrementMoves(5)).toBe(6);
  });

  test("incrementMoves handles large values", () => {
    expect(incrementMoves(9999)).toBe(10000);
  });

  test("shuffledIndexes returns a permutation with same length", () => {
    const result = shuffledIndexes(
      8,
      vi.fn(() => 0.42),
    );
    expect(result).toHaveLength(8);
    expect([...result].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  test("shuffledIndexes changes order with deterministic random", () => {
    const result = shuffledIndexes(
      5,
      vi.fn(() => 0),
    );
    expect(result).not.toEqual([0, 1, 2, 3, 4]);
  });

  test("shuffledIndexes handles boundary lengths", () => {
    expect(shuffledIndexes(0, vi.fn(() => 0.7))).toEqual([]);
    expect(shuffledIndexes(1, vi.fn(() => 0.7))).toEqual([0]);
  });

  test("shuffledIndexes handles invalid lengths", () => {
    expect(shuffledIndexes(-3, vi.fn(() => 0.2))).toEqual([]);
    expect(shuffledIndexes(2.5, vi.fn(() => 0.2))).toEqual([]);
  });

  test("shuffledIndexes falls back when randomFn is invalid", () => {
    const result = shuffledIndexes(4, null);
    expect(result).toHaveLength(4);
    expect([...result].sort((a, b) => a - b)).toEqual([0, 1, 2, 3]);
  });

  test("shuffledIndexes can be deterministic from a fixed random sequence", () => {
    const sequence = [0.1, 0.9, 0.2, 0.8];
    let index = 0;
    const randomFn = vi.fn(() => sequence[index++ % sequence.length]);

    const firstRun = shuffledIndexes(6, randomFn);

    index = 0;
    const secondRun = shuffledIndexes(6, randomFn);

    expect(firstRun).toEqual(secondRun);
  });
});
