import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import DetailScreen from './src/screens/DetailScreen';
import { StreakProvider } from './src/store/StreakContext';
import { colors } from './src/lib/theme';
import type { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_800ExtraBold,
  });

  // Hold the splash screen until fonts are ready.
  // expo-splash-screen is wired by default in Expo managed — returning null
  // keeps the OS splash visible (no content flash).
  if (!fontsLoaded) {
    return null;
  }

  return (
    <StreakProvider>
      <StatusBar style="light" backgroundColor={colors.systemBar} />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text.primary,
            headerTitleStyle: { fontFamily: 'Inter_600SemiBold' },
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Detail"
            component={DetailScreen}
            options={{ title: 'Streak Detail' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </StreakProvider>
  );
}
