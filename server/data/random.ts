/** Small, fast, seedable PRNG (mulberry32). Same seed -> same sequence on every run. */
export function createRandom(seed: number) {
  let state = seed >>> 0;

  function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  }

  return {
    next,
    chance(probability: number): boolean {
      return next() < probability;
    },
    /** Integer in [min, max]. */
    int(min: number, max: number): number {
      return Math.floor(next() * (max - min + 1)) + min;
    },
    /** Amount in cents, uniformly distributed between two Rand values. */
    cents(minRand: number, maxRand: number): number {
      return Math.round((minRand + next() * (maxRand - minRand)) * 100);
    },
    pick<T>(items: readonly T[]): T {
      const item = items[Math.floor(next() * items.length)];
      if (item === undefined) throw new Error('Cannot pick from an empty list');
      return item;
    },
  };
}

export type Random = ReturnType<typeof createRandom>;
