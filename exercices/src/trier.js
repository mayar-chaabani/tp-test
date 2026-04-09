export function trier(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError("Input must be an array");
  }
  if (arr.some((el) => typeof el !== "number")) {
    throw new TypeError("All elements must be numbers");
  }
  return arr.slice().sort((a, b) => a - b);
}
