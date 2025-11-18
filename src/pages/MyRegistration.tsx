"use client";

import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/lib/supabaseClient';

// Esquema de validação com Zod
const profileFormSchema = z.object({
  firstName: z.string().min(1, { message: "Primeiro nome é obrigatório." }),
  lastName: z.string().min(1, { message: "Sobrenome é obrigatório." }),
  // O email é apenas para exibição, não será editável diretamente por aqui para evitar complexidade de confirmação de email.
  email: z.string().email({ message: "Email inválido." }).optional(), 
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const MyRegistration = () => {
  const { user, loading: authLoading } = useAuth();
  const userMetadata = user?.user_metadata;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: userMetadata?.first_name || '',
      lastName: userMetadata?.last_name || '',
      email: user?.email || '',
    },
    mode: "onChange",
  });

  // Atualiza os valores padrão do formulário quando o usuário ou metadata mudam
  useEffect(() => {
    if (user && userMetadata) {
      form.reset({
        firstName: userMetadata.first_name || '',
        lastName: userMetadata.last_name || '',
        email: user.email || '',
      });
    }
  }, [user, userMetadata, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      showError("Usuário não autenticado.");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
        },
      });

      if (error) {
        showError(`Erro ao atualizar perfil: ${error.message}`);
      } else {
        showSuccess("Perfil atualizado com sucesso!");
      }
    } catch (error) {
      console.error("Erro inesperado ao atualizar perfil:", error);
      showError("Ocorreu um erro inesperado ao atualizar o perfil.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meu Cadastro</CardTitle>
        <CardDescription>
          Visualize e edite suas informações de perfil.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Primeiro Nome</Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
                disabled={authLoading || form.formState.isSubmitting}
              />
              {form.formState.errors.firstName && (
                <p className="text-red-500 text-sm">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input
                id="lastName"
                {...form.register("lastName")}
                disabled={authLoading || form.formState.isSubmitting}
              />
              {form.formState.errors.lastName && (
                <p className="text-red-500 text-sm">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              defaultValue={user?.email || ''}
              readOnly // Email não é editável diretamente por aqui para simplificar
              className="bg-gray-100 cursor-not-allowed"
            />
            <p className="text-sm text-muted-foreground">
              Para alterar seu e-mail, entre em contato com o suporte.
            </p>
          </div>
          <Button
            type="submit"
            disabled={authLoading || form.formState.isSubmitting || !form.formState.isDirty}
          >
            {form.formState.isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MyRegistration;