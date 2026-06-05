import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

// Standalone output is for self-hosted/Docker (Namecheap) only — not Vercel.
// Vercel runs Next.js natively; enabling standalone there breaks tracing (symlinks on Windows,
// redundant output on Linux) and is unnecessary per Next.js deployment docs.
const isStandaloneBuild = process.env.BUILD_STANDALONE === '1'

const nextConfig: NextConfig = {
  // Payload SQLite / libsql native bindings must not be webpack-bundled on Vercel.
  serverExternalPackages: [
    '@payloadcms/db-sqlite',
    '@libsql/client',
    'libsql',
    'payload',
  ],
  outputFileTracingIncludes: {
    '/*': ['./node_modules/libsql/**/*', './node_modules/@libsql/**/*'],
  },
  ...(isStandaloneBuild
    ? {
        output: 'standalone' as const,
        // Next resolves styled-jsx/package.json at boot; pnpm + standalone tracing can omit it.
        outputFileTracingIncludes: {
          '/*': [
            './node_modules/styled-jsx/**/*',
            './node_modules/libsql/**/*',
            './node_modules/@libsql/**/*',
          ],
        },
      }
    : {}),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
    ],
    localPatterns: [
      { pathname: '/api/media/file/**' },
      { pathname: '/images/**' },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

// Wrap with Payload but allow frontend to work even if CMS is unavailable
export default withPayload(nextConfig, {
  devBundleServerPackages: false,
})
