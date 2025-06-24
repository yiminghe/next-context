const withBundleAnalyzer =
  process.env.ANALYZE === 'true'
    ? require('@next/bundle-analyzer')({
        enabled: true,
      })
    : (a) => a;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  pageExtensions: ['ts', 'tsx', 'js'],
  experimental: {
    swcPlugins: process.env.NEXT_PUBLIC_CYPRESS
      ? [[require.resolve('swc-plugin-coverage-instrument'), {}]]
      : [],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
