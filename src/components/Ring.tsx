import React, { useEffect, useRef } from 'react';
import { StyleSheet, Pressable, Animated } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors } from '../lib/theme';

// Checkmark SVG path, designed for a 24×24 viewBox.
const CHECK_PATH = 'M5 12.5 l4.5 4.5 L19 7';

type Props = {
  logged: boolean;
  size: number;
  onToggle: () => void;
  accessibilityLabel?: string;
};

export default function Ring({ logged, size, onToggle, accessibilityLabel }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const coverOpacity = useRef(new Animated.Value(logged ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(coverOpacity, {
      toValue: logged ? 0 : 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [logged, coverOpacity]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.84,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  const iconSize = size * 0.58;

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (logged ? 'Logged' : 'Log today')}
      accessibilityState={{ selected: logged }}
      hitSlop={8}
    >
      <Animated.View style={{ width: size, height: size, transform: [{ scale }] }}>
        {/* Base layer — accent-fill circle with accent checkmark, revealed when logged */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.circle,
            { borderRadius: size / 2, backgroundColor: colors.accentFill },
          ]}
        >
          <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24">
            <Path
              d={CHECK_PATH}
              stroke={colors.accent}
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </Animated.View>

        {/* Cover layer — dark ring, fades out to reveal green base when logged */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.circle,
            {
              borderRadius: size / 2,
              backgroundColor: colors.ringUnlogged,
              borderWidth: 1.5,
              borderColor: colors.border,
              opacity: coverOpacity,
            },
          ]}
        >
          <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24">
            <Path
              d={CHECK_PATH}
              stroke={colors.text.muted}
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
