/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['eqbiczyksmfgskxqwskl.supabase.co'],
    unoptimized: true,
  },
  output: 'export',
  distDir: '.next',
  // Desativar o ESLint durante a compilação para evitar problemas no Netlify
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Desativar a verificação de tipos do TypeScript durante a compilação
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuração específica para o Netlify
  trailingSlash: true,
  // Configuração para rotas de API
  experimental: {
    serverActions: false,
  },
};

module.exports = nextConfig;
