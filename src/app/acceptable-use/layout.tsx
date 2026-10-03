import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceptable Use Policy | Cankal Software and IT Consultancy Ltd.",
  description:
    "Review acceptable use standards and ethical scanning rules governing Cankal Software APIs, web platforms, and free developer tools.",
  alternates: {
    canonical: "https://cankalsoftware.com/acceptable-use",
  },
};

export default function AcceptableUseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
