import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { colors, fonts, fontSizes, spacing, radii, cardShadow, ringSize } from '../lib/theme';
import type { Streak } from '../types';
import { currentStreak, loggedToday } from '../lib/dates';
import Ring from './Ring';
import WeekDots from './WeekDots';

type Props = {
  streak: Streak;
  onNavigate: () => void;
  onToggle: () => void;
  editing: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
};

export default function StreakCard({
  streak,
  onNavigate,
  onToggle,
  editing,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
}: Props) {
  const count = currentStreak(new Set(streak.loggedDates));
  const isLogged = loggedToday(streak.loggedDates);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, !editing && pressed && styles.cardPressed]}
      onPress={editing ? undefined : onNavigate}
      disabled={editing}
      accessibilityRole="button"
      accessibilityLabel={`${streak.name}, ${count} day streak`}
    >
      {/* Top row: info + ring (or edit controls) */}
      <View style={styles.topRow}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{streak.name}</Text>
          <View style={styles.countRow}>
            <Text style={styles.count}>{count}</Text>
            <Text style={styles.streakLabel}> day streak</Text>
          </View>
        </View>
        {editing ? (
          <View style={styles.editControls}>
            <Pressable
              onPress={onMoveUp}
              disabled={isFirst}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Move ${streak.name} up`}
              style={[styles.iconButton, isFirst && styles.iconButtonDisabled]}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M18 15l-6-6-6 6"
                  stroke={colors.text.secondary}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
            </Pressable>
            <Pressable
              onPress={onMoveDown}
              disabled={isLast}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Move ${streak.name} down`}
              style={[styles.iconButton, isLast && styles.iconButtonDisabled]}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M6 9l6 6 6-6"
                  stroke={colors.text.secondary}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
            </Pressable>
            <Pressable
              onPress={onDelete}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${streak.name}`}
              style={[styles.iconButton, styles.deleteButton]}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"
                  stroke={colors.danger}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
            </Pressable>
          </View>
        ) : (
          /* Ring must stop press from bubbling to card nav */
          <View>
            <Ring
              logged={isLogged}
              size={ringSize.card}
              onToggle={onToggle}
              accessibilityLabel={`${streak.name}: ${isLogged ? 'Logged' : 'Log today'}`}
            />
          </View>
        )}
      </View>

      {/* Bottom row: 7-day dots + caption */}
      <View style={styles.bottomRow}>
        <WeekDots loggedDates={streak.loggedDates} />
        <Text style={styles.caption}>last 7 days</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingVertical: spacing.base,
    paddingHorizontal: 18,
    ...cardShadow,
  },
  cardPressed: {
    opacity: 0.85,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  info: {
    flex: 1,
  },
  editControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonDisabled: {
    opacity: 0.35,
  },
  deleteButton: {
    backgroundColor: colors.dangerFill,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.title,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  count: {
    fontFamily: fonts.extraBold,
    fontSize: 30,
    color: colors.accent,
    letterSpacing: -0.6,
  },
  streakLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.label,
    color: colors.text.secondary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.text.muted,
  },
});
