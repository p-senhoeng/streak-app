import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  AppState,
  Alert,
  StyleSheet,
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, fontSizes, spacing, radii } from '../lib/theme';
import type { RootStackParamList } from '../types';
import { useStreaks } from '../store/StreakContext';
import StreakCard from '../components/StreakCard';
import Composer from '../components/Composer';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { state, dispatch } = useStreaks();
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState(false);
  // Force re-render when app comes to foreground across midnight
  const [, setTick] = useState(0);
  const insets = useSafeAreaInsets();

  const addScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') setTick(t => t + 1);
    });
    return () => sub.remove();
  }, []);

  if (!state.hydrated) {
    return <View style={[styles.container, { paddingTop: insets.top + spacing.xxl }]} />;
  }

  const handleAdd = (name: string) => {
    dispatch({ type: 'ADD_STREAK', name });
    setComposing(false);
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete streak?',
      `“${name}” and all its logged days will be permanently removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch({ type: 'DELETE_STREAK', id }),
        },
      ],
    );
  };

  const pressIn = () => {
    Animated.spring(addScale, { toValue: 0.9, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  };

  const pressOut = () => {
    Animated.spring(addScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start();
  };

  const toggleComposer = () => {
    setEditing(false);
    setComposing(c => !c);
  };

  const toggleEditing = () => {
    setComposing(false);
    setEditing(e => !e);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 14 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Streaks</Text>
            <Text style={styles.headerSubtitle}>
              Tap a ring to log · tap a card for history
            </Text>
          </View>
          <View style={styles.headerActions}>
            {state.streaks.length > 0 && (
              <Pressable
                onPress={toggleEditing}
                accessibilityRole="button"
                accessibilityLabel={editing ? 'Done editing' : 'Edit streaks'}
                hitSlop={8}
              >
                <Text style={styles.editButton}>{editing ? 'Done' : 'Edit'}</Text>
              </Pressable>
            )}
            <Pressable
              onPress={toggleComposer}
              onPressIn={pressIn}
              onPressOut={pressOut}
              accessibilityRole="button"
              accessibilityLabel="Add streak"
              hitSlop={8}
            >
              <Animated.View style={[styles.addButton, { transform: [{ scale: addScale }] }]}>
                <Svg width={18} height={18} viewBox="0 0 24 24">
                  <Path
                    d="M12 5v14M5 12h14"
                    stroke={colors.text.onAccent}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                </Svg>
              </Animated.View>
            </Pressable>
          </View>
        </View>

        {/* Composer */}
        {composing && <Composer onAdd={handleAdd} />}

        {/* Streak list or empty state */}
        {state.streaks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No streaks yet</Text>
            <Text style={styles.emptyBody}>Tap + to add your first habit</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {state.streaks.map((streak, index) => (
              <StreakCard
                key={streak.id}
                streak={streak}
                editing={editing}
                isFirst={index === 0}
                isLast={index === state.streaks.length - 1}
                onNavigate={() => navigation.navigate('Detail', { streakId: streak.id })}
                onToggle={() => dispatch({ type: 'TOGGLE_TODAY', id: streak.id })}
                onMoveUp={() => dispatch({ type: 'MOVE_STREAK', id: streak.id, direction: 'up' })}
                onMoveDown={() => dispatch({ type: 'MOVE_STREAK', id: streak.id, direction: 'down' })}
                onDelete={() => confirmDelete(streak.id, streak.name)}
              />
            ))}
          </View>
        )}

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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 22,
    paddingBottom: 14,
    gap: spacing.base,
  },
  headerLeft: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  editButton: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.body,
    color: colors.accent,
  },
  headerTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 30,
    color: colors.text.primary,
    letterSpacing: -0.6,
  },
  headerSubtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.label,
    color: colors.text.secondary,
    marginTop: 2,
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.title,
    color: colors.text.secondary,
  },
  emptyBody: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.body,
    color: colors.text.muted,
  },
});
