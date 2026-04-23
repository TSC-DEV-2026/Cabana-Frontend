import * as React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { UserMe } from '@/src/types/auth';

export function Header({ user, onLogout }: { user: UserMe | null; onLogout: () => void | Promise<void> }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.brand}>Cabana</Text>
        <Pressable style={styles.profileButton} onPress={() => setOpen(true)}>
          <Text style={styles.profileText}>{user?.nome ?? 'Usuário'}</Text>
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.dropdown} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.dropdownTitle}>{user?.nome ?? '-'}</Text>
            <Text style={styles.dropdownText}>{user?.email ?? '-'}</Text>
            <Text style={styles.dropdownText}>CNPJ: {user?.cnpj ?? '-'}</Text>
            <Text style={styles.dropdownText}>Perfil: {user?.contratante ? 'Contratante' : 'Usuário'}</Text>

            <Pressable style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutButtonText}>Sair</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#111',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  brand: { fontSize: 28, fontWeight: '700', color: '#111' },
  profileButton: {
    borderWidth: 1,
    borderColor: '#111',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  profileText: { color: '#111', fontWeight: '600', maxWidth: 140 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 72,
    paddingRight: 20,
  },
  dropdown: {
    width: 280,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#111',
    padding: 16,
    gap: 10,
  },
  dropdownTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  dropdownText: { fontSize: 14, color: '#111' },
  logoutButton: {
    marginTop: 8,
    backgroundColor: '#111',
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoutButtonText: { color: '#fff', fontWeight: '700' },
});
