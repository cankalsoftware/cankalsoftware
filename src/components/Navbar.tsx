"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import {
  ChevronDown,
  Bot,
  ShieldAlert,
  ShieldCheck,
  Search,
  ExternalLink,
  Sparkles,
  Menu,
  X,
  Code2,
  Wrench,
} from "lucide-react";

export function Navbar() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toolItems = [
    {
      name: "AEO & LLM Scanner",
      desc: "Audit ChatGPT, Claude & Perplexity search readiness & schemas",
      href: "/aeo-scanner",
      badge: "AI",
      badgeColor: "bg-blue-500/10 dark:bg-purple-500/20 text-[#2563eb] dark:text-[#00f0ff] border-blue-500/20",
      icon: Bot,
      external: false,
    },
    {
      name: "Vulnerability Check",
      desc: "Cross-reference CVE, MITRE, NIST NVD & NCSC UK security baselines",
      href: "/vulnerability-check",
      badge: "CVE",
      badgeColor: "bg-emerald-500/10 dark:bg-cyan-500/20 text-emerald-600 dark:text-[#00f0ff] border-emerald-500/20",
      icon: ShieldAlert,
      external: false,
    },
    {
      name: "OWASP Top 10 Audit",
      desc: "Audit web applications against the 2026 OWASP Top 10 risks",
      href: "/owasp-check",
      badge: "2026",
      badgeColor: "bg-purple-500/10 dark:bg-purple-500/20 text-[#b52bff] dark:text-[#00f0ff] border-purple-500/20",
      icon: ShieldCheck,
      external: false,
    },
    {
      name: "Google Scrape App",
      desc: "Automated Google Search & Maps data scraping & lead generation",
      href: "https://github.com/cankalsoftware/Google-Scrape",
      badge: "OPEN SOURCE",
      badgeColor: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20",
      icon: Search,
      external: true,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/60 dark:border-white/10 bg-[#f8fafc]/85 dark:bg-[#030014]/85 backdrop-blur-md transition-all shadow-sm">
      <nav className="mx-auto max-w-7xl flex items-center justify-between py-3.5 px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-tighter">
            <Image
              src="/brain-icon.png"
              alt="Cankal Software Brain Icon"
              width={32}
              height={32}
              className="rounded-md object-contain"
            />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-[#2563eb] dark:from-[#b52bff] dark:to-[#00f0ff]">
              CankalSoftware
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-7 text-base font-semibold">
          <Link
            href="/"
            className="bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] to-[#1e3a8a] dark:from-[#b52bff] dark:to-[#00f0ff] opacity-80 hover:opacity-100 transition-all duration-300"
          >
            Home
          </Link>
          <Link
            href="/#ai-transformation"
            className="bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] to-[#1e3a8a] dark:from-[#b52bff] dark:to-[#00f0ff] opacity-80 hover:opacity-100 transition-all duration-300"
          >
            AI Transformation
          </Link>

          {/* Tool Sets Dropdown */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
          >
            <button
              type="button"
              onClick={() => setToolsOpen((prev) => !prev)}
              aria-expanded={toolsOpen}
              className="bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] to-[#1e3a8a] dark:from-[#b52bff] dark:to-[#00f0ff] opacity-80 hover:opacity-100 transition-all duration-300 flex items-center gap-1.5 cursor-pointer py-1"
            >
              <span>Tool Sets</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-blue-500/10 dark:bg-purple-500/20 text-[#2563eb] dark:text-[#00f0ff] border border-blue-500/20 dark:border-[#b52bff]/30">
                {toolItems.length}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#2563eb] dark:text-[#00f0ff] transition-transform duration-200 ${
                  toolsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {toolsOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-80 z-50">
                <div className="p-2 rounded-2xl bg-white/95 dark:bg-[#070514]/95 border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-2xl space-y-1">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                    <span>Engineering &amp; Security Tools</span>
                    <Sparkles className="w-3 h-3 text-[#2563eb] dark:text-[#00f0ff]" />
                  </div>

                  {toolItems.map((tool, idx) => {
                    const Icon = tool.icon;
                    if (tool.external) {
                      return (
                        <a
                          key={idx}
                          href={tool.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setToolsOpen(false)}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-white/5 flex items-center justify-center text-[#2563eb] dark:text-[#00f0ff] shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-foreground group-hover:text-[#2563eb] dark:group-hover:text-[#00f0ff] transition-colors flex items-center gap-1">
                                {tool.name} <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${tool.badgeColor}`}>
                                {tool.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-tight line-clamp-2">
                              {tool.desc}
                            </p>
                          </div>
                        </a>
                      );
                    }

                    return (
                      <Link
                        key={idx}
                        href={tool.href}
                        onClick={() => setToolsOpen(false)}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-white/5 flex items-center justify-center text-[#2563eb] dark:text-[#00f0ff] shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-foreground group-hover:text-[#2563eb] dark:group-hover:text-[#00f0ff] transition-colors">
                              {tool.name}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${tool.badgeColor}`}>
                              {tool.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-tight line-clamp-2">
                            {tool.desc}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/about"
            className="bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] to-[#1e3a8a] dark:from-[#b52bff] dark:to-[#00f0ff] opacity-80 hover:opacity-100 transition-all duration-300"
          >
            About Us
          </Link>
          <Link
            href="/contact"
            className="bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] to-[#1e3a8a] dark:from-[#b52bff] dark:to-[#00f0ff] opacity-80 hover:opacity-100 transition-all duration-300"
          >
            Contact
          </Link>
        </div>

        {/* Right Actions & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menu"
            className="md:hidden p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-black/10 dark:border-white/10 bg-[#f8fafc]/98 dark:bg-[#030014]/98 px-4 py-6 space-y-4 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col space-y-3 font-semibold text-sm">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/#ai-transformation"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              AI Transformation
            </Link>

            {/* Mobile Tool Sets Section */}
            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 space-y-2 border border-black/5 dark:border-white/5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1 flex items-center justify-between">
                <span>Tool Sets</span>
                <Wrench className="w-3.5 h-3.5 text-[#2563eb] dark:text-[#00f0ff]" />
              </div>
              <div className="space-y-1">
                {toolItems.map((tool, idx) => (
                  <Link
                    key={idx}
                    href={tool.href}
                    target={tool.external ? "_blank" : undefined}
                    rel={tool.external ? "noopener noreferrer" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-xs font-semibold"
                  >
                    <span className="flex items-center gap-2">
                      <tool.icon className="w-4 h-4 text-[#2563eb] dark:text-[#00f0ff]" />
                      {tool.name}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
