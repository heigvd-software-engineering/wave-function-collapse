/**
 * Seedable random function
 * (https://decode.sh/seeded-random-number-generator-in-js/)
 */
const seededRandom = (seed) => {
  let m = 2 ** 35 - 31;
  let a = 185852;
  let s = seed % m;
  return function () {
    return (s = (s * a) % m) / m;
  };
};

const DEFAULT_SEED = 473974392;
const SEEDED_RANDOM = seededRandom(DEFAULT_SEED);

/**
 * Returns a random number between min and max (inclusive)
 * @param {number} min (inclusive)
 * @param {number} max (inclusive)
 */
const randomBetween = (min, max) => {
  return Math.floor(SEEDED_RANDOM() * (max - min + 1) + min);
};

/**
 * Returns a random number between 0 and 1
 * @returns {number}
 */
const random = () => {
  return SEEDED_RANDOM();
};

export { randomBetween, random };
