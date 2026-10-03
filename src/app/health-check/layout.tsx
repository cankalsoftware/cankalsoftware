import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Website Health & Link Structure Audit | Cankal Software",
  description:
    "Free website health and link structure inspector. Audit H1-H3 heading hierarchy, image alt text, contact form endpoints, reCAPTCHA bot defense, cookie consent banners, dead links, and HTTP standards.",
  alternates: {
    canonical: "https://cankalsoftware.com/health-check",
  },
  openGraph: {
    title: "Website Health & Link Structure Audit | Cankal Software",
    description:
      "Inspect HTML5 DOM semantics, broken links, image accessibility, contact forms, cookie consent, and HTTP standards with instant remediation blueprints.",
    url: "https://cankalsoftware.com/health-check",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Website Health & HTML5 Protocol Inspector | Cankal Software",
    description:
      "Free instant passive website health audit. Evaluate headings, images, forms, dead links, and HTTP performance.",
  },
};

export default function HealthCheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
