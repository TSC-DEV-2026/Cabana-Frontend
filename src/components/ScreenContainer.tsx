import { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from "react";

import { theme } from '@/src/constants/theme';

type ScreenContainerProps = PropsWithChildren<{
  scroll?: boolean;
  padded?: boolean;
}>;

export function ScreenContainer({ children, scroll = false, padded = true }: ScreenContainerProps) {
  const content = <View style={[styles.container, padded && styles.padded]}>{children}</View>;

  return (
    <SafeAreaView style={styles.safeArea} edges={[ 'left', 'right', 'bottom' ]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, backgroundColor: theme.colors.background },
  padded: { paddingHorizontal: 20, paddingBottom: 20 },
});
