import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AEO & LLM Search Readiness Scanner | AI Optimization Tool",
  description:
    "Test your website compatibility with AI search engines like ChatGPT, Claude, and Perplexity. Audit semantic schema markup, llms.txt, entity tags, and heading hierarchies with 100% privacy.",
  keywords: [
    "AEO Scanner",
    "GEO Optimization",
    "Answer Engine Optimization",
    "Generative Engine Optimization",
    "LLM Search Readiness",
    "llms.txt checker",
    "JSON-LD Schema validator",
    "ChatGPT bot indexing",
    "Perplexity SEO",
    "ClaudeBot crawlability",
    "AI Search Audit",
    "Cankal Software",
  ],
  alternates: {
    canonical: "https://cankalsoftware.com/aeo-scanner",
  },
  openGraph: {
    title: "Free AEO & LLM Search Readiness Scanner | Cankal Software",
    description:
      "Is your website ready for ChatGPT, Claude, and Perplexity? Audit your AEO, GEO schemas, llms.txt, and AI crawlability instantly with zero data retained.",
    url: "https://cankalsoftware.com/aeo-scanner",
    type: "website",
    images: [
      {
        url: "/cankalsoftware-neon-logo.png",
        width: 1200,
        height: 630,
        alt: "AEO & LLM Search Readiness Scanner - Cankal Software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AEO & LLM Search Readiness Scanner | Cankal Software",
    description:
      "Audit your website for AI search engines like ChatGPT, Claude, and Perplexity. 100% privacy-first scanner.",
    images: ["/cankalsoftware-neon-logo.png"],
  },
};

const scannerJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://cankalsoftware.com/aeo-scanner#tool",
      name: "AEO & LLM Search Readiness Scanner",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description:
        "Free tool to analyze website compatibility with AI answer engines (AEO), generative search engines (GEO), and LLMs like ChatGPT, Claude, and Perplexity.",
      publisher: {
        "@type": "Organization",
        name: "Cankal Software and IT Consultancy Ltd.",
        url: "https://cankalsoftware.com",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://cankalsoftware.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "AEO & LLM Scanner",
          item: "https://cankalsoftware.com/aeo-scanner",
        },
      ],
    },
  ],
};

export default function AeoScannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(scannerJsonLd) }}
      />
      {children}
    </>
  );
}
