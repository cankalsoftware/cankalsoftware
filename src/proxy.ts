import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Generate a cryptographically secure random UUID nonce for this request
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  // Approach 2: Nonce-Based CSP (Gold Standard for SOC 2 & A+ Scanner Rating)
  // Uses dynamic cryptographic nonce and strict-dynamic.
  // Zero 'unsafe-inline' and zero 'unsafe-eval' in production.
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' data: https://fonts.gstatic.com;
    img-src 'self' blob: data: https: https://www.facebook.com https://*.google-analytics.com https://*.googletagmanager.com;
    connect-src 'self' https://www.google.com https://www.gstatic.com https://recaptcha.net https://connect.facebook.net https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com;
    frame-src 'self' https://www.google.com https://recaptcha.net;
    frame-ancestors 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
    report-to csp-endpoint;
    report-uri /api/security-report;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  // Set CSP and x-nonce on internal request headers so Next.js SSR can extract and stamp the nonce on runtime scripts
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  // Initialize response with updated request headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set CSP on outgoing response headers for browsers & security scanners
  response.headers.set("Content-Security-Policy", cspHeader);

  // 1. Enforce HTTPS & HSTS Preload
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // 2. Clickjacking Defense
  response.headers.set("X-Frame-Options", "SAMEORIGIN");

  // 3. Prevent MIME-type Confusion
  response.headers.set("X-Content-Type-Options", "nosniff");

  // 4. Privacy-Preserving Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // 5. Restrict Risky Browser Features & Hardware APIs
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );

  // 6. Cross-Origin Protections
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  // 7. Security Telemetry & Automated Violation Reporting (OWASP A09:2026)
  response.headers.set(
    "Reporting-Endpoints",
    'csp-endpoint="/api/security-report"'
  );
  response.headers.set(
    "Report-To",
    '{"group":"csp-endpoint","max_age":10886400,"endpoints":[{"url":"/api/security-report"}]}'
  );

  // 8. Restrict Cross-Origin Resource Sharing (CORS) - Prevent wildcard '*' (OWASP A01:2026)
  const origin = request.headers.get("origin") || "";
  const allowedOrigins = [
    "https://cankalsoftware.co.uk",
    "https://cankalsoftware.com",
    "https://www.cankalsoftware.co.uk",
    "https://www.cankalsoftware.com",
  ];

  if (allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  } else if (!origin) {
    response.headers.set("Access-Control-Allow-Origin", "https://cankalsoftware.co.uk");
  }

  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files, _next/static, _next/image, favicon.ico
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
