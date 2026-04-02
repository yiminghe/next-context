const withBundleAnalyzer =
  process.env.ANALYZE === 'true'
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@next/bundle-analyzer')({
        enabled: true,
      })
    : (a) => a;

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages:
    process.env.NODE_ENV === 'test'
      ? [
          'intl-messageformat',
          '@formatjs/intl-localematcher',
          '@formatjs/ecma402-abstract',
          '@formatjs/fast-memoize',
          '@formatjs/bigdecimal',
          '@formatjs/icu-skeleton-parser',
          '@formatjs/icu-messageformat-parser',
        ]
      : [],
  reactStrictMode: false,
  pageExtensions: ['ts', 'tsx', 'js'],
  experimental: {
    swcPlugins:
      process.env.NEXT_PUBLIC_CYPRESS && false
        ? [[require.resolve('swc-plugin-coverage-instrument'), {}]]
        : [],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
