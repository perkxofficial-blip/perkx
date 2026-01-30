import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// Parse API URL for image configuration
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const parsedUrl = new URL(apiUrl);
const appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const parsedAppUrl = new URL(appUrl);
const cdnUrl = process.env.PUBLIC_STATIC_CDN || 'http://localhost:8088';
const parsedCdnUrl = new URL(cdnUrl);

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: parsedUrl.protocol.replace(':', '') as 'http' | 'https',
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        pathname: '/uploads/**',
      },
      {
        protocol: parsedAppUrl.protocol.replace(':', '') as 'http' | 'https',
        hostname: parsedAppUrl.hostname,
        port: parsedAppUrl.port,
        pathname: '/uploads/**',
      },
      {
        protocol: parsedCdnUrl.protocol.replace(':', '') as 'http' | 'https',
        hostname: parsedCdnUrl.hostname,
        port: parsedCdnUrl.port,
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default withNextIntl(nextConfig);
