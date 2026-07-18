/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Performance: gzip/brotli-compress served assets.
  compress: true,
  // Security: don't advertise the framework in response headers.
  poweredByHeader: false,
};

module.exports = nextConfig;
