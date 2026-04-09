import { test, expect } from "vitest";
import { trier } from "../src/trier";

test("unsorted array", () => {
  expect(trier([3, 1, 2])).toEqual([1, 2, 3]);
});

test("already sorted", () => {
  expect(trier([1, 2, 3])).toEqual([1, 2, 3]);
});

test("reversed array", () => {
  expect(trier([3, 2, 1])).toEqual([1, 2, 3]);
});

test("array with duplicates", () => {
  expect(trier([3, 1, 2, 1])).toEqual([1, 1, 2, 3]);
});

test("empty array", () => {
  expect(trier([])).toEqual([]);
});

test("array with non-numeric", () => {
  expect(() => trier([1, "a", 3])).toThrow();
});

test("single element array", () => {
  expect(trier([42])).toEqual([42]);
});

test("non-array input throws error", () => {
  expect(() => trier("not an array")).toThrow();
  expect(() => trier(123)).toThrow();
  expect(() => trier(null)).toThrow();
});

test("original array is not mutated", () => {
  const arr = [3, 1, 2];
  trier(arr);
  expect(arr).toEqual([3, 1, 2]);
});
