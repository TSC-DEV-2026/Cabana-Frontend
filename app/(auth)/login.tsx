import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ScreenContainer } from '@/src/components/ScreenContainer';
import { shadows, theme } from '@/src/constants/theme';
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
  const [showPassword, setShowPassword] = React.useState(false);

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
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
        <View style={styles.card}>
          <Field label="CNPJ" error={errors.cnpj?.message} icon="office-building-outline" children={undefined}>
            <Controller
              control={control}
              name="cnpj"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="00.000.000/0000-00"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  value={value}
                  onChangeText={(text) => onChange(formatCnpj(text))}
                />
              )}
            />
          </Field>

          <Field label="Senha" error={errors.senha?.message} icon="lock-outline" children={undefined}>
            <Controller
              control={control}
              name="senha"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.passwordRow}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Digite sua senha"
                    placeholderTextColor={theme.colors.textMuted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onBlur={onBlur}
                    value={value}
                    onChangeText={onChange}
                  />

                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    style={styles.passwordToggle}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color={theme.colors.textSecondary}
                    />
                  </Pressable>
                </View>
              )}
            />
          </Field>

          <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={onSubmit} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Ainda não tem conta?</Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text style={styles.link}>Registrar-se</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

function Field({
  label,
  error,
  icon,
  children,
}: {
  label: string;
  error?: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}>
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={error ? theme.colors.danger : theme.colors.textSecondary}
        />

        <View style={styles.inputContent}>{children}</View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 28,
    gap: 18,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 22,
    gap: 16,
    ...shadows.card,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  inputWrapper: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.surfaceMuted,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputWrapperError: {
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.dangerSoft,
  },
  inputContent: {
    flex: 1,
  },
  input: {
    color: theme.colors.text,
    fontSize: 16,
    paddingVertical: 14,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    paddingVertical: 14,
    paddingRight: 8,
  },
  passwordToggle: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary,
    minHeight: 54,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  footerText: {
    color: theme.colors.textSecondary,
  },
  link: {
    color: theme.colors.info,
    fontWeight: '800',
  },
  error: {
    color: theme.colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
});