export function formatJP(value: number): string {
  if (value >= 1_000_000)
    return (
      (Math.floor((value / 1_000_000) * 10) / 10)
        .toString()
        .replace(/\.0$/, "") + "M"
    );
  if (value >= 1_000)
    return (
      (Math.floor((value / 1_000) * 10) / 10).toString().replace(/\.0$/, "") +
      "K"
    );
  return value.toString();
}
