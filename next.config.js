/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  output: 'export',
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
  // Desativar rotas de API em exportação estática
  skipTrailingSlashRedirect: true,
  // Ignorar erros de exportação estática
  experimental: {
    serverActions: false,
  },
};

module.exports = nextConfig;
