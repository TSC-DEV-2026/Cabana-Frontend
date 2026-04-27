import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from "react";

import { shadows, theme } from '@/src/constants/theme';

export function FullScreenLoader({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="pine-tree" size={28} color={theme.colors.primary} />
        </View>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.title}>Cabana</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...shadows.card,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '800' },
  message: { color: theme.colors.textSecondary, fontSize: 15, textAlign: 'center' },
});
