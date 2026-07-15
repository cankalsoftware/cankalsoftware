import { Metadata } from "next";
import RecaptchaProvider from "./RecaptchaProvider";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Cankal Software and IT Consultancy Ltd. for premium SaaS and AI-driven Web Development Solutions.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <RecaptchaProvider>{children}</RecaptchaProvider>;
}
