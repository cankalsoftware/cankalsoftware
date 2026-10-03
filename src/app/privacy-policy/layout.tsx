import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Cankal Software and IT Consultancy Ltd.",
  description:
    "Read our UK GDPR and Data Protection Act 2018 compliant Privacy Policy. Learn how Cankal Software collects, protects, and handles personal data and scanner tool inputs.",
  alternates: {
    canonical: "https://cankalsoftware.com/privacy-policy",
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
