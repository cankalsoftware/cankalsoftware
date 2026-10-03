"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Zap,
  BookOpen,
  HelpCircle,
  Code2,
  Cpu,
} from "lucide-react";
import { OwaspScannerWidget } from "@/components/OwaspScannerWidget";

function OwaspCheckContent() {
  const searchParams = useSearchParams();
  const initialUrl = searchParams.get("url") || "";
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const owaspCategories = [
    {
      code: "A01:2026",
      title: "Broken Access Control",
      desc: "Flaws in authorization enforcement, permissive CORS policies, and missing UI framing controls (Clickjacking).",
    },
    {
      code: "A02:2026",
      title: "Cryptographic Failures",
      desc: "Transmission of sensitive data in cleartext, missing HSTS preload headers, or obsolete TLS protocols.",
    },
    {
      code: "A03:2026",
      title: "Injection & XSS",
      desc: "Cross-Site Scripting (XSS), SQL injection, and lack of Content-Security-Policy (CSP) headers.",
    },
    {
      code: "A04:2026",
      title: "Insecure Design",
      desc: "Missing threat modeling, absence of RFC 9116 security.txt contact channels, and lack of bot abuse mitigations.",
    },
    {
      code: "A05:2026",
      title: "Security Misconfiguration",
      desc: "Verbose server banners (Server, X-Powered-By), missing nosniff headers, and default error page disclosures.",
    },
    {
      code: "A06:2026",
      title: "Vulnerable Components",
      desc: "Client-side usage of legacy, unmaintained, or publicly vulnerable JavaScript libraries and CMS versions.",
    },
    {
      code: "A07:2026",
      title: "Identification & Auth Failures",
      desc: "Session cookies missing HttpOnly, Secure, or SameSite flags, enabling session hijacking and CSRF attacks.",
    },
    {
      code: "A08:2026",
      title: "Software & Data Integrity",
      desc: "Loading external CDN scripts without Subresource Integrity (SRI) hashes, risking supply-chain injection.",
    },
    {
      code: "A09:2026",
      title: "Logging & Monitoring Failures",
      desc: "Absence of real-time browser violation reporting endpoints (Report-To, CSP report-uri) to detect active attacks.",
    },
    {
      code: "A10:2026",
      title: "SSRF & Sensitive Exposure",
      desc: "Exposed environment configuration files (.env), exposed .git repositories, and internal metadata leaks.",
    },
  ];

  const faqs = [
    {
      q: "What is the OWASP Top 10?",
      a: "The Open Worldwide Application Security Project (OWASP) Top 10 is the globally recognized standard awareness document for developers and web application security. It represents a broad consensus on the most critical security risks facing web applications.",
    },
    {
      q: "How does this automated OWASP scanner work?",
      a: "Our scanner executes a non-intrusive, passive external probe against your web application. It evaluates public HTTP security headers, TLS configuration, cookie hygiene, client-side script integrity (SRI), server banner leakage, and exposed configuration files against the 2026 OWASP Top 10 framework.",
    },
    {
      q: "Will this scan disrupt or overload my website?",
      a: "No. The scan is 100% passive, safe, and read-only. It performs lightweight GET/HEAD requests with strict timeouts and rate limits, simulating a standard browser visit without injecting destructive payloads or performing brute-force attacks.",
    },
    {
      q: "What should I do if my website fails one or more OWASP categories?",
      a: "Each failed or warning category in the audit report includes a dedicated explanation of the risk, its CVSS severity score, and copy-paste remediation blueprints for Nginx, Apache (.htaccess), Next.js, and Cloudflare. If you require expert implementation, Cankal Software provides full-scope infrastructure hardening.",
    },
    {
      q: "Does an A+ score replace manual penetration testing?",
      a: "While achieving an A+ score confirms that your perimeter HTTP headers, SSL/TLS, and public configuration are hardened to industry best practices, automated passive scans do not replace comprehensive authenticated penetration testing or source code audits.",
    },
  ];

  return (
    <div className="min-h-screen pt-2 sm:pt-4 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-purple-500/15 border border-blue-500/20 dark:border-[#b52bff]/30 text-xs font-semibold text-[#2563eb] dark:text-[#00f0ff] uppercase tracking-wider"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>2026 OWASP Top 10 Web Application Security Standard</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
        >
          OWASP Top 10{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] to-[#00f0ff]">
            Vulnerability Check
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm md:text-base text-muted-foreground leading-relaxed"
        >
          Audit your website against all 10 OWASP risk categories. Receive instant pass/fail validation (✅/❌), CVSS severity metrics, and copy-paste server hardening blueprints.
        </motion.p>
      </div>

      {/* Main Interactive Scanner Widget */}
      <div className="w-full">
        <OwaspScannerWidget initialDomain={initialUrl} />
      </div>

      {/* 2026 OWASP Top 10 Framework Grid */}
      <div className="space-y-6 pt-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            The 2026 OWASP Top 10 Risk Categories
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Our scanner automatically evaluates your application against these ten foundational security benchmarks:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {owaspCategories.map((cat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl glass border border-black/10 dark:border-white/10 hover:border-[#2563eb]/40 dark:hover:border-[#00f0ff]/40 transition-all space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#2563eb]/10 text-[#2563eb] dark:text-[#00f0ff] border border-blue-500/20">
                  {cat.code}
                </span>
                <ShieldCheck className="w-4 h-4 text-muted-foreground/60" />
              </div>
              <h3 className="text-sm font-bold text-foreground">{cat.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {cat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-6 pt-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-[#2563eb] dark:text-[#00f0ff] text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" /> FAQ
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl glass border border-black/10 dark:border-white/10 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 md:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm md:text-base text-foreground cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 text-[#2563eb] dark:text-[#00f0ff] ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-4 md:px-5 md:pb-5 text-xs md:text-sm text-muted-foreground leading-relaxed border-t border-black/5 dark:border-white/5 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enterprise CTA Footer */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#2563eb]/20 via-[#b52bff]/20 to-[#00f0ff]/20 border border-blue-500/30 dark:border-[#b52bff]/40 backdrop-blur-xl relative overflow-hidden text-center space-y-4">
        <h3 className="text-2xl font-bold tracking-tight">
          Need a Formal Web Application Penetration Test?
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Cankal Software provides certified penetration testing, source code audits, and cyber defence architecture for enterprises across the UK and worldwide.
        </p>
        <div className="pt-2">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#00f0ff] text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:opacity-95 transition-all"
          >
            <span>Speak with a Cybersecurity Lead</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OwaspCheckPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OwaspCheckContent />
    </Suspense>
  );
}
