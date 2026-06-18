import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, fontSizes, spacing } from '../lib/theme';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export default function DetailScreen({ route }: Props) {
  const { streakId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detail</Text>
      <Text style={styles.subtitle}>Streak ID: {streakId}</Text>
      <Text style={styles.note}>Placeholder — Phase 0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: fontSizes.heading,
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.title,
    color: colors.accent,
  },
  note: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.body,
    color: colors.text.secondary,
  },
});
