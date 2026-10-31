import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us & Leadership | Ali Cankal",
  description:
    "Learn about Cankal Software and IT Consultancy Ltd., founded by Ali Cankal. Discover our mission to build world-class AI systems, SaaS platforms, and enterprise web applications.",
  alternates: {
    canonical: "https://cankalsoftware.com/about",
  },
  openGraph: {
    title: "About Cankal Software & Leadership | Ali Cankal",
    description:
      "Learn about Cankal Software and IT Consultancy Ltd., founded by Ali Cankal. AI Systems, SaaS platforms, and enterprise web applications.",
    url: "https://cankalsoftware.com/about",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Cankal Software & Leadership | Ali Cankal",
    description:
      "Learn about Cankal Software and IT Consultancy Ltd., founded by Ali Cankal. AI Systems, SaaS platforms, and enterprise web applications.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
