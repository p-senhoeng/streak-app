import React from 'react';
import { View, StyleSheet } from 'react-native';
import { buildWeekDots } from '../lib/dates';
import { colors } from '../lib/theme';

type Props = {
  loggedDates: string[];
};

const DOT = 7;

export default function WeekDots({ loggedDates }: Props) {
  const dots = buildWeekDots(loggedDates);
  return (
    <View style={styles.row}>
      {dots.map(dot => (
        <View
          key={dot.dateKey}
          style={[styles.dot, dot.logged ? styles.logged : styles.unlogged]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT,
  },
  logged: {
    backgroundColor: colors.accent,
  },
  unlogged: {
    backgroundColor: colors.border,
  },
});
