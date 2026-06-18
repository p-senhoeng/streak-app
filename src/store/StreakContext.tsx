import React, { createContext, useContext, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toDateKey } from '../lib/dates';
import type { Streak } from '../types';

// ─── State ────────────────────────────────────────────────────────────────────

type State = {
  streaks: Streak[];
  hydrated: boolean;
};

// ─── Actions ──────────────────────────────────────────────────────────────────

export type Action =
  | { type: 'HYDRATE'; streaks: Streak[] }
  | { type: 'ADD_STREAK'; name: string }
  | { type: 'TOGGLE_TODAY'; id: string };

// ─── Seed data ────────────────────────────────────────────────────────────────

// Converts prototype day-numbers (prototype "today" = day 18) to date offsets,
// then to real YYYY-MM-DD keys relative to the actual current date.
function makeSeedStreaks(): Streak[] {
  const today = new Date();
  const now = today.toISOString();

  const toKeys = (days: number[], loggedToday: boolean): string[] => {
    const offsets = new Set(days.map(d => d - 18));
    if (loggedToday) offsets.add(0);
    return [...offsets]
      .sort((a, b) => a - b)
      .map(offset => {
        const d = new Date(today);
        d.setDate(d.getDate() + offset);
        return toDateKey(d);
      });
  };

  return [
    {
      id: '1',
      name: 'Meditate',
      createdAt: now,
      loggedDates: toKeys([1,2,3,4,5,6,7,8,9,10,12,13,14,15,16,17], true),
    },
    {
      id: '2',
      name: 'Read 20 min',
      createdAt: now,
      loggedDates: toKeys([1,2,3,4,5,8,9,10,11,13,14,15,16,17], false),
    },
    {
      id: '3',
      name: 'Drink water',
      createdAt: now,
      loggedDates: toKeys([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17], true),
    },
    {
      id: '4',
      name: 'Morning run',
      createdAt: now,
      loggedDates: toKeys([1,3,4,8,9,12,15,16,17], false),
    },
  ];
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE':
      return { streaks: action.streaks, hydrated: true };

    case 'ADD_STREAK': {
      const name = action.name.trim();
      if (!name) return state;
      const newStreak: Streak = {
        id: Date.now().toString(),
        name,
        createdAt: new Date().toISOString(),
        loggedDates: [],
      };
      return { ...state, streaks: [...state.streaks, newStreak] };
    }

    case 'TOGGLE_TODAY': {
      const todayKey = toDateKey(new Date());
      return {
        ...state,
        streaks: state.streaks.map(s => {
          if (s.id !== action.id) return s;
          const dateSet = new Set(s.loggedDates);
          if (dateSet.has(todayKey)) {
            dateSet.delete(todayKey);
          } else {
            dateSet.add(todayKey);
          }
          return { ...s, loggedDates: [...dateSet].sort() };
        }),
      };
    }
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = '@streaks_v1';

type ContextValue = {
  state: State;
  dispatch: React.Dispatch<Action>;
};

const StreakContext = createContext<ContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function StreakProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { streaks: [], hydrated: false });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        const stored = raw ? (JSON.parse(raw) as Streak[]) : null;
        dispatch({ type: 'HYDRATE', streaks: stored ?? makeSeedStreaks() });
      })
      .catch(() => {
        dispatch({ type: 'HYDRATE', streaks: makeSeedStreaks() });
      });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.streaks)).catch(() => {
      // Persistence failure is silent — next change will retry automatically.
    });
  }, [state]);

  return (
    <StreakContext.Provider value={{ state, dispatch }}>
      {children}
    </StreakContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStreaks(): ContextValue {
  const ctx = useContext(StreakContext);
  if (!ctx) throw new Error('useStreaks must be used within StreakProvider');
  return ctx;
}
