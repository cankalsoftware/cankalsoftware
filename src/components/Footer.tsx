import Link from "next/link";
import { Mail, MapPin, Globe2, ExternalLink } from "lucide-react";

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export function Footer() {
  return (
    <footer className="mt-20 py-12 border-t border-[var(--border)] relative z-10 bg-black/5 backdrop-blur-sm dark:bg-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & UK Reg */}
          <div className="md:col-span-2 space-y-3 text-center md:text-left">
            <h3 className="font-bold text-lg">Cankal Software and IT Consultancy Ltd.</h3>
            <p className="text-sm opacity-75 max-w-md">
              Specialized in AI Transformation, Computer Vision systems (Firevision), enterprise SaaS architecture, and high-performance web development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2 text-sm opacity-80 justify-center md:justify-start">
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#2563eb] dark:text-[#00f0ff]" /> info@cankalsoftware.com
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#2563eb] dark:text-[#00f0ff]" /> United Kingdom
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="text-center md:text-left space-y-2">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-[#2563eb] dark:text-[#00f0ff]">
              Navigation
            </h4>
            <ul className="space-y-1.5 text-sm opacity-80">
              <li>
                <Link href="/" className="hover:text-[#00f0ff] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#00f0ff] transition-colors">
                  About Us & Leadership
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#00f0ff] transition-colors">
                  Contact & Inquiries
                </Link>
              </li>
              <li>
                <Link href="/aeo-scanner" className="hover:text-[#00f0ff] transition-colors flex items-center gap-1.5 justify-center md:justify-start text-[#2563eb] dark:text-[#00f0ff] font-medium">
                  AEO &amp; LLM Scanner <span className="text-[10px] px-1 py-0.2 bg-blue-500/10 dark:bg-purple-500/20 rounded font-bold">NEW</span>
                </Link>
              </li>
              <li>
                <Link href="/#portfolio" className="hover:text-[#00f0ff] transition-colors">
                  SaaS Portfolio
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-[#00f0ff] transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Leadership & Authority */}
          <div className="text-center md:text-left space-y-2">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-[#2563eb] dark:text-[#00f0ff]">
              Leadership
            </h4>
            <ul className="space-y-1.5 text-sm opacity-80">
              <li>
                <a
                  href="https://alicankal.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#00f0ff] transition-colors inline-flex items-center gap-1.5"
                >
                  <Globe2 className="w-3.5 h-3.5" /> Ali Cankal (Founder) <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://firevision.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#00f0ff] transition-colors inline-flex items-center gap-1.5"
                >
                  Firevision.uk <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <Link
                  href="https://linkedin.com/company/cankalsoftware"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#00f0ff] transition-colors inline-flex items-center gap-1.5"
                >
                  <LinkedinIcon className="w-3.5 h-3.5" /> Company LinkedIn
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-60 text-center md:text-left">
          <p>&copy; {new Date().getFullYear()} Cankal Software and IT Consultancy Ltd. All rights reserved.</p>
          <p>UK Registered Company</p>
        </div>
      </div>
    </footer>
  );
}
