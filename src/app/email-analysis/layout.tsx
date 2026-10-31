import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Phishing Analysis & Header Forensics Tool | Cankal Software",
  description:
    "Free email threat investigator. Strip Outlook .msg and .eml files, inspect raw transport headers, detect sender spoofing with Red/Green indicators, and safely sandbox suspicious links.",
  keywords: [
    "email analysis tool",
    "phishing detector",
    "parse msg file",
    "inspect email headers",
    "spf dkim dmarc checker",
    "safe link sandbox",
    "cyber security email forensics",
    "cankal software",
  ],
  alternates: {
    canonical: "https://cankalsoftware.com/email-analysis",
  },
  openGraph: {
    title: "Email Phishing Analysis & Threat Forensics | Cankal Software",
    description:
      "Strip .msg and .eml email files, analyze raw transport headers, detect spoofed senders, and sandbox suspicious links safely.",
    url: "https://cankalsoftware.com/email-analysis",
    siteName: "Cankal Software",
    type: "website",
    locale: "en_GB",
    images: [
      {
        url: "/cankalsoftware-neon-logo.png",
        width: 1200,
        height: 630,
        alt: "Email Phishing Analysis Tool - Cankal Software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Email Phishing Analysis & Threat Forensics | Cankal Software",
    description:
      "Free email forensics and phishing analysis tool that decodes Outlook .msg and MIME .eml files.",
    images: ["/cankalsoftware-neon-logo.png"],
  },
};

export default function EmailAnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

