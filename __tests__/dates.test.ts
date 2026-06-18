import {
  toDateKey,
  fromDateKey,
  loggedToday,
  currentStreak,
  bestStreak,
  buildCalendarMonth,
  buildWeekDots,
} from '../src/lib/dates';

// Shorthand: build a local-midnight Date from a key string
const d = (key: string) => new Date(key + 'T00:00:00');

// ─── toDateKey ────────────────────────────────────────────────────────────────

describe('toDateKey', () => {
  it('formats to YYYY-MM-DD using local components', () => {
    expect(toDateKey(new Date(2024, 5, 18))).toBe('2024-06-18');
  });

  it('pads single-digit month and day', () => {
    expect(toDateKey(new Date(2024, 0, 5))).toBe('2024-01-05');
  });

  it('uses local date near midnight, not UTC', () => {
    // 2024-06-18 23:30 local. toDateKey must return the local date.
    const lateNight = new Date(2024, 5, 18, 23, 30, 0);
    expect(toDateKey(lateNight)).toBe('2024-06-18');
  });
});

// ─── fromDateKey ──────────────────────────────────────────────────────────────

describe('fromDateKey', () => {
  it('round-trips through toDateKey', () => {
    const key = '2024-06-18';
    expect(toDateKey(fromDateKey(key))).toBe(key);
  });
});

// ─── loggedToday ──────────────────────────────────────────────────────────────

describe('loggedToday', () => {
  it('returns true when today is logged', () => {
    expect(loggedToday(['2024-06-18'], d('2024-06-18'))).toBe(true);
  });

  it('returns false when today is absent', () => {
    expect(loggedToday(['2024-06-17'], d('2024-06-18'))).toBe(false);
  });

  it('returns false for empty array', () => {
    expect(loggedToday([], d('2024-06-18'))).toBe(false);
  });
});

// ─── currentStreak ────────────────────────────────────────────────────────────

describe('currentStreak', () => {
  it('returns 0 for empty set', () => {
    expect(currentStreak(new Set(), d('2024-06-18'))).toBe(0);
  });

  it('counts consecutive days ending today', () => {
    const logged = new Set(['2024-06-16', '2024-06-17', '2024-06-18']);
    expect(currentStreak(logged, d('2024-06-18'))).toBe(3);
  });

  it('grace rule: counts from yesterday when today is not yet logged', () => {
    // yesterday and two days ago are logged; today is not yet logged
    const logged = new Set(['2024-06-16', '2024-06-17']);
    expect(currentStreak(logged, d('2024-06-18'))).toBe(2);
  });

  it('returns 0 when neither today nor yesterday is logged', () => {
    const logged = new Set(['2024-06-15', '2024-06-16']);
    expect(currentStreak(logged, d('2024-06-18'))).toBe(0);
  });

  it('a gap in logged days breaks the streak', () => {
    // 18 and 17 are logged, 16 is skipped, 15 is logged
    const logged = new Set(['2024-06-15', '2024-06-17', '2024-06-18']);
    expect(currentStreak(logged, d('2024-06-18'))).toBe(2);
  });

  it('spans a month boundary correctly', () => {
    const logged = new Set(['2024-06-29', '2024-06-30', '2024-07-01', '2024-07-02']);
    expect(currentStreak(logged, d('2024-07-02'))).toBe(4);
  });

  it('grace rule also spans a month boundary', () => {
    // June 30 and 29 logged, July 1 not yet logged
    const logged = new Set(['2024-06-29', '2024-06-30']);
    expect(currentStreak(logged, d('2024-07-01'))).toBe(2);
  });
});

// ─── bestStreak ───────────────────────────────────────────────────────────────

describe('bestStreak', () => {
  it('returns 0 for empty array', () => {
    expect(bestStreak([])).toBe(0);
  });

  it('returns 1 for a single date', () => {
    expect(bestStreak(['2024-06-18'])).toBe(1);
  });

  it('returns 1 when no two dates are consecutive', () => {
    expect(bestStreak(['2024-06-01', '2024-06-03', '2024-06-05'])).toBe(1);
  });

  it('finds the longest consecutive run', () => {
    // 3-day run, gap, 5-day run
    const dates = [
      '2024-06-01', '2024-06-02', '2024-06-03',
      '2024-06-05',
      '2024-06-10', '2024-06-11', '2024-06-12', '2024-06-13', '2024-06-14',
    ];
    expect(bestStreak(dates)).toBe(5);
  });

  it('finds a past run that is longer than the current run', () => {
    // 5-day past run, then a gap, then only a 2-day recent run
    const dates = [
      '2024-05-01', '2024-05-02', '2024-05-03', '2024-05-04', '2024-05-05',
      '2024-06-17', '2024-06-18',
    ];
    expect(bestStreak(dates)).toBe(5);
  });

  it('handles out-of-order input by sorting first', () => {
    expect(bestStreak(['2024-06-03', '2024-06-01', '2024-06-02'])).toBe(3);
  });

  it('deduplicates dates before counting', () => {
    expect(bestStreak(['2024-06-01', '2024-06-01', '2024-06-02'])).toBe(2);
  });

  it('spans a month boundary', () => {
    expect(bestStreak(['2024-06-29', '2024-06-30', '2024-07-01', '2024-07-02'])).toBe(4);
  });
});

