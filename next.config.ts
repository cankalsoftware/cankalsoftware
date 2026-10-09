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
  // 7. Security Telemetry & Automated Violation Reporting (OWASP A09:2026)
  {
    key: "Reporting-Endpoints",
    value: 'csp-endpoint="/api/security-report"',
  },
  {
    key: "Report-To",
    value: '{"group":"csp-endpoint","max_age":10886400,"endpoints":[{"url":"/api/security-report"}]}',
  },
  // 8. Note: Dynamic Content-Security-Policy (CSP) with cryptographic nonces is generated per-request in src/proxy.ts
  // 9. Restrict Cross-Origin Resource Sharing (CORS) to trusted origin (OWASP A01:2026)
  {
    key: "Access-Control-Allow-Origin",
    value: "https://cankalsoftware.co.uk",
  },
];

const apiSecurityHeaders = [
  // Explicit CORS without wildcard (OWASP A01:2026 Broken Access Control prevention)
  {
    key: "Access-Control-Allow-Origin",
    value: "https://cankalsoftware.co.uk",
  },
  {
    key: "Access-Control-Allow-Methods",
    value: "GET, POST, OPTIONS",
  },
  {
    key: "Access-Control-Allow-Headers",
    value: "Content-Type, Authorization, X-Requested-With",
  },
  {
    key: "Access-Control-Allow-Credentials",
    value: "true",
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
      {
        source: "/api/:path*",
        headers: apiSecurityHeaders,
      },
    ];
  },
};

export default nextConfig;
