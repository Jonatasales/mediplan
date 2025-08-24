'use client';

import { createClient } from '@supabase/supabase-js';

// Usar as mesmas variáveis definidas no arquivo supabase.ts
const supabaseUrl = 'https://eqbiczyksmfgskxqwskl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYmljenlrc21mZ3NreHF3c2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjI1NzQsImV4cCI6MjA3MTYzODU3NH0.hpUwdj2BvnDYyJOCL3PpQ1AlbY-8WUzJwvzCCAQOvNI';

// Cliente Supabase para autenticação direta (sem middleware)
export const authClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Função para login direto (ignorando verificação de email)
export async function loginDirect(email: string, password: string) {
  try {
    // Primeiro, tenta login normal
    const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({
      email,
      password
    });

    // Se login bem-sucedido, retorna os dados
    if (signInData.user && !signInError) {
      return { user: signInData.user, error: null };
    }

    // Se o erro for de email não confirmado, registra o usuário novamente
    if (signInError && signInError.message.includes('Email not confirmed')) {
      // Tenta registrar o usuário novamente (para desenvolvimento)
      const { data: signUpData, error: signUpError } = await authClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            email_confirmed: true
          }
        }
      });

      // Se registro falhar e não for porque o usuário já existe, retorna o erro
      if (signUpError && !signUpError.message.includes('already registered')) {
        return { user: null, error: signUpError };
      }

      // Tenta login novamente após registro
      const { data: secondSignInData, error: secondSignInError } = await authClient.auth.signInWithPassword({
        email,
        password
      });

      if (secondSignInError) {
        return { user: null, error: secondSignInError };
      }

      return { user: secondSignInData.user, error: null };
    }

    // Para qualquer outro erro, retorna o erro original
    return { user: null, error: signInError };
  } catch (error: any) {
    return { user: null, error };
  }
}

// Função para criar um usuário e perfil completo
export async function registerAndCreateProfile(
  email: string, 
  password: string, 
  userData: any
) {
  try {
    // Registrar usuário
    const { data: authData, error: signUpError } = await authClient.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (signUpError) {
      // Se o erro não for de usuário já existente, lançar o erro
      if (!signUpError.message.includes('already registered')) {
        return { user: null, error: signUpError };
      }
    }

    // Fazer login direto após registro
    const { user, error: loginError } = await loginDirect(email, password);
    
    if (loginError) {
      return { user: null, error: loginError };
    }

    // Se temos um usuário, criar o perfil na tabela profissionais_saude
    if (user) {
      const { error: profileError } = await authClient.from('profissionais_saude').upsert({
        id: user.id,
        nome: userData.nome,
        cpf: userData.cpf,
        conselho_classe: userData.conselho_classe || null,
        numero_registro: userData.numero_registro || null,
        especialidade: userData.especialidade || null,
        telefone: userData.telefone || null,
        email: email,
        ativo: true
      });

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        // Continuar mesmo com erro no perfil, pois o usuário já está autenticado
      }
    }

    return { user, error: null };
  } catch (error: any) {
    return { user: null, error };
  }
}
