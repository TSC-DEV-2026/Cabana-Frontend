import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { ScreenContainer } from '@/src/components/ScreenContainer';
import { authService } from '@/src/services/auth.service';
import { useAuthStore } from '@/src/store/auth.store';
import type { AuthState } from '@/src/store/auth.store';
import { formatCnpj, unmaskDigits } from '@/src/utils/masks';

const schema = z.object({
  cnpj: z
    .string()
    .transform((value: string) => unmaskDigits(value))
    .refine((value: string) => value.length === 14, 'Informe um CNPJ válido'),
  senha: z.string().min(1, 'Informe a senha'),
});

type FormValues = z.input<typeof schema>;

export default function LoginPage() {
  const setSession = useAuthStore((state: AuthState) => state.setSession);
  const setUser = useAuthStore((state: AuthState) => state.setUser);
  const [loading, setLoading] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cnpj: '',
      senha: '',
    },
  });

  const onSubmit = handleSubmit(async (values: FormValues) => {
    try {
      setLoading(true);
      const payload = schema.parse(values);
      const auth = await authService.login(payload);
      await setSession(auth.access_token, auth.token_type);
      const user = await authService.me();
      setUser(user);
      router.replace('/(app)');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível realizar o login.';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  });

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.card}>
          <Text style={styles.title}>Cabana</Text>
          <Text style={styles.subtitle}>Entre com seu CNPJ e senha</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>CNPJ</Text>
            <Controller
              control={control}
              name="cnpj"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="00.000.000/0000-00"
                  placeholderTextColor="#7a7a7a"
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  value={value}
                  onChangeText={(text) => onChange(formatCnpj(text))}
                />
              )}
            />
            {errors.cnpj ? <Text style={styles.error}>{errors.cnpj.message}</Text> : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Senha</Text>
            <Controller
              control={control}
              name="senha"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Digite sua senha"
                  placeholderTextColor="#7a7a7a"
                  secureTextEntry
                  autoCapitalize="none"
                  onBlur={onBlur}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.senha ? <Text style={styles.error}>{errors.senha.message}</Text> : null}
          </View>

          <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={onSubmit} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Não tem uma conta?</Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text style={styles.link}>Registrar-se</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}


const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: 'center' },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#111',
    padding: 24,
    gap: 16,
  },
  title: { fontSize: 32, fontWeight: '700', color: '#111' },
  subtitle: { fontSize: 14, color: '#444' },
  fieldGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#111' },
  input: {
    borderWidth: 1,
    borderColor: '#111',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#111',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#111',
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  footerText: { color: '#444' },
  link: { color: '#111', fontWeight: '700' },
  error: { color: '#b00020', fontSize: 13 },
});
