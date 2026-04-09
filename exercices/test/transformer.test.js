import { test, expect } from 'vitest';
import { transformer } from '../src/transformer';

test('empty string', () => {
  expect(transformer('')).toBe('');
});

test('lowercase string', () => {
  expect(transformer('hello')).toBe('HELLO');
});

test('special characters', () => {
  expect(transformer('hello!@#')).toBe('HELLO!@#');
});
