import type { NextConfig } from 'next';
const config: NextConfig = {
  transpilePackages: ['@suraksha/shared', '@suraksha/types'],
  reactStrictMode: true,
};
export default config;
