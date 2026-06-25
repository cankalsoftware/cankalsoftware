import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h3 className="font-bold text-lg mb-2">Cankal Software and IT Consultancy Ltd.</h3>
          <p className="text-sm opacity-70 flex items-center justify-center md:justify-start gap-2">
            <Mail className="h-4 w-4 text-[#2563eb] dark:text-[#00f0ff]" /> info@cankalsoftware.com
          </p>
          <p className="text-sm opacity-70 mt-2 flex items-center justify-center md:justify-start gap-2">
            <MapPin className="h-4 w-4 text-[#2563eb] dark:text-[#00f0ff]" /> United Kingdom
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="https://linkedin.com/company/cankalsoftware" target="_blank" className="p-3 glass-hover rounded-full">
            <LinkedinIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
      <div className="text-center text-xs opacity-50 mt-8">
        &copy; {new Date().getFullYear()} Cankal Software and IT Consultancy Ltd. All rights reserved.
      </div>
    </footer>
  );
}
