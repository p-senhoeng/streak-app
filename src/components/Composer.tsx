import React, { useState, useRef } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, spacing, radii, cardShadow } from '../lib/theme';

type Props = {
  onAdd: (name: string) => void;
};

export default function Composer({ onAdd }: Props) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleAdd = () => {
    const name = draft.trim();
    if (!name) return;
    onAdd(name);
    setDraft('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={draft}
        onChangeText={setDraft}
        placeholder="New streak…"
        placeholderTextColor={colors.text.muted}
        returnKeyType="done"
        onSubmitEditing={handleAdd}
        autoFocus
        autoCapitalize="words"
      />
      <Pressable
        style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
        onPress={handleAdd}
        accessibilityRole="button"
        accessibilityLabel="Add streak"
      >
        <Text style={styles.addText}>Add</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginHorizontal: spacing.base,
    marginBottom: spacing.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: spacing.sm,
    ...cardShadow,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSizes.title,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  addButton: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    height: 38,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonPressed: {
    opacity: 0.8,
  },
  addText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.body,
    color: colors.text.onAccent,
  },
});
