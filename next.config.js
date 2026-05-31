/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Descomente se precisar de export estático (sem serverless functions)
  // output: 'export',
};

module.exports = nextConfig;
