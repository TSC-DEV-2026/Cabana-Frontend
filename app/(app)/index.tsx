import { CameraView, BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import * as React from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Header } from '@/src/components/Header';
import { FullScreenLoader } from '@/src/components/FullScreenLoader';
import { shadows, theme } from '@/src/constants/theme';
import { usersService } from '@/src/services/users.service';
import { useAuthStore } from '@/src/store/auth.store';
import type { AuthState } from '@/src/store/auth.store';
import { formatDateOnly, formatTimeIso } from '@/src/utils/date';
import { unmaskDigits } from '@/src/utils/masks';

export default function HomePage() {
  const user = useAuthStore((state: AuthState) => state.user);
  const clearSession = useAuthStore((state: AuthState) => state.clearSession);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [loading, setLoading] = React.useState(false);
  const [scannerOpen, setScannerOpen] = React.useState(false);
  const [submittingPoint, setSubmittingPoint] = React.useState(false);
  const [qrBase64, setQrBase64] = React.useState<string | null>(null);
  const [qrModalOpen, setQrModalOpen] = React.useState(false);
  const [qrFullscreenOpen, setQrFullscreenOpen] = React.useState(false);
  const scannedRef = React.useRef(false);

  const fetchMe = React.useCallback(async () => {
    try {
      setLoading(true);
      const freshUser = await usersService.me();
      useAuthStore.getState().setUser(freshUser);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível carregar seus dados.';
      Alert.alert('Erro', message, [{ text: 'OK', onPress: () => clearSession() }]);
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useFocusEffect(
    React.useCallback(() => {
      fetchMe();
    }, [fetchMe])
  );

  const handleLogout = async () => {
    try {
      await usersService.logout();
    } catch {
      // logout local mesmo se a API falhar
    } finally {
      await clearSession();
    }
  };

  const handleOpenScanner = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Indisponível', 'Leitura de QR Code não foi preparada para web neste projeto.');
      return;
    }

    if (!cameraPermission?.granted) {
      const response = await requestCameraPermission();
      if (!response.granted) {
        Alert.alert('Permissão necessária', 'Autorize o uso da câmera para ler o QR Code.');
        return;
      }
    }

    scannedRef.current = false;
    setScannerOpen(true);
  };

  const handleRegisterPoint = async (rawValue: string) => {
    const cnpj = unmaskDigits(rawValue);

    if (cnpj.length !== 14) {
      Alert.alert('QR Code inválido', 'O conteúdo lido não contém um CNPJ válido.');
      scannedRef.current = false;
      return;
    }

    try {
      setSubmittingPoint(true);
      setScannerOpen(false);
      await usersService.registerPoint({
        cnpj,
        data: formatDateOnly(new Date()),
        hora: formatTimeIso(new Date()),
      });
      Alert.alert('Sucesso', 'Ponto registrado com sucesso.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível registrar o ponto.';
      Alert.alert('Erro', message);
      scannedRef.current = false;
    } finally {
      setSubmittingPoint(false);
    }
  };

  const handleGenerateQrCode = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await usersService.getQrCode(user.id);
      setQrBase64(response.qrcode_base64);
      setQrModalOpen(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível gerar o QR Code.';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return <FullScreenLoader message="Carregando dados..." />;
  }

  const isContractor = !!user?.contratante;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header user={user} onLogout={handleLogout} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroEyebrow}>{isContractor ? 'Painel do contratante' : 'Registro de ponto'}</Text>
            <Text style={styles.heroTitle}>Olá, {user?.nome?.split(' ')[0] ?? 'usuário'}.</Text>
            <Text style={styles.heroDescription}>
              {isContractor
                ? 'Gere seu QR Code para registrar a presença dos colaboradores de forma rápida.'
                : 'Use a câmera para ler o QR Code do contratante e registrar seu ponto com segurança.'}
            </Text>
          </View>
        </View>

        <View>
          <Pressable
            style={[styles.mainButton, (loading || submittingPoint) && styles.mainButtonDisabled]}
            onPress={isContractor ? handleGenerateQrCode : handleOpenScanner}
            disabled={loading || submittingPoint}
          >
            <MaterialCommunityIcons
              name={isContractor ? 'qrcode-plus' : 'camera-outline'}
              size={20}
              color={theme.colors.white}
            />
            <Text style={styles.mainButtonText}>
              {isContractor ? (loading ? 'Gerando...' : 'Gerar QR Code') : submittingPoint ? 'Registrando...' : 'Abrir câmera'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={scannerOpen} animationType="slide" onRequestClose={() => setScannerOpen(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeaderFloating}>
            <Text style={styles.modalTitleLight}>Ler QR Code</Text>
            <Pressable style={styles.closeButtonLight} onPress={() => setScannerOpen(false)}>
              <Text style={styles.closeButtonLightText}>Fechar</Text>
            </Pressable>
          </View>

          <View style={styles.cameraShell}>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={(result: BarcodeScanningResult) => {
                if (scannedRef.current) return;
                scannedRef.current = true;
                handleRegisterPoint(result.data);
              }}
            />
            <View style={styles.scanFrame} />
          </View>
          <Text style={styles.cameraHint}>Aponte a câmera para o QR Code do contratante.</Text>
        </SafeAreaView>
      </Modal>

      <Modal visible={qrModalOpen} transparent animationType="fade" onRequestClose={() => setQrModalOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.qrCard}>
            <View style={styles.qrTitleRow}>
              <Text style={styles.modalTitle}>Seu QR Code</Text>
              <View style={styles.successPill}>
                <Text style={styles.successPillText}>Sucesso</Text>
              </View>
            </View>
            {qrBase64 ? (
              <Pressable style={styles.qrImageWrap} onPress={() => setQrFullscreenOpen(true)}>
                <Image source={{ uri: `data:image/png;base64,${qrBase64}` }} style={styles.qrImage} resizeMode="contain" />
              </Pressable>
            ) : null}
            <Text style={styles.qrHint}>Toque na imagem para abrir em tela cheia.</Text>
            <Pressable style={styles.secondaryButton} onPress={() => setQrModalOpen(false)}>
              <Text style={styles.secondaryButtonText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={qrFullscreenOpen} animationType="fade" onRequestClose={() => setQrFullscreenOpen(false)}>
        <SafeAreaView style={styles.fullscreenContainer}>
          <View style={styles.modalHeaderSolid}>
            <Text style={styles.modalTitle}>QR Code em tela cheia</Text>
            <Pressable style={styles.closeButtonSolid} onPress={() => setQrFullscreenOpen(false)}>
              <Text style={styles.closeButtonSolidText}>Fechar</Text>
            </Pressable>
          </View>
          {qrBase64 ? (
            <View style={styles.fullscreenImageWrap}>
              <Image source={{ uri: `data:image/png;base64,${qrBase64}` }} style={styles.fullscreenImage} resizeMode="contain" />
            </View>
          ) : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoIconWrap}>
        <MaterialCommunityIcons name={icon} size={18} color={theme.colors.primary} />
      </View>
      <View style={styles.infoItemTextWrap}>
        <Text style={styles.infoItemLabel}>{label}</Text>
        <Text style={styles.infoItemValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 28, gap: 18, alignItems: 'center' },
  heroCard: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    padding: 22,
    gap: 16,
    ...shadows.card,
  },
  heroTextWrap: { gap: 8 },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: { color: theme.colors.white, fontWeight: '800', fontSize: 28 },
  heroDescription: { color: 'rgba(255,255,255,0.78)', fontSize: 14, lineHeight: 22 },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadgeSuccess: { backgroundColor: theme.colors.successSoft },
  statusBadgeInfo: { backgroundColor: theme.colors.infoSoft },
  statusBadgeText: { fontWeight: '800', fontSize: 13 },
  statusBadgeTextSuccess: { color: theme.colors.success },
  statusBadgeTextInfo: { color: theme.colors.info },
  infoCard: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 18,
    ...shadows.soft,
  },
  actionCard: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 14,
    ...shadows.soft,
  },
  sectionHeader: { gap: 4 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  sectionSubtitle: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 21 },
  infoGrid: { gap: 12 },
  infoItem: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoItemTextWrap: { flex: 1 },
  infoItemLabel: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '700', textTransform: 'uppercase' },
  infoItemValue: { marginTop: 4, fontSize: 15, color: theme.colors.text, fontWeight: '700' },
  mainButton: {
    width: '100%',
    maxWidth: 560,
    minHeight: 56,
    alignSelf: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    padding: 14,
    gap: 10,
    marginTop: 4,
  },
  mainButtonDisabled: { opacity: 0.7 },
  mainButtonText: { color: theme.colors.white, fontSize: 16, fontWeight: '800' },
  actionWrap: { width: '100%', alignItems: 'center' },
  modalContainer: { flex: 1, backgroundColor: theme.colors.black },
  modalHeaderFloating: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitleLight: { color: theme.colors.white, fontSize: 20, fontWeight: '800' },
  closeButtonLight: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: theme.radius.pill,
  },
  closeButtonLightText: { color: theme.colors.white, fontWeight: '800' },
  cameraShell: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  camera: { ...StyleSheet.absoluteFillObject },
  scanFrame: {
    width: 250,
    height: 250,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: theme.colors.white,
    backgroundColor: 'transparent',
  },
  cameraHint: {
    color: theme.colors.white,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  qrCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 20,
    alignItems: 'center',
    gap: 16,
    ...shadows.card,
  },
  qrTitleRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { color: theme.colors.text, fontSize: 20, fontWeight: '800' },
  successPill: {
    backgroundColor: theme.colors.successSoft,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  successPillText: { color: theme.colors.success, fontWeight: '800', fontSize: 12 },
  qrImageWrap: {
    width: '100%',
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    padding: 18,
    alignItems: 'center',
  },
  qrImage: { width: 260, height: 260 },
  qrHint: { color: theme.colors.textSecondary, fontSize: 14, textAlign: 'center' },
  secondaryButton: {
    minWidth: 150,
    minHeight: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  secondaryButtonText: { color: theme.colors.text, fontWeight: '800' },
  fullscreenContainer: { flex: 1, backgroundColor: theme.colors.background },
  modalHeaderSolid: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButtonSolid: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceMuted,
  },
  closeButtonSolidText: { color: theme.colors.text, fontWeight: '800' },
  fullscreenImageWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  fullscreenImage: { width: '100%', height: '100%' },
});
