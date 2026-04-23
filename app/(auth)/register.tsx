import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { ScreenContainer } from '@/src/components/ScreenContainer';
import { authService } from '@/src/services/auth.service';
import { formatCnpj, formatPhone, unmaskDigits } from '@/src/utils/masks';

const schema = z.object({
  nome: z.string().trim().min(3, 'Informe o nome'),
  cnpj: z
    .string()
    .min(18, 'Informe um CNPJ válido')
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

export default function RegisterPage() {
  const [loading, setLoading] = React.useState(false);

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

  const onSubmit = handleSubmit(async (values: FormValues) => {
    try {
      setLoading(true);
      const payload = schema.parse(values);

      await authService.register({
        ...payload,
        fone: formatPhone(payload.fone),
      });

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso.', [
        {
          text: 'OK',
          onPress: () => router.replace('/(auth)/login'),
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível concluir o cadastro.';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  });

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.title}>Cadastro</Text>
            <Text style={styles.subtitle}>Preencha os dados para criar sua conta</Text>

            <Field label="Nome" error={errors.nome?.message}>
              <Controller
                control={control}
                name="nome"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Nome completo"
                    placeholderTextColor="#7a7a7a"
                    autoCapitalize="words"
                    onBlur={onBlur}
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </Field>

            <Field label="CNPJ" error={errors.cnpj?.message}>
              <Controller
                control={control}
                name="cnpj"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="00.000.000/0000-00"
                    placeholderTextColor="#7a7a7a"
                    keyboardType="number-pad"
                    onBlur={onBlur}
                    value={value}
                    onChangeText={(text) => onChange(formatCnpj(text))}
                  />
                )}
              />
            </Field>

            <Field label="Senha" error={errors.senha?.message}>
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
            </Field>

            <Field label="Telefone" error={errors.fone?.message}>
              <Controller
                control={control}
                name="fone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="(00) 00000-0000"
                    placeholderTextColor="#7a7a7a"
                    keyboardType="phone-pad"
                    onBlur={onBlur}
                    value={value}
                    onChangeText={(text) => onChange(formatPhone(text))}
                  />
                )}
              />
            </Field>

            <Field label="E-mail" error={errors.email?.message}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="user@example.com"
                    placeholderTextColor="#7a7a7a"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </Field>

            <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={onSubmit} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Text>
            </Pressable>

            <Pressable onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.link}>Voltar para login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}


const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: 24 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#111',
    padding: 24,
    gap: 16,
  },
  title: { fontSize: 30, fontWeight: '700', color: '#111' },
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
  link: { textAlign: 'center', color: '#111', fontWeight: '700' },
  error: { color: '#b00020', fontSize: 13 },
});
