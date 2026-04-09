import { test, expect } from 'vitest';
import { add } from '../src/math';

test('add 2 + 3 = 5', () => {
  expect(add(2, 3)).toBe(5);
});

test('add negative numbers', () => {
  expect(add(-2, -3)).toBe(-5);
});

test('add zero', () => {
  expect(add(0, 5)).toBe(5);
});
