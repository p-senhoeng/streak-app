// ─── Navigation ──────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Home: undefined;
  Detail: { streakId: string };
};

// ─── Domain ───────────────────────────────────────────────────────────────────

/**
 * The ONLY persisted shape. count/best/loggedToday are always derived — never
 * stored. See ARCHITECTURE.md §2 for the full rationale.
 */
export type Streak = {
  id: string;
  name: string;
  createdAt: string;   // ISO timestamp, informational only
  loggedDates: string[]; // sorted, de-duped local YYYY-MM-DD keys
};
