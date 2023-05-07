export function numberToHex(n: number): string {
  return (n >>> 0).toString(16).padStart(8, '0');
}
