/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['eqbiczyksmfgskxqwskl.supabase.co'],
    unoptimized: true,
  },
  output: 'standalone',
};

module.exports = nextConfig;
