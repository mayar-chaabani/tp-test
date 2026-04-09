import { test, expect } from 'vitest';
import { isPriceInRange } from '../src/price';

test('price inside range', () => {
  expect(isPriceInRange(50, 10, 100)).toBe(true);
});

test('price equals min', () => {
  expect(isPriceInRange(10, 10, 100)).toBe(true);
});

test('price equals max', () => {
  expect(isPriceInRange(100, 10, 100)).toBe(true);
});

test('price below range', () => {
  expect(isPriceInRange(5, 10, 100)).toBe(false);
});

test('price above range', () => {
  expect(isPriceInRange(150, 10, 100)).toBe(false);
});
