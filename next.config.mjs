const nextConfig = {
  reactStrictMode: true,
  
  // Add API proxy to redirect requests to your backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*',
      },
    ];
  },
  
  // Update Content-Security-Policy to fix all connection issues
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.sumsub.com https://*.walletconnect.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.sumsub.com https://*.walletconnect.com https://explorer-api.walletconnect.com https://*.pinata.cloud https://gateway.pinata.cloud https://cdn-icons-png.flaticon.com https://img-cdn.magiceden.dev https://metadata.degods.com https://i.seadn.io; connect-src 'self' http://localhost:5001 https://*.sumsub.com https://*.walletconnect.com https://*.merkle.io https://*.alchemy.com https://*.blastapi.io https://*.tenderly.co https://*.sepolia.org https://api.sumsub.com https://api.pinata.cloud https://*.pinata.cloud wss://*.bridge.walletconnect.org https://*.infura.io https://*.binance.org https://*.infura.io; frame-src 'self' https://*.sumsub.com https://in.sumsub.com;"
          }
        ]
      }
    ];
  },
  
  // Add image configuration for Next.js Image component
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
      },
      {
        protocol: 'https',
        hostname: 'img-cdn.magiceden.dev',
      },
      {
        protocol: 'https',
        hostname: 'metadata.degods.com',
      },
      {
        protocol: 'https',
        hostname: 'i.seadn.io',
      }
    ],
  },
};

export default nextConfig;