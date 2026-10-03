import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | Cankal Software and IT Consultancy Ltd.",
  description:
    "Learn about how Cankal Software uses cookies, analytics pixels, and tracking technologies under UK PECR and GDPR regulations.",
  alternates: {
    canonical: "https://cankalsoftware.com/cookie-policy",
  },
};

export default function CookiePolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
