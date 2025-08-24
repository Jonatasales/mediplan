'use client';

import { supabase } from './supabase';

/**
 * Função para confirmar o email do usuário automaticamente em ambiente de desenvolvimento
 * NÃO USE EM PRODUÇÃO!
 */
export async function confirmEmailForDev(email: string) {
  try {
    // Esta função só deve ser usada em ambiente de desenvolvimento
    if (process.env.NODE_ENV !== 'development') {
      console.warn('confirmEmailForDev só deve ser usada em ambiente de desenvolvimento');
      return false;
    }

    // Buscar usuário pelo email
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();
    
    if (getUserError) {
      console.error('Erro ao buscar usuário:', getUserError);
      return false;
    }

    const user = users?.find(u => u.email === email);
    
    if (!user) {
      console.error('Usuário não encontrado');
      return false;
    }

    // Atualizar usuário para confirmar email
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );

    if (updateError) {
      console.error('Erro ao confirmar email:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao confirmar email:', error);
    return false;
  }
}
