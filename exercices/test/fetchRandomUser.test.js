import { test, expect, vi } from "vitest";
import { fetchRandomUser } from "../src/fetchRandomUser";

test("should fetch random user", async () => {
  const user = await fetchRandomUser();
  expect(user).toBeDefined();
  expect(typeof user).toBe("object");
  expect(user.name).toBeDefined();
  expect(user.email).toBeDefined();
});

test("should throw error when fetch fails", async () => {
  global.fetch = vi.fn(() => Promise.resolve({ ok: false }));
  await expect(fetchRandomUser()).rejects.toThrow(
    "Failed to fetch random user",
  );
});
