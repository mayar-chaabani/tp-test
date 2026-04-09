import { describe, test, expect, vi } from "vitest";
import {
  check,
  failed,
  flip,
  formatTime,
  getGameState,
  initializeGame,
  isMatch,
  incrementMoves,
  registerMove,
  reset,
  restartGame,
  setGameState,
  shuffle,
  shuffledIndexes,
  startTimer,
  stopTimer,
  success,
  updateHud,
} from "./script.js";

function createFakeCard(image = "js") {
  const classes = new Set();

  return {
    dataset: { image },
    style: {},
    classList: {
      add: (...names) => names.forEach((name) => classes.add(name)),
      remove: (...names) => names.forEach((name) => classes.delete(name)),
      contains: (name) => classes.has(name),
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
}

function createRoot({ cards = [], withHud = true, withRestart = true } = {}) {
  const movesEl = { textContent: "" };
  const timerEl = { textContent: "" };
  const restartBtn = {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };

  return {
    root: {
      querySelectorAll: vi.fn(() => cards),
      getElementById: vi.fn((id) => {
        if (!withHud) return null;
        if (id === "moves") return movesEl;
        if (id === "timer") return timerEl;
        if (id === "restartBtn") return withRestart ? restartBtn : null;
        return null;
      }),
    },
    movesEl,
    timerEl,
    restartBtn,
  };
}

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
    expect(
      isMatch({ dataset: { image: 1 } }, { dataset: { image: "1" } }),
    ).toBe(false);
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
    expect(
      shuffledIndexes(
        0,
        vi.fn(() => 0.7),
      ),
    ).toEqual([]);
    expect(
      shuffledIndexes(
        1,
        vi.fn(() => 0.7),
      ),
    ).toEqual([0]);
  });

  test("shuffledIndexes handles invalid lengths", () => {
    expect(
      shuffledIndexes(
        -3,
        vi.fn(() => 0.2),
      ),
    ).toEqual([]);
    expect(
      shuffledIndexes(
        2.5,
        vi.fn(() => 0.2),
      ),
    ).toEqual([]);
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

  test("initializeGame binds cards/hud and restart listener", () => {
    const cards = [createFakeCard("js"), createFakeCard("css")];
    const { root, movesEl, timerEl, restartBtn } = createRoot({ cards });

    initializeGame(root);

    const state = getGameState();
    expect(state.cards).toHaveLength(2);
    expect(state.totalPairs).toBe(1);
    expect(movesEl.textContent).toBe("0");
    expect(timerEl.textContent).toBe("00:00");
    expect(restartBtn.addEventListener).toHaveBeenCalledWith(
      "click",
      restartGame,
    );
  });

  test("flip guards: lock, same card, and invalid this", () => {
    const card = createFakeCard("js");
    const { root } = createRoot({ cards: [card] });
    initializeGame(root);

    setGameState({ lock: true });
    flip.call(card);
    expect(card.classList.contains("flip")).toBe(false);

    setGameState({ lock: false, isFlipped: true, firstCard: card });
    flip.call(card);
    expect(getGameState().secondCard).toBeNull();

    expect(() => flip.call({})).not.toThrow();
  });

  test("flip + check success path marks cards as matched", () => {
    const card1 = createFakeCard("js");
    const card2 = createFakeCard("js");
    const { root } = createRoot({ cards: [card1, card2] });
    initializeGame(root);

    flip.call(card1);
    flip.call(card2);

    expect(card1.classList.contains("matched")).toBe(true);
    expect(card2.classList.contains("matched")).toBe(true);
    expect(getGameState().matchedPairs).toBe(1);
  });

  test("check returns early when cards are not set", () => {
    setGameState({ firstCard: null, secondCard: null });
    expect(() => check()).not.toThrow();
  });

  test("failed branch with missing cards resets safely", () => {
    setGameState({
      firstCard: null,
      secondCard: null,
      isFlipped: true,
      lock: true,
    });
    failed();
    const state = getGameState();
    expect(state.firstCard).toBeNull();
    expect(state.secondCard).toBeNull();
    expect(state.isFlipped).toBe(false);
    expect(state.lock).toBe(false);
  });

  test("failed branch flips cards back after timeout", () => {
    vi.useFakeTimers();
    const card1 = createFakeCard("js");
    const card2 = createFakeCard("css");
    const { root } = createRoot({ cards: [card1, card2] });
    initializeGame(root);

    card1.classList.add("flip");
    card2.classList.add("flip");
    setGameState({ firstCard: card1, secondCard: card2 });
    failed();

    expect(getGameState().lock).toBe(true);
    vi.advanceTimersByTime(1000);
    expect(card1.classList.contains("flip")).toBe(false);
    expect(card2.classList.contains("flip")).toBe(false);
    expect(getGameState().lock).toBe(false);
    vi.useRealTimers();
  });

  test("success win path stops timer and alerts", () => {
    vi.useFakeTimers();
    globalThis.alert = vi.fn();

    const card1 = createFakeCard("js");
    const card2 = createFakeCard("js");
    const { root } = createRoot({ cards: [card1, card2] });
    initializeGame(root);
    setGameState({
      firstCard: card1,
      secondCard: card2,
      matchedPairs: 0,
      seconds: 12,
      moves: 3,
    });
    startTimer();

    success();
    vi.advanceTimersByTime(400);

    expect(globalThis.alert).toHaveBeenCalled();
    expect(getGameState().timerId).toBeNull();
    vi.useRealTimers();
  });

  test("registerMove starts timer once and increments moves", () => {
    vi.useFakeTimers();
    setGameState({ moves: 0, gameStarted: false, seconds: 0, timerId: null });

    registerMove();
    const firstTimer = getGameState().timerId;
    registerMove();

    expect(getGameState().moves).toBe(2);
    expect(getGameState().gameStarted).toBe(true);
    expect(getGameState().timerId).toBe(firstTimer);

    stopTimer();
    vi.useRealTimers();
  });

  test("startTimer guard branch does not create second interval", () => {
    vi.useFakeTimers();
    setGameState({ timerId: null, seconds: 0 });
    startTimer();
    const firstTimer = getGameState().timerId;
    startTimer();
    expect(getGameState().timerId).toBe(firstTimer);
    stopTimer();
    vi.useRealTimers();
  });

  test("updateHud handles missing HUD elements", () => {
    const { root } = createRoot({ cards: [], withHud: false });
    initializeGame(root);
    setGameState({ moves: 9, seconds: 75 });
    expect(() => updateHud()).not.toThrow();
  });

  test("shuffle no-op when there are no cards", () => {
    const { root } = createRoot({ cards: [] });
    initializeGame(root);
    expect(() => shuffle()).not.toThrow();
  });

  test("restartGame resets cards, state, and listeners", () => {
    const card1 = createFakeCard("js");
    const card2 = createFakeCard("css");
    const { root } = createRoot({ cards: [card1, card2] });
    initializeGame(root);

    card1.classList.add("flip", "matched");
    card2.classList.add("flip", "matched");
    setGameState({ moves: 5, seconds: 8, matchedPairs: 1, gameStarted: true });
    restartGame();

    const state = getGameState();
    expect(state.moves).toBe(0);
    expect(state.seconds).toBe(0);
    expect(state.matchedPairs).toBe(0);
    expect(state.gameStarted).toBe(false);
    expect(card1.classList.contains("flip")).toBe(false);
    expect(card1.classList.contains("matched")).toBe(false);
    expect(card1.removeEventListener).toHaveBeenCalledWith("click", flip);
    expect(card1.addEventListener).toHaveBeenCalledWith("click", flip);
  });

  test("reset clears first/second card and lock flags", () => {
    const card1 = createFakeCard("js");
    const card2 = createFakeCard("css");
    setGameState({
      firstCard: card1,
      secondCard: card2,
      isFlipped: true,
      lock: true,
    });
    reset();
    const state = getGameState();
    expect(state.firstCard).toBeNull();
    expect(state.secondCard).toBeNull();
    expect(state.isFlipped).toBe(false);
    expect(state.lock).toBe(false);
  });
});
