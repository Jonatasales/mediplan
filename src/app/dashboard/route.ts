import { NextResponse } from 'next/server';

// Configuração para exportação estática
export const dynamic = 'error';
export const dynamicParams = false;

export function GET() {
  // Redirecionamento estático para o dashboard na nova estrutura
  return NextResponse.redirect(new URL('/dashboard', 'https://appmedplan.netlify.app'));
}
