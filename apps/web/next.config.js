/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@tcg/ui', '@tcg/types', '@tcg/shaders'],
  reactStrictMode: true
};

module.exports = nextConfig;
