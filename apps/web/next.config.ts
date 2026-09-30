import type { NextConfig } from 'next';
const config: NextConfig = {
  allowedDevOrigins: ['192.168.8.198'],
  transpilePackages: ['@suraksha/shared', '@suraksha/types'],
  reactStrictMode: true,
};
export default config;
