import dayjs from "dayjs";

export /**
 * Helper: build continuous daily x-axis from min -> max keys and map series to those days.
 * Accepts maps in format { "YYYY-MM-DD": number, ... }
 */
function normalizeIntervalMaps(maps: Record<string, number>[]) {
  const allKeys = new Set<string>();
  maps.forEach((m) => {
    if (m) Object.keys(m).forEach((k) => allKeys.add(k));
  });
  const keys = Array.from(allKeys);
  if (!keys.length) return { x: [], series: maps.map(() => []) as number[][] };

  // parse keys to dayjs and find min/max by numeric value (avoid dayjs.min usage)
  const parsed = keys
    .map((k) => ({ key: k, ts: dayjs(k).valueOf() }))
    .filter((p) => !Number.isNaN(p.ts));
  if (!parsed.length)
    return { x: [], series: maps.map(() => []) as number[][] };

  const minTs = parsed.reduce((a, b) => (a.ts < b.ts ? a : b)).ts;
  const maxTs = parsed.reduce((a, b) => (a.ts > b.ts ? a : b)).ts;

  const start = dayjs(minTs).startOf("day");
  const end = dayjs(maxTs).startOf("day");

  const x: string[] = [];
  let cur = start;
  while (cur.isBefore(end) || cur.isSame(end)) {
    x.push(cur.format("YYYY-MM-DD"));
    cur = cur.add(1, "day");
  }

  const series = maps.map((m) =>
    x.map((d) => {
      const v = m?.[d];
      return typeof v === "number" && !Number.isNaN(v) ? v : 0;
    })
  );

  return { x, series };
}
