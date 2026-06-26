/**
 * Suggests a recommended number of "cooling off" days based on price.
 *  - price < 500: 1 day
 *  - 500 - 2,999: 7 days
 *  - 3,000 - 9,999: 14 days
 *  - >= 10,000: 30 days
 */
export function suggestWaitDays(price: number): number {
  if (price < 500) return 1;
  if (price < 3000) return 7;
  if (price < 10000) return 14;
  return 30;
}
