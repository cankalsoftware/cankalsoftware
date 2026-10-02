import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/60 dark:border-white/10 bg-[#f8fafc]/80 dark:bg-[#030014]/80 backdrop-blur-md transition-all shadow-sm">
      <nav className="mx-auto max-w-7xl flex items-center justify-between py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-tighter">
            <Image src="/brain-icon.png" alt="Cankal Software Brain Icon" width={32} height={32} className="rounded-md object-contain" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-[#2563eb] dark:from-[#b52bff] dark:to-[#00f0ff]">CankalSoftware</span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-7 text-base font-semibold">
          <Link href="/" className="bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] to-[#1e3a8a] dark:from-[#b52bff] dark:to-[#00f0ff] opacity-80 hover:opacity-100 transition-all duration-300">Home</Link>
          <Link href="/#ai-transformation" className="bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] to-[#1e3a8a] dark:from-[#b52bff] dark:to-[#00f0ff] opacity-80 hover:opacity-100 transition-all duration-300">AI Transformation</Link>
          <Link href="/aeo-scanner" className="bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] to-[#1e3a8a] dark:from-[#b52bff] dark:to-[#00f0ff] opacity-80 hover:opacity-100 transition-all duration-300 flex items-center gap-1.5">
            <span>AEO Scanner</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/10 dark:bg-purple-500/20 text-[#2563eb] dark:text-[#00f0ff] border border-blue-500/20 dark:border-[#b52bff]/30">AI</span>
          </Link>
          <Link href="/about" className="bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] to-[#1e3a8a] dark:from-[#b52bff] dark:to-[#00f0ff] opacity-80 hover:opacity-100 transition-all duration-300">About Us</Link>
          <Link href="/contact" className="bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] to-[#1e3a8a] dark:from-[#b52bff] dark:to-[#00f0ff] opacity-80 hover:opacity-100 transition-all duration-300">Contact</Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
