import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function FullScreenLoader({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#111" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    gap: 12,
  },
  message: { color: '#111', fontSize: 15 },
});
