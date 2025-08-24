import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuração para exportação estática
export const dynamic = 'force-static';
export const revalidate = false;

// Supabase URL e chave anônima
const supabaseUrl = 'https://eqbiczyksmfgskxqwskl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYmljenlrc21mZ3NreHF3c2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjI1NzQsImV4cCI6MjA3MTYzODU3NH0.hpUwdj2BvnDYyJOCL3PpQ1AlbY-8WUzJwvzCCAQOvNI';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // Para build estático, apenas redirecionamos para o dashboard
  // A lógica real de autenticação será tratada no lado do cliente
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
