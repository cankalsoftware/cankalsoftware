import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full pt-4 px-4 sm:px-6 lg:px-8">
      <nav className="glass mx-auto max-w-7xl flex items-center justify-between p-4 px-6 shadow-sm shadow-black/5 dark:shadow-[#b52bff]/10">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-tighter">
            <Image src="/brain-icon.png" alt="Cankal Software Brain Icon" width={32} height={32} className="rounded-md object-contain" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-[#2563eb] dark:from-[#b52bff] dark:to-[#00f0ff]">CankalSoftware</span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-8 text-base font-semibold">
          <Link href="/" className="bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] to-[#1e3a8a] dark:from-[#b52bff] dark:to-[#00f0ff] opacity-80 hover:opacity-100 transition-all duration-300">Home</Link>
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
