import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  typedRoutes: false,
  env: {
    NEXT_PUBLIC_CENTRAL_API_HTTP:
      process.env.NEXT_PUBLIC_CENTRAL_API_HTTP ?? 'http://localhost:4000/graphql',
    NEXT_PUBLIC_CENTRAL_API_WS:
      process.env.NEXT_PUBLIC_CENTRAL_API_WS ?? 'ws://localhost:4000/graphql',
  },
  allowedDevOrigins: [
    'http://localhost:3001',
    'http://127.0.0.1:3001',
  ],
};

export default nextConfig;
