import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ScreenContainer } from '@/src/components/ScreenContainer';
import { shadows, theme } from '@/src/constants/theme';
import { authService } from '@/src/services/auth.service';
import { formatCnpj, formatPhone, unmaskDigits } from '@/src/utils/masks';

const schema = z.object({
  nome: z.string().trim().min(3, 'Informe o nome'),
  cnpj: z
    .string()
    .transform((value: string) => unmaskDigits(value))
    .refine((value: string) => value.length === 14, 'Informe um CNPJ válido'),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  fone: z
    .string()
    .transform((value: string) => unmaskDigits(value))
    .refine((value: string) => value.length >= 10 && value.length <= 11, 'Informe um telefone válido'),
  email: z.string().trim().email('Informe um e-mail válido'),
});

type FormValues = z.input<typeof schema>;

function extractErrorMessage(error: unknown): string {
  if (typeof error === 'string' && error.trim()) return error;

  if (error && typeof error === 'object') {
    const err = error as {
      message?: string;
      response?: {
        data?: {
          message?: string;
          error?: {
            message?: string;
          };
        };
      };
    };

    if (err.response?.data?.error?.message) return err.response.data.error.message;
    if (err.response?.data?.message) return err.response.data.message;
    if (err.message) return err.message;
  }

  return 'Não foi possível concluir o cadastro.';
}

export default function RegisterPage() {
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      cnpj: '',
      senha: '',
      fone: '',
      email: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setLoading(true);

      const payload = {
        nome: values.nome.trim(),
        cnpj: unmaskDigits(values.cnpj),
        senha: values.senha,
        fone: unmaskDigits(values.fone),
        email: values.email.trim().toLowerCase(),
      };

      await authService.register(payload);

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso.', [
        {
          text: 'OK',
          onPress: () => router.replace('/(auth)/login'),
        },
      ]);
    } catch (error) {
      Alert.alert('Erro', extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  });

  return (
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
        <View style={styles.heroCard}>
          <Text style={styles.title}>Crie sua conta</Text>
        </View>

        <View style={styles.card}>
          <Field label="Nome" error={errors.nome?.message} icon="account-outline" children={undefined}>
            <Controller
              control={control}
              name="nome"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Nome completo"
                  placeholderTextColor={theme.colors.textMuted}
                  autoCapitalize="words"
                  onBlur={onBlur}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </Field>

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

          <Field label="Telefone" error={errors.fone?.message} icon="phone-outline" children={undefined}>
            <Controller
              control={control}
              name="fone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="phone-pad"
                  onBlur={onBlur}
                  value={value}
                  onChangeText={(text) => onChange(formatPhone(text))}
                />
              )}
            />
          </Field>

          <Field label="E-mail" error={errors.email?.message} icon="email-outline" children={undefined}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="seuemail@dominio.com"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </Field>

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={onSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.replace('/(auth)/login')}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Voltar para login</Text>
          </Pressable>
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
  heroCard: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    marginTop: 15,
    padding: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
    ...shadows.soft,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
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
    height: 54,
    color: theme.colors.text,
    fontSize: 16,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: 54,
    color: theme.colors.text,
    fontSize: 16,
    paddingRight: 8,
  },
  passwordToggle: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: theme.colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    minHeight: 54,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
});