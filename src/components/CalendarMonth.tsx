import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { buildCalendarMonth, type DayState } from '../lib/dates';
import { colors, fonts, fontSizes, spacing } from '../lib/theme';

// Monday-first weekday labels
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type Props = {
  year: number;
  month: number; // 0-indexed
  loggedDates: string[];
};

// Card has 16px side margin + 18px inner padding on each side
const CARD_HORIZONTAL = (16 + 18) * 2;
const GRID_GAP = 6;

export default function CalendarMonth({ year, month, loggedDates }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  // Compute cell size so all 7 columns fit with 6 gaps
  const cellSize = Math.floor((screenWidth - CARD_HORIZONTAL - GRID_GAP * 6) / 7);

  const cells = buildCalendarMonth(year, month, loggedDates);
  const monthLabel = new Date(year, month, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <View>
      <Text style={styles.monthLabel}>{monthLabel}</Text>

      <View style={styles.grid}>
        {/* Weekday headers */}
        {WEEKDAYS.map((d, i) => (
          <View key={`wd-${i}`} style={{ width: cellSize, height: cellSize, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.weekdayText}>{d}</Text>
          </View>
        ))}

        {/* Day cells */}
        {cells.map((cell, i) => {
          if (cell.type === 'empty') {
            return <View key={`e-${i}`} style={{ width: cellSize, height: cellSize }} />;
          }
          const day = parseInt(cell.dateKey.slice(-2), 10);
          return (
            <View key={cell.dateKey} style={{ width: cellSize, height: cellSize, alignItems: 'center', justifyContent: 'center' }}>
              <View style={[{ width: cellSize, height: cellSize, borderRadius: cellSize / 2, alignItems: 'center', justifyContent: 'center' }, circleStyle(cell.state)]}>
                <Text style={[styles.dayNumber, textStyle(cell.state)]}>{day}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <LegendItem dotStyle={styles.legendLogged} label="Logged" />
        <LegendItem dotStyle={styles.legendMissed} label="Missed" />
        <LegendItem dotStyle={styles.legendToday} label="Today" />
      </View>
    </View>
  );
}

function LegendItem({ dotStyle, label }: { dotStyle: object; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, dotStyle]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function circleStyle(state: DayState): object {
  switch (state) {
    case 'logged':
      return { backgroundColor: colors.calendar.logged };
    case 'todayLogged':
      return { backgroundColor: colors.calendar.todayLogged };
    case 'missed':
      return { backgroundColor: colors.calendar.missed };
    case 'today':
      return {
        backgroundColor: colors.calendar.today,
        borderWidth: 1.5,
        borderStyle: 'dashed' as const,
        borderColor: colors.accent,
      };
    case 'future':
      return { backgroundColor: 'transparent' };
  }
}

function textStyle(state: DayState): object {
  switch (state) {
    case 'logged':
    case 'todayLogged':
      return { color: colors.text.onAccent };
    case 'missed':
      return { color: colors.text.muted };
    case 'today':
      return { color: colors.accent };
    case 'future':
      return { color: colors.text.muted };
  }
}

const styles = StyleSheet.create({
  monthLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.title,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  weekdayText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.caption,
    color: colors.text.muted,
    textAlign: 'center',
  },
  dayNumber: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 18,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.caption,
    color: colors.text.secondary,
  },
  legendLogged: {
    backgroundColor: colors.calendar.logged,
  },
  legendMissed: {
    backgroundColor: colors.calendar.missed,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legendToday: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.accent,
  },
});
