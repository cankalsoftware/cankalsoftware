import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Cankal Software and IT Consultancy Ltd.",
  description:
    "Review the terms governing the use of Cankal Software consultancy, custom software development, AI solutions, and free online scanner tools.",
  alternates: {
    canonical: "https://cankalsoftware.com/terms-of-service",
  },
};

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
