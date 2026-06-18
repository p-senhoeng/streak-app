// ─── Date key helpers ──────────────────────────────────────────────────────────

/**
 * Build a local YYYY-MM-DD key. Uses local timezone components — NOT
 * toISOString(), which returns UTC and breaks near midnight in negative offsets.
 */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Parse a YYYY-MM-DD key back to local midnight. 'T00:00:00' forces local
 * interpretation; without it, Date() treats a bare YYYY-MM-DD as UTC noon.
 */
export function fromDateKey(key: string): Date {
  return new Date(key + 'T00:00:00');
}

// ─── Per-streak derivations ────────────────────────────────────────────────────

/** Is today already in the logged set? */
export function loggedToday(loggedDates: string[], today = new Date()): boolean {
  return loggedDates.includes(toDateKey(today));
}

/**
 * Current streak count. Grace rule: if today isn't logged yet, count back from
 * yesterday so the streak isn't shown as broken before the day is over
 * (Duolingo-style). It only truly breaks once a full calendar day passes unlogged.
 */
export function currentStreak(logged: Set<string>, today = new Date()): number {
  const cursor = new Date(today);
  if (!logged.has(toDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (logged.has(toDateKey(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

/** Longest consecutive run ever across all loggedDates. */
export function bestStreak(loggedDates: string[]): number {
  if (loggedDates.length === 0) return 0;
  const sorted = [...new Set(loggedDates)].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T00:00:00').getTime();
    const cur  = new Date(sorted[i]     + 'T00:00:00').getTime();
    const diffDays = Math.round((cur - prev) / 86_400_000);
    run = diffDays === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
}

// ─── Calendar month grid ───────────────────────────────────────────────────────

export type DayState = 'logged' | 'missed' | 'today' | 'todayLogged' | 'future';

export type CalendarCell =
  | { type: 'empty' }
  | { type: 'day'; dateKey: string; state: DayState };

/**
 * Builds a 42-cell (6 rows × 7 cols) grid for the given year/month.
 * Week starts Sunday. Leading/trailing cells have type 'empty'.
 *
 * @param year  - full year, e.g. 2024
 * @param month - 0-indexed month (0 = January)
 */
export function buildCalendarMonth(
  year: number,
  month: number,
  loggedDates: string[],
  today = new Date(),
): CalendarCell[] {
  const loggedSet = new Set(loggedDates);
  const todayKey = toDateKey(today);

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: CalendarCell[] = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push({ type: 'empty' });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const key = toDateKey(new Date(year, month, d));
    let state: DayState;
    if (key > todayKey) {
      state = 'future';
    } else if (key === todayKey) {
      state = loggedSet.has(key) ? 'todayLogged' : 'today';
    } else {
      state = loggedSet.has(key) ? 'logged' : 'missed';
    }
    cells.push({ type: 'day', dateKey: key, state });
  }

  while (cells.length < 42) {
    cells.push({ type: 'empty' });
  }

  return cells;
}

// ─── 7-day strip ───────────────────────────────────────────────────────────────

export type DayDot = {
  dateKey: string;
  logged: boolean;
  isToday: boolean;
};

/** Returns the last 7 days, oldest first, today last. */
export function buildWeekDots(loggedDates: string[], today = new Date()): DayDot[] {
  const loggedSet = new Set(loggedDates);
  const todayKey = toDateKey(today);
  const result: DayDot[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    result.push({ dateKey: key, logged: loggedSet.has(key), isToday: key === todayKey });
  }

  return result;
}
