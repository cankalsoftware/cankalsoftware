import type { NextConfig } from "next";

const securityHeaders = [
  // 1. Enforce HTTPS & HSTS Preload
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  // 2. Clickjacking Defense
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  // 3. Prevent MIME-type Confusion / Sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // 4. Privacy-preserving Referrer Policy
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // 5. Restrict Risky Browser Features & Hardware APIs
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // 6. Cross-Origin Protections
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin-allow-popups",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
  // 7. Robust Content Security Policy (CSP) supporting Google Analytics, Meta Pixel, and ReCaptcha
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://recaptcha.net https://connect.facebook.net https://www.googletagmanager.com https://*.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' blob: data: https: https://www.facebook.com https://*.google-analytics.com https://*.googletagmanager.com",
      "connect-src 'self' https://www.google.com https://www.gstatic.com https://recaptcha.net https://connect.facebook.net https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
      "frame-src 'self' https://www.google.com https://recaptcha.net",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Hide X-Powered-By: Next.js banner (CWE-200 prevention)
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
