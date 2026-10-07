import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Website Health, Cookie Consent & GDPR Legal Audit | Cankal Software",
  description:
    "Free website health and legal compliance inspector. Audit H1-H3 heading hierarchy, image alt text, contact form endpoints, Cookie Consent settings (Reject All & Google Consent Mode v2), mandatory legal pages (Privacy, Cookies, Terms), dead links, and HTTP standards.",
  alternates: {
    canonical: "https://cankalsoftware.com/health-check",
  },
  openGraph: {
    title: "Website Health, Cookie Consent & GDPR Legal Audit | Cankal Software",
    description:
      "Inspect HTML5 DOM semantics, broken links, image accessibility, contact forms, Cookie Consent settings, legal pages, and HTTP standards with instant remediation blueprints.",
    url: "https://cankalsoftware.com/health-check",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Website Health, Cookie Consent & GDPR Inspector | Cankal Software",
    description:
      "Free instant passive website health and GDPR audit. Evaluate headings, images, forms, cookie consent, legal pages, dead links, and HTTP performance.",
  },
};

export default function HealthCheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
