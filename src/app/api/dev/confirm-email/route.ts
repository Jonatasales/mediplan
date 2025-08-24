import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Configuração para exportação estática
export const dynamic = 'force-static';
export const revalidate = false;

// ATENÇÃO: Esta rota é apenas para ambiente de desenvolvimento!
// Em produção, este endpoint não deve existir.

// Usar as mesmas variáveis definidas no arquivo supabase.ts
const supabaseUrl = 'https://eqbiczyksmfgskxqwskl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYmljenlrc21mZ3NreHF3c2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjI1NzQsImV4cCI6MjA3MTYzODU3NH0.hpUwdj2BvnDYyJOCL3PpQ1AlbY-8WUzJwvzCCAQOvNI';

export async function POST(request: NextRequest) {
  // Verificar se estamos em ambiente de desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Este endpoint só está disponível em ambiente de desenvolvimento' },
      { status: 403 }
    );
  }

  try {
    const requestData = await request.json();
    const { email } = requestData;

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Criar cliente Supabase diretamente
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Em um ambiente de desenvolvimento, vamos simular a confirmação de email
    // Enviando um link mágico para o usuário e depois tentando fazer login diretamente
    const { error: magicLinkError } = await supabase.auth.signInWithOtp({
      email: email,
    });
    
    if (magicLinkError) {
      return NextResponse.json(
        { error: 'Erro ao enviar link mágico', details: magicLinkError.message },
        { status: 500 }
      );
    }
    
    // Em um ambiente real, o usuário clicaria no link enviado por email
    // Aqui estamos apenas simulando que o email foi confirmado

    return NextResponse.json({ success: true, message: 'Email confirmado com sucesso' });
  } catch (error: any) {
    console.error('Erro ao confirmar email:', error);
    return NextResponse.json(
      { error: 'Erro ao confirmar email', details: error.message },
      { status: 500 }
    );
  }
}
