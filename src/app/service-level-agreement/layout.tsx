import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service Level Agreement (SLA) | Cankal Software and IT Consultancy Ltd.",
  description:
    "Review Cankal Software enterprise service level commitments, uptime guarantees, incident response tiers, and disaster recovery standards.",
  alternates: {
    canonical: "https://cankalsoftware.com/service-level-agreement",
  },
};

export default function ServiceLevelAgreementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
