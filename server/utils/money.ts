/**
 * Rounds half away from zero to the given number of decimals. Shifting via
 * exponent notation avoids binary floating-point errors such as
 * 1.005 * 100 === 100.49999999999999.
 */
export function roundTo(value: number, decimals: number): number {
  const magnitude = String(Math.abs(value));
  // Very small or large numbers already print in exponent form; plain scaling is fine there.
  if (magnitude.includes('e')) return Math.round(value * 10 ** decimals) / 10 ** decimals;
  const shifted = Math.round(Number(`${magnitude}e${decimals}`));
  return Math.sign(value) * Number(`${shifted}e-${decimals}`);
}

export function centsToRand(cents: number): number {
  return roundTo(cents / 100, 2);
}
