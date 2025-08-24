import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Redirecionar /dashboard para /(app)/dashboard
  if (request.nextUrl.pathname === '/dashboard') {
    return NextResponse.rewrite(new URL('/(app)/dashboard', request.url));
  }
  
  // Redirecionar /calendario para /(app)/calendario
  if (request.nextUrl.pathname === '/calendario') {
    return NextResponse.rewrite(new URL('/(app)/calendario', request.url));
  }
  
  // Redirecionar /historico para /(app)/historico
  if (request.nextUrl.pathname === '/historico') {
    return NextResponse.rewrite(new URL('/(app)/historico', request.url));
  }
  
  // Redirecionar /hospitais para /(app)/hospitais
  if (request.nextUrl.pathname === '/hospitais') {
    return NextResponse.rewrite(new URL('/(app)/hospitais', request.url));
  }
  
  // Redirecionar /plantoes para /(app)/plantoes
  if (request.nextUrl.pathname === '/plantoes') {
    return NextResponse.rewrite(new URL('/(app)/plantoes', request.url));
  }
  
  // Redirecionar /perfil para /(app)/perfil
  if (request.nextUrl.pathname === '/perfil') {
    return NextResponse.rewrite(new URL('/(app)/perfil', request.url));
  }
  
  // Redirecionar /hospitais/novo para /(app)/hospitais/novo
  if (request.nextUrl.pathname === '/hospitais/novo') {
    return NextResponse.rewrite(new URL('/(app)/hospitais/novo', request.url));
  }
  
  // Redirecionar /plantoes/novo para /(app)/plantoes/novo
  if (request.nextUrl.pathname === '/plantoes/novo') {
    return NextResponse.rewrite(new URL('/(app)/plantoes/novo', request.url));
  }

  return NextResponse.next();
}

// Configurar quais rotas devem usar o middleware
export const config = {
  matcher: [
    '/dashboard',
    '/calendario',
    '/historico',
    '/hospitais',
    '/hospitais/novo',
    '/plantoes',
    '/plantoes/novo',
    '/perfil',
  ],
};