import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'adonplay-backend',
                port: '9000', // or the port if your server is running on a specific port
                pathname: '/uploads/**',
            },
            {
                protocol: 'http',
                hostname: '10.0.2.2',
                port: '9000', // or the port if your server is running on a specific port
                pathname: '/uploads/**',
            },
            {
                protocol: 'http',
                hostname: 'api-adonplay.local', // or the port if your server is running on a specific port
                pathname: '/uploads/**',
            },
            // Firebase Storage domains
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
                pathname: '/v0/b/**',
            },
            {
                protocol: 'https',
                hostname: 'storage.googleapis.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'adonplay-web.firebasestorage.app',
                pathname: '/**',
            },
        ],

    },
    allowedDevOrigins: [
        '10.0.2.2',
        'player-adonplay.local',
        'api-adonplay.local',
        'frontend-adonplay.local',
        'localhost'
    ],

    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
                    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
                ],
            },
        ];
    },
    /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

};

export default nextConfig;
