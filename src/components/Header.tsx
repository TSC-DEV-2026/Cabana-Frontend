import * as React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';


import { shadows, theme } from '@/src/constants/theme';
import { UserMe } from '@/src/types/auth';

export function Header({ user, onLogout }: { user: UserMe | null; onLogout: () => void | Promise<void> }) {
  const [open, setOpen] = React.useState(false);
  const insets = useSafeAreaInsets();
  const initials = (user?.nome ?? 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <>
      <View style={[styles.wrapper, { paddingTop: Math.max(insets.top + 8, 18) }] }>
        <View style={styles.headerShell}>
          <View style={styles.header}>
            <Pressable style={styles.profileButton} onPress={() => setOpen(true)}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{initials || 'U'}</Text>
              </View>

              <View style={styles.profileTextWrap}>
                <Text numberOfLines={1} style={styles.profileName}>{user?.nome ?? 'Usuário'}</Text>
                <Text numberOfLines={1} style={styles.profileRole}>{user?.contratante ? 'Contratante' : 'Colaborador'}</Text>
              </View>

              <View style={styles.chevronWrap}>
                <MaterialCommunityIcons name="chevron-down" size={20} color={theme.colors.textSecondary} />
              </View>
            </Pressable>
          </View>
        </View>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={[styles.dropdown, { marginTop: 10 }]} onPress={(event) => event.stopPropagation()}>
            <View style={styles.dropdownTop}>
              <View style={styles.dropdownAvatar}>
                <Text style={styles.dropdownAvatarText}>{initials || 'U'}</Text>
              </View>
              <View style={styles.dropdownIdentity}>
                <Text numberOfLines={1} style={styles.dropdownTitle}>{user?.nome ?? '-'}</Text>
                <Text numberOfLines={1} style={styles.dropdownSubtitle}>{user?.email ?? '-'}</Text>
              </View>
            </View>

            <View style={styles.infoBadgeRow}>
              <View style={[styles.infoBadge, styles.infoBadgeNeutral]}>
                <Text style={styles.infoBadgeText}>CNPJ</Text>
                <Text numberOfLines={1} style={styles.infoBadgeValue}>{user?.cnpj ?? '-'}</Text>
              </View>
              <View style={[styles.infoBadge, user?.contratante ? styles.infoBadgeSuccess : styles.infoBadgeInfo]}>
                <Text style={styles.infoBadgeText}>Perfil</Text>
                <Text style={styles.infoBadgeValue}>{user?.contratante ? 'Contratante' : 'Colaborador'}</Text>
              </View>
            </View>

            <Pressable style={styles.logoutButton} onPress={onLogout}>
              <MaterialCommunityIcons name="logout" size={18} color={theme.colors.white} />
              <Text style={styles.logoutButtonText}>Sair da conta</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerShell: {
    width: '100%',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: theme.colors.surface,
    borderRadius: 26,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...shadows.card,
  },
  profileButton: {
    width: '100%',
    minHeight: 58,
    borderRadius: 20,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: theme.colors.white, fontWeight: '800', fontSize: 15 },
  profileTextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: { color: theme.colors.text, fontWeight: '800', fontSize: 15 },
  profileRole: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 },
  chevronWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dropdown: {
    marginBottom: 18,
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    gap: 16,
    ...shadows.card,
  },
  dropdownTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  dropdownAvatar: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownAvatarText: { color: theme.colors.white, fontSize: 18, fontWeight: '800' },
  dropdownIdentity: { flex: 1 },
  dropdownTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  dropdownSubtitle: { color: theme.colors.textSecondary, fontSize: 13, marginTop: 4 },
  infoBadgeRow: { gap: 10 },
  infoBadge: { borderRadius: theme.radius.md, padding: 12 },
  infoBadgeNeutral: { backgroundColor: theme.colors.surfaceMuted },
  infoBadgeSuccess: { backgroundColor: theme.colors.successSoft },
  infoBadgeInfo: { backgroundColor: theme.colors.infoSoft },
  infoBadgeText: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '700', textTransform: 'uppercase' },
  infoBadgeValue: { marginTop: 4, fontSize: 14, color: theme.colors.text, fontWeight: '700' },
  logoutButton: {
    marginTop: 4,
    backgroundColor: theme.colors.danger,
    borderRadius: theme.radius.md,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  logoutButtonText: { color: theme.colors.white, fontWeight: '800', fontSize: 15 },
});
