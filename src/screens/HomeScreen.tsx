import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, fontSizes, spacing } from '../lib/theme';
import type { RootStackParamList } from '../types';
import { useStreaks } from '../store/StreakContext';
import { loggedToday } from '../lib/dates';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { state, dispatch } = useStreaks();
  const firstStreak = state.streaks[0];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Streaks</Text>
      <Text style={styles.subtitle}>Placeholder — Phase 0</Text>
      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('Detail', { streakId: 'demo' })}
      >
        <Text style={styles.buttonText}>Open Detail →</Text>
      </Pressable>

      {/* THROWAWAY — persistence test: tap, kill app, relaunch, verify toggle survived */}
      {firstStreak && (
        <Pressable
          style={[styles.button, styles.testButton]}
          onPress={() => dispatch({ type: 'TOGGLE_TODAY', id: firstStreak.id })}
        >
          <Text style={styles.buttonText}>
            Toggle "{firstStreak.name}" today:{' '}
            {loggedToday(firstStreak.loggedDates) ? 'logged ✓' : 'not logged'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.base,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: fontSizes.heading,
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.body,
    color: colors.text.secondary,
  },
  button: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.accent,
    borderRadius: 999,
  },
  testButton: {
    backgroundColor: '#555',
  },
  buttonText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.body,
    color: colors.text.onAccent,
  },
});
