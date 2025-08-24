import { NextResponse } from 'next/server';

// Configuração para exportação estática
export const dynamic = 'error';
export const dynamicParams = false;

// ATENÇÃO: Esta rota é apenas para ambiente de desenvolvimento!
// Em produção, este endpoint não deve existir.

// Usar as mesmas variáveis definidas no arquivo supabase.ts
const supabaseUrl = 'https://eqbiczyksmfgskxqwskl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYmljenlrc21mZ3NreHF3c2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjI1NzQsImV4cCI6MjA3MTYzODU3NH0.hpUwdj2BvnDYyJOCL3PpQ1AlbY-8WUzJwvzCCAQOvNI';

export function POST() {
  // Resposta estática para ambiente de produção
  return NextResponse.json(
    { error: 'Este endpoint só está disponível em ambiente de desenvolvimento' },
    { status: 403 }
  );
}
