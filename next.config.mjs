import { withSentryConfig } from "@sentry/nextjs";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https://api.stripe.com https://lichess.org https://*.lichess.org; " +
      "frame-src https://js.stripe.com https://lichess.org https://*.lichess.org; " +
      "worker-src 'self' blob:; " +
      "object-src 'none'; " +
      "base-uri 'self';",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: "/play/:path*",
        headers: securityHeaders,
      },
      {
        source: "/demo/:path*",
        headers: securityHeaders,
      },
      {
        source: "/play/mastery/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  hideSourceMaps: true,
});
