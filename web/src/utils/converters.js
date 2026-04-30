/**
 * Konwerter gramów na Newtony (N = kg * 9.80665)
 */
export const gToN = (grams) => {
  if (!grams) return 0;
  return Number(((grams / 1000) * 9.80665).toFixed(2));
};
