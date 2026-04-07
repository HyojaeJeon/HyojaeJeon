import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';
const isServerBuild = process.env.NEXT_BUILD_MODE === 'server';

const nextConfig: NextConfig = {
  ...(!isDev && !isServerBuild ? { output: 'export' } : {}),
  basePath: '',
  trailingSlash: true,
  images: { unoptimized: true },
  reactCompiler: true,
  allowedDevOrigins: [
    'http://192.168.1.64:3001',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
  ],
};

export default nextConfig;
