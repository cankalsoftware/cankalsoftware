import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about Cankal Software and IT Consultancy Ltd. We architect the future using advanced Artificial Intelligence and cutting-edge web technologies.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
