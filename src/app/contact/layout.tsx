import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Cankal Software and IT Consultancy Ltd.",
  description:
    "Get in touch with Cankal Software and IT Consultancy Ltd. for custom AI systems, SaaS engineering, cyber security hardening, and web development solutions.",
  alternates: {
    canonical: "https://cankalsoftware.com/contact",
  },
  openGraph: {
    title: "Contact Cankal Software | AI & Web Development",
    description:
      "Get in touch with Cankal Software and IT Consultancy Ltd. for custom AI systems, SaaS engineering, cyber security hardening, and web development solutions.",
    url: "https://cankalsoftware.com/contact",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Cankal Software | AI & Web Development",
    description:
      "Get in touch with Cankal Software and IT Consultancy Ltd. for custom AI systems, SaaS engineering, cyber security hardening, and web development solutions.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
