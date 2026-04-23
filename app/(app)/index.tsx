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
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Header } from '@/src/components/Header';
import { FullScreenLoader } from '@/src/components/FullScreenLoader';
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header user={user} onLogout={handleLogout} />

      <View style={styles.container}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Usuário autenticado</Text>
          <Text style={styles.infoText}>Nome: {user?.nome ?? '-'}</Text>
          <Text style={styles.infoText}>CNPJ: {user?.cnpj ?? '-'}</Text>
          <Text style={styles.infoText}>Telefone: {user?.fone ?? '-'}</Text>
          <Text style={styles.infoText}>E-mail: {user?.email ?? '-'}</Text>
          <Text style={styles.infoText}>Contratante: {user?.contratante ? 'Sim' : 'Não'}</Text>
        </View>

        <View style={styles.centerArea}>
          {user?.contratante ? (
            <Pressable style={styles.mainButton} onPress={handleGenerateQrCode} disabled={loading}>
              <Text style={styles.mainButtonText}>{loading ? 'Gerando...' : 'Gerar QR Code'}</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.mainButton} onPress={handleOpenScanner} disabled={submittingPoint}>
              <Text style={styles.mainButtonText}>{submittingPoint ? 'Registrando...' : 'Abrir câmera'}</Text>
            </Pressable>
          )}
        </View>
      </View>

      <Modal visible={scannerOpen} animationType="slide" onRequestClose={() => setScannerOpen(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ler QR Code</Text>
            <Pressable onPress={() => setScannerOpen(false)}>
              <Text style={styles.closeText}>Fechar</Text>
            </Pressable>
          </View>

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
          <Text style={styles.cameraHint}>Aponte a câmera para o QR Code do contratante.</Text>
        </SafeAreaView>
      </Modal>

      <Modal visible={qrModalOpen} transparent animationType="fade" onRequestClose={() => setQrModalOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.qrCard}>
            <Text style={styles.modalTitle}>Seu QR Code</Text>
            {qrBase64 ? (
              <Pressable onPress={() => setQrFullscreenOpen(true)}>
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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>QR Code em tela cheia</Text>
            <Pressable onPress={() => setQrFullscreenOpen(false)}>
              <Text style={styles.closeText}>Fechar</Text>
            </Pressable>
          </View>
          {qrBase64 ? (
            <Image source={{ uri: `data:image/png;base64,${qrBase64}` }} style={styles.fullscreenImage} resizeMode="contain" />
          ) : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, gap: 24 },
  infoCard: {
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#fff',
    padding: 16,
    gap: 8,
  },
  infoTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  infoText: { fontSize: 14, color: '#111' },
  centerArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mainButton: {
    backgroundColor: '#111',
    minWidth: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  mainButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalContainer: { flex: 1, backgroundColor: '#000' },
  modalHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  modalTitle: { color: '#111', fontSize: 18, fontWeight: '700' },
  closeText: { color: '#111', fontSize: 16, fontWeight: '700' },
  camera: { flex: 1 },
  cameraHint: {
    color: '#fff',
    textAlign: 'center',
    padding: 16,
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  qrCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#111',
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  qrImage: { width: 260, height: 260 },
  qrHint: { color: '#444', fontSize: 14, textAlign: 'center' },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#111',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  secondaryButtonText: { color: '#111', fontWeight: '700' },
  fullscreenContainer: { flex: 1, backgroundColor: '#fff' },
  fullscreenImage: { flex: 1, width: '100%' },
});
