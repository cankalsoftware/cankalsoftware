"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  Heading,
  Image as ImageIcon,
  Send,
  Cookie,
  Layers,
  Zap,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Code2,
  ShieldCheck,
  Bot,
} from "lucide-react";
import { HealthScannerWidget } from "@/components/HealthScannerWidget";

function HealthCheckContent() {
  const searchParams = useSearchParams();
  const initialUrl = searchParams.get("url") || searchParams.get("domain") || "";
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const diagnosticPillars = [
    {
      title: "Heading Hierarchy (H1, H2, H3)",
      desc: "Audits document outline semantics, single <h1> enforcement, and logical <h2>–<h3> subheading sequence for optimal search indexing.",
      icon: Heading,
      badge: "DOM Semantics",
    },
    {
      title: "Image Alt Text Accessibility",
      desc: "Scans all <img> tags for missing or non-descriptive alt attributes to ensure WCAG accessibility compliance and image search ranking.",
      icon: ImageIcon,
      badge: "WCAG & SEO",
    },
    {
      title: "Interactive Form & Bot Guard",
      desc: "Validates contact and lead form action endpoints, method declarations, and active bot defense (Google reCAPTCHA / Cloudflare Turnstile).",
      icon: Send,
      badge: "Lead Security",
    },
    {
      title: "Cookie Consent & Privacy Framework",
      desc: "Detects active user consent banners (OneTrust, Cookiebot, Klaro, Google Consent Mode v2) for UK GDPR and PECR regulatory compliance.",
      icon: Cookie,
      badge: "GDPR Privacy",
    },
    {
      title: "Link Architecture & Dead Link Check",
      desc: "Inspects internal vs external link distribution, flags placeholder (#/void) anchors, broken 404 links, and reverse tabnabbing risks.",
      icon: Layers,
      badge: "Crawlability",
    },
    {
      title: "HTTP Standards & Protocol Hygiene",
      desc: "Evaluates HTTPS transport security, server response latency, Brotli/gzip compression, and canonical URL normalization.",
      icon: Zap,
      badge: "Core Vitals",
    },
  ];

  const faqs = [
    {
      q: "What is the Website Health & Structure Audit Tool?",
      a: "Our Website Health Tool provides a fast, passive browser-based inspection of key webpage health indicators including heading hierarchy (H1–H3), image alt text accessibility, interactive form health, bot defense (reCAPTCHA), cookie consent compliance, dead links, and HTTP performance standards.",
    },
    {
      q: "Why is a single <h1> tag important?",
      a: "HTML5 standards and major search engines (Google, Bing) rely on a single, prominent <h1> tag to establish the primary topic and semantic entity of the page. Multiple competing <h1> tags or missing <h1> elements dilute relevance and confuse assistive technologies.",
    },
    {
      q: "How does the tool test for broken or dead links?",
      a: "The scanner parses all anchor tags (<a href='...'>), categorises them into internal vs external links, flags placeholder void links (href='#' or href='javascript:void(0)'), and performs lightweight asynchronous HEAD probes against sample links to detect 404 Not Found or 500 Server Errors.",
    },
    {
      q: "Why should public contact forms have reCAPTCHA or Turnstile?",
      a: "Unprotected public contact forms are vulnerable to automated bot spam, credential stuffing, and email inbox flooding. Integrating invisible Google reCAPTCHA v3 or Cloudflare Turnstile verifies human interaction without degrading user experience.",
    },
    {
      q: "How does this tool connect with your other diagnostic scanners?",
      a: "The Health Tool serves as an intelligent diagnostic hub. If it detects missing structured data or /llms.txt, it recommends our AEO / GEO Scanner; if it identifies missing cybersecurity transport headers or CVE risks, it links directly to our CVE Vulnerability Scanner and 2026 OWASP Audit.",
    },
  ];

  return (
    <div className="min-h-screen pt-2 sm:pt-4 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Web Page Health, DOM Semantics &amp; Structure Inspector</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight"
        >
          Website Health, DOM Semantics &amp;{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-[#00f0ff] to-[#7000ff]">
            Link Audit
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm md:text-base text-muted-foreground leading-relaxed"
        >
          Comprehensive passive health check for modern web applications. Audit H1–H3 heading hierarchy, image alt accessibility, contact form endpoints, reCAPTCHA bot defense, cookie consent banners, and HTTP protocol standards.
        </motion.p>
      </div>

      {/* Interactive Scanner Widget */}
      <div className="w-full">
        <HealthScannerWidget initialDomain={initialUrl} />
      </div>

      {/* Feature Matrix */}
      <div className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Six Core Pillars of Web Page Health
          </h2>
          <p className="text-muted-foreground text-xs md:text-sm">
            Everything search engines, screen readers, and modern web browsers evaluate when crawling your web applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diagnosticPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-secondary/20 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-white/5">
                      {pillar.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cross-Tool Ecosystem Callout Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-[#00f0ff]/10 to-[#7000ff]/10 border border-white/10 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-3 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-[#00f0ff] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Integrated Developer Tool Suite
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              Explore Our Complete Audit Ecosystem
            </h3>
            <p className="text-muted-foreground text-xs md:text-sm max-w-2xl leading-relaxed">
              Combine Website Health checks with AI Engine Optimization (AEO/GEO), MITRE CVE vulnerability scanning, and 2026 OWASP Top 10 security compliance.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              href="/aeo-scanner"
              className="px-4 py-2.5 rounded-xl bg-secondary/80 hover:bg-secondary border border-white/10 text-xs font-semibold text-foreground transition-all flex items-center gap-1.5"
            >
              <Bot className="w-4 h-4 text-[#00f0ff]" />
              AEO Scanner
            </Link>
            <Link
              href="/vulnerability-check"
              className="px-4 py-2.5 rounded-xl bg-secondary/80 hover:bg-secondary border border-white/10 text-xs font-semibold text-foreground transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              CVE Scanner
            </Link>
            <Link
              href="/owasp-check"
              className="px-4 py-2.5 rounded-xl bg-secondary/80 hover:bg-secondary border border-white/10 text-xs font-semibold text-foreground transition-all flex items-center gap-1.5"
            >
              <Activity className="w-4 h-4 text-purple-400" />
              OWASP Audit
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-white/10 text-muted-foreground text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            Frequently Asked Questions
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Website Health & Architecture FAQs
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-secondary/20 border border-white/5 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 md:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm md:text-base text-foreground hover:text-[#00f0ff] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#00f0ff]" : ""
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
                      className="border-t border-white/5 px-4 pb-4 md:px-5 md:pb-5 text-xs md:text-sm text-muted-foreground leading-relaxed pt-3"
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
    </div>
  );
}

export default function HealthCheckPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <HealthCheckContent />
    </Suspense>
  );
}
