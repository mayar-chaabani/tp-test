let cards = [];
let movesElement = null;
let timerElement = null;
let restartButton = null;

let firstCard = null;
let secondCard = null;
let lock = false;
let isFlipped = false;
let matchedPairs = 0;
let totalPairs = 0;
let moves = 0;
let seconds = 0;
let timerId = null;
let gameStarted = false;

function bindElements(root = document) {
  cards = Array.from(root.querySelectorAll(".card"));
  movesElement = root.getElementById("moves");
  timerElement = root.getElementById("timer");
  restartButton = root.getElementById("restartBtn");
  totalPairs = cards.length / 2;
}

function attachListeners() {
  cards.forEach((card) => card.addEventListener("click", flip));

  if (restartButton) {
    restartButton.removeEventListener("click", restartGame);
    restartButton.addEventListener("click", restartGame);
  }
}

export function flip() {
  if (lock) return;
  if (this === firstCard) return;
  if (!this || !this.classList) return;

  this.classList.add("flip");

  if (!isFlipped) {
    isFlipped = true;
    firstCard = this;
    return;
  }

  secondCard = this;
  registerMove();
  check();
}

export function check() {
  if (!firstCard || !secondCard) return;

  isMatch(firstCard, secondCard) ? success() : failed();
}

export function isMatch(card1, card2) {
  if (!card1 || !card2) return false;

  const firstImage = card1.dataset?.image;
  const secondImage = card2.dataset?.image;

  if (typeof firstImage !== "string" || typeof secondImage !== "string") {
    return false;
  }

  return firstImage === secondImage;
}

export function success() {
  if (!firstCard || !secondCard) return;

  firstCard.classList.add("matched");
  secondCard.classList.add("matched");

  firstCard.removeEventListener("click", flip);
  secondCard.removeEventListener("click", flip);

  matchedPairs++;
  reset();

  if (matchedPairs === totalPairs) {
    stopTimer();
    setTimeout(
      () => alert(`🎉 You Win!\nMoves: ${moves}\nTime: ${formatTime(seconds)}`),
      400,
    );
  }
}

export function failed() {
  if (!firstCard || !secondCard) {
    reset();
    return;
  }

  lock = true;
  setTimeout(() => {
    firstCard.classList.remove("flip");
    secondCard.classList.remove("flip");
    reset();
  }, 1000);
}

export function reset() {
  [isFlipped, lock] = [false, false];
  [firstCard, secondCard] = [null, null];
}

export function registerMove() {
  moves = incrementMoves(moves);

  if (!gameStarted) {
    gameStarted = true;
    startTimer();
  }

  updateHud();
}

export function incrementMoves(currentMoves) {
  return currentMoves + 1;
}

export function startTimer() {
  if (timerId) return;

  timerId = setInterval(() => {
    seconds++;
    updateHud();
  }, 1000);
}

export function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

export function formatTime(totalSeconds) {
  if (
    typeof totalSeconds !== "number" ||
    !Number.isFinite(totalSeconds) ||
    totalSeconds < 0
  ) {
    return "00:00";
  }

  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function updateHud() {
  if (movesElement) {
    movesElement.textContent = String(moves);
  }

  if (timerElement) {
    timerElement.textContent = formatTime(seconds);
  }
}

export function shuffle() {
  if (cards.length === 0) return;

  const orderArray = shuffledIndexes(cards.length);

  cards.forEach((card, index) => {
    card.style.order = orderArray[index];
  });
}

export function shuffledIndexes(length, randomFn = Math.random) {
  if (!Number.isInteger(length) || length < 0) {
    return [];
  }

  const safeRandomFn = typeof randomFn === "function" ? randomFn : Math.random;
  const orderArray = [...Array(length).keys()];

  for (let i = orderArray.length - 1; i > 0; i--) {
    const j = Math.floor(safeRandomFn() * (i + 1));
    [orderArray[i], orderArray[j]] = [orderArray[j], orderArray[i]];
  }

  return orderArray;
}

export function restartGame() {
  stopTimer();
  [moves, seconds, matchedPairs] = [0, 0, 0];
  gameStarted = false;
  reset();

  cards.forEach((card) => {
    card.classList.remove("flip", "matched");
    card.removeEventListener("click", flip);
    card.addEventListener("click", flip);
  });

  shuffle();
  updateHud();
}

export function initializeGame(root = document) {
  bindElements(root);
  stopTimer();
  [moves, seconds, matchedPairs] = [0, 0, 0];
  gameStarted = false;
  reset();
  attachListeners();
  shuffle();
  updateHud();
}

export function getGameState() {
  return {
    cards,
    firstCard,
    secondCard,
    lock,
    isFlipped,
    matchedPairs,
    totalPairs,
    moves,
    seconds,
    timerId,
    gameStarted,
  };
}

export function setGameState(partialState = {}) {
  if (Object.prototype.hasOwnProperty.call(partialState, "firstCard")) {
    firstCard = partialState.firstCard;
  }
  if (Object.prototype.hasOwnProperty.call(partialState, "secondCard")) {
    secondCard = partialState.secondCard;
  }
  if (Object.prototype.hasOwnProperty.call(partialState, "lock")) {
    lock = partialState.lock;
  }
  if (Object.prototype.hasOwnProperty.call(partialState, "isFlipped")) {
    isFlipped = partialState.isFlipped;
  }
  if (Object.prototype.hasOwnProperty.call(partialState, "matchedPairs")) {
    matchedPairs = partialState.matchedPairs;
  }
  if (Object.prototype.hasOwnProperty.call(partialState, "moves")) {
    moves = partialState.moves;
  }
  if (Object.prototype.hasOwnProperty.call(partialState, "seconds")) {
    seconds = partialState.seconds;
  }
  if (Object.prototype.hasOwnProperty.call(partialState, "timerId")) {
    timerId = partialState.timerId;
  }
  if (Object.prototype.hasOwnProperty.call(partialState, "gameStarted")) {
    gameStarted = partialState.gameStarted;
  }
}

if (typeof document !== "undefined" && !import.meta.vitest) {
  initializeGame(document);
}