// ─── buildCalendarMonth ───────────────────────────────────────────────────────

describe('buildCalendarMonth', () => {
  const today = d('2024-06-18');

  it('always returns exactly 42 cells', () => {
    expect(buildCalendarMonth(2024, 5, [], today)).toHaveLength(42);
  });

  it('marks past logged days as logged', () => {
    const cells = buildCalendarMonth(2024, 5, ['2024-06-10'], today);
    const cell = cells.find(c => c.type === 'day' && c.dateKey === '2024-06-10');
    expect(cell).toEqual({ type: 'day', dateKey: '2024-06-10', state: 'logged' });
  });

  it('marks past unlogged days as missed', () => {
    const cells = buildCalendarMonth(2024, 5, [], today);
    const cell = cells.find(c => c.type === 'day' && c.dateKey === '2024-06-01');
    expect(cell).toEqual({ type: 'day', dateKey: '2024-06-01', state: 'missed' });
  });

  it('marks today unlogged as today', () => {
    const cells = buildCalendarMonth(2024, 5, [], today);
    const cell = cells.find(c => c.type === 'day' && c.dateKey === '2024-06-18');
    expect(cell).toEqual({ type: 'day', dateKey: '2024-06-18', state: 'today' });
  });

  it('marks today logged as todayLogged', () => {
    const cells = buildCalendarMonth(2024, 5, ['2024-06-18'], today);
    const cell = cells.find(c => c.type === 'day' && c.dateKey === '2024-06-18');
    expect(cell).toEqual({ type: 'day', dateKey: '2024-06-18', state: 'todayLogged' });
  });

  it('marks future days as future', () => {
    const cells = buildCalendarMonth(2024, 5, [], today);
    const cell = cells.find(c => c.type === 'day' && c.dateKey === '2024-06-30');
    expect(cell).toEqual({ type: 'day', dateKey: '2024-06-30', state: 'future' });
  });

  it('correctly pads the first row when month starts mid-week', () => {
    // June 2024 starts on Saturday (day 6), so 6 leading empty cells
    const cells = buildCalendarMonth(2024, 5, [], today);
    const leadingEmpties = cells.slice(0, 6);
    expect(leadingEmpties.every(c => c.type === 'empty')).toBe(true);
    expect(cells[6]).toEqual(expect.objectContaining({ type: 'day', dateKey: '2024-06-01' }));
  });
});

// ─── buildWeekDots ────────────────────────────────────────────────────────────

describe('buildWeekDots', () => {
  const today = d('2024-06-18');

  it('returns exactly 7 items', () => {
    expect(buildWeekDots([], today)).toHaveLength(7);
  });

  it('is ordered oldest first, today last', () => {
    const dots = buildWeekDots([], today);
    expect(dots[0].dateKey).toBe('2024-06-12');
    expect(dots[6].dateKey).toBe('2024-06-18');
  });

  it('marks today correctly', () => {
    const dots = buildWeekDots([], today);
    expect(dots[6].isToday).toBe(true);
    expect(dots[0].isToday).toBe(false);
  });

  it('marks logged and unlogged days', () => {
    const dots = buildWeekDots(['2024-06-16', '2024-06-18'], today);
    expect(dots.find(dot => dot.dateKey === '2024-06-16')?.logged).toBe(true);
    expect(dots.find(dot => dot.dateKey === '2024-06-17')?.logged).toBe(false);
    expect(dots.find(dot => dot.dateKey === '2024-06-18')?.logged).toBe(true);
  });

  it('spans a month boundary', () => {
    const julToday = d('2024-07-02');
    const dots = buildWeekDots(['2024-06-30', '2024-07-01'], julToday);
    expect(dots.find(dot => dot.dateKey === '2024-06-30')?.logged).toBe(true);
    expect(dots.find(dot => dot.dateKey === '2024-07-01')?.logged).toBe(true);
    expect(dots.find(dot => dot.dateKey === '2024-06-29')?.logged).toBe(false);
  });
});
