import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us & Leadership | Ali Cankal",
  description:
    "Learn about Cankal Software and IT Consultancy Ltd., founded by Ali Cankal. Discover our mission to build world-class AI systems, SaaS platforms, and enterprise web applications.",
  openGraph: {
    title: "About Cankal Software & Leadership | Ali Cankal",
    description:
      "Learn about Cankal Software and IT Consultancy Ltd., founded by Ali Cankal. AI Systems, SaaS platforms, and enterprise web applications.",
    url: "https://cankalsoftware.com/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
