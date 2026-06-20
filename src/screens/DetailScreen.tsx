import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  AppState,
  StyleSheet,
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, fontSizes, spacing, radii, cardShadow, cardShadowHigh, ringSize } from '../lib/theme';
import type { RootStackParamList } from '../types';
import { useStreaks } from '../store/StreakContext';
import { currentStreak, bestStreak, loggedToday } from '../lib/dates';
import Ring from '../components/Ring';
import CalendarMonth from '../components/CalendarMonth';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export default function DetailScreen({ route, navigation }: Props) {
  const { streakId } = route.params;
  const { state, dispatch } = useStreaks();
  const insets = useSafeAreaInsets();
  // Recompute "today" when returning to foreground
  const [, setTick] = useState(0);

  useEffect(() => {
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') setTick(t => t + 1);
    });
    return () => sub.remove();
  }, []);

  const streak = state.streaks.find(s => s.id === streakId);

  if (!streak) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Streak not found.</Text>
      </View>
    );
  }

  const today = new Date();
  const count = currentStreak(new Set(streak.loggedDates), today);
  const best = bestStreak(streak.loggedDates);
  const isLogged = loggedToday(streak.loggedDates, today);

  const handleToggle = () => dispatch({ type: 'TOGGLE_TODAY', id: streakId });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.sm }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Back row */}
        <Pressable
          style={styles.backRow}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back to Streaks"
          hitSlop={8}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path
              d="M15 18l-6-6 6-6"
              stroke={colors.accent}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
          <Text style={styles.backLabel}>Streaks</Text>
        </Pressable>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>{streak.name}</Text>

        {/* Stat card */}
        <View style={[styles.card, styles.statCard]}>
          <View style={styles.statLeft}>
            <View style={styles.countRow}>
              <Text style={styles.bigCount}>{count}</Text>
              <Text style={styles.dayStreakLabel}> day streak</Text>
            </View>
            <Text style={styles.bestLabel}>Best · {best} days</Text>
          </View>
          <View style={styles.statRight}>
            <Ring
              logged={isLogged}
              size={ringSize.detail}
              onToggle={handleToggle}
              accessibilityLabel={isLogged ? 'Logged today' : 'Log today'}
            />
            <Text style={[styles.logLabel, isLogged ? styles.logLabelLogged : styles.logLabelUnlogged]}>
              {isLogged ? 'Logged' : 'Log today'}
            </Text>
          </View>
        </View>

        {/* Calendar card */}
        <View style={[styles.card, styles.calendarCard]}>
          <CalendarMonth
            year={today.getFullYear()}
            month={today.getMonth()}
            loggedDates={streak.loggedDates}
          />
        </View>

        <View style={{ height: insets.bottom + spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 40,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
  },
  backLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.title,
    color: colors.accent,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 28,
    color: colors.text.primary,
    letterSpacing: -0.5,
    paddingHorizontal: 22,
    paddingBottom: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    marginHorizontal: spacing.base,
    ...cardShadow,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: spacing.base,
    ...cardShadowHigh,
  },
  statLeft: {
    flex: 1,
    gap: 4,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bigCount: {
    fontFamily: fonts.extraBold,
    fontSize: 40,
    color: colors.accent,
    letterSpacing: -1,
  },
  dayStreakLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.label,
    color: colors.text.secondary,
    marginLeft: 2,
  },
  bestLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.label,
    color: colors.text.muted,
  },
  statRight: {
    alignItems: 'center',
    gap: 6,
  },
  logLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.label,
  },
  logLabelLogged: {
    color: colors.accent,
  },
  logLabelUnlogged: {
    color: colors.text.secondary,
  },
  calendarCard: {
    padding: 18,
    marginBottom: spacing.base,
  },
});
