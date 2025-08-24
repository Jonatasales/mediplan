import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Usar as mesmas variáveis definidas no arquivo supabase.ts
const supabaseUrl = 'https://eqbiczyksmfgskxqwskl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYmljenlrc21mZ3NreHF3c2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjI1NzQsImV4cCI6MjA3MTYzODU3NH0.hpUwdj2BvnDYyJOCL3PpQ1AlbY-8WUzJwvzCCAQOvNI';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  
  // Criar cliente Supabase diretamente
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    }
  });
  
  // Obter token de autenticação do cookie
  const authCookie = request.cookies.get('sb-auth-token')?.value;
  
  let session = null;
  if (authCookie) {
    try {
      const { data, error } = await supabase.auth.getUser(authCookie);
      if (!error && data.user) {
        session = { user: data.user };
      }
    } catch (e) {
      console.error('Erro ao verificar autenticação:', e);
    }
  }

  // Se o usuário não está autenticado e está tentando acessar uma rota protegida
  // Excluir rotas públicas e recursos estáticos
  const isPublicPath = 
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname === '/';

  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Se o usuário está autenticado e está tentando acessar páginas de autenticação
  if (session && request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return res;
}

// Rotas que serão verificadas pelo middleware
export const config = {
  // Desativando temporariamente o middleware para simplificar o processo de autenticação
  matcher: [],
  // Para reativar, use:
  // matcher: ['/((?!api|_next/static|_next/image|favicon.ico|auth/callback).*)'],
};
