import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OWASP Top 10 Vulnerability Check (2026 Standard) | Cankal Software",
  description:
    "Free passive website security audit against the 2026 OWASP Top 10 web application security risks. Audit Broken Access Control, Injection, Cryptographic Failures, and receive copy-paste remediation blueprints.",
  alternates: {
    canonical: "https://cankalsoftware.com/owasp-check",
  },
  openGraph: {
    title: "OWASP Top 10 Vulnerability Check | Cankal Software",
    description:
      "Audit your web applications against the 2026 OWASP Top 10. Instant pass/fail checklist, CVSS severity scoring, and Nginx/Apache/Next.js code fixes.",
    url: "https://cankalsoftware.com/owasp-check",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "2026 OWASP Top 10 Vulnerability Scanner | Cankal Software",
    description:
      "Free instant passive security scan based on the 2026 OWASP Top 10 web application benchmarks.",
  },
};

export default function OwaspCheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
