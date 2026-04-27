import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthBootstrap } from '@/src/components/AuthBootstrap';
import { theme } from '@/src/constants/theme';
import React from 'react';

export default function RootLayout() {
  return (
    <>
      <AuthBootstrap />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
      <StatusBar style="dark" backgroundColor={theme.colors.background} />
    </>
  );
}
