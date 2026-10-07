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
  Scale,
  FileText,
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
      title: "Cookie Consent & Consent Mode v2",
      desc: "Detects active CMP banners, explicit Reject All buttons, granular category toggles, and Google Consent Mode v2 default 'denied' signals.",
      icon: Cookie,
      badge: "PECR & ePrivacy",
    },
    {
      title: "Mandatory Legal Pages Audit",
      desc: "Verifies public availability of essential legal routes (Privacy Policy, Cookie Policy, Terms of Service, Acceptable Use, and Contact) under UK GDPR.",
      icon: Scale,
      badge: "GDPR Compliance",
    },
    {
      title: "Link Architecture & Dead Link Check",
      desc: "Inspects internal vs external link distribution, flags placeholder (#/void) anchors, broken 404 links, and reverse tabnabbing risks.",
      icon: Layers,
      badge: "Crawlability",
    },
  ];

  const faqs = [
    {
      q: "What does the Website Health & Compliance Audit check?",
      a: "Our Website Health Tool provides a comprehensive, passive inspection of key webpage health indicators including H1–H3 heading hierarchy, image alt text accessibility, contact form endpoints, reCAPTCHA bot defense, Cookie Consent settings (Reject All, Consent Mode v2), mandatory legal pages (Privacy Policy, Cookie Declaration, Terms of Service, Acceptable Use), broken 404 links, and HTTP performance standards.",
    },
    {
      q: "Why is Google Consent Mode v2 mandatory for UK and EU websites?",
      a: "Since March 2024, Google requires Google Consent Mode v2 (specifically ad_storage, analytics_storage, ad_user_data, and ad_personalization default 'denied' tags) for any site using Google Analytics 4 or Google Ads in the UK and EEA. Without these signals, conversion tracking and audience modeling are blocked or degraded.",
    },
    {
      q: "What legal pages must a website have to comply with GDPR and local laws?",
      a: "Under UK GDPR, EU GDPR, PECR, and consumer protection regulations, commercial websites must provide: (1) A Privacy Policy detailing the Data Controller identity, lawful basis under Article 6, retention schedules, data subject rights, and ICO complaint notice; (2) A Cookie Policy with an itemized cookie inventory and withdrawal instructions; (3) Terms of Service governing liability and jurisdiction; (4) An Acceptable Use Policy / Impressum; and (5) Direct corporate contact information.",
    },
    {
      q: "Why is an explicit 'Reject All' button required on cookie banners?",
      a: "Under EDPB guidelines and UK Information Commissioner's Office (ICO) enforcement, refusing non-essential cookies must require no more clicks or visual effort than accepting. Banners with only an 'Accept' button or hiding rejection inside complex submenus violate GDPR and PECR consent standards.",
    },
    {
      q: "How does the tool test for broken or dead links?",
      a: "The scanner parses all anchor tags (<a href='...'>), categorises them into internal vs external links, flags placeholder void links (href='#' or href='javascript:void(0)'), and performs lightweight asynchronous HEAD probes against sample links to detect 404 Not Found or 500 Server Errors.",
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
          <span>Web Health, Cookie Consent &amp; Legal Compliance Inspector</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight"
        >
          Website Health, GDPR Legal &amp;{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-[#00f0ff] to-[#7000ff]">
            Consent Audit
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm md:text-base text-muted-foreground leading-relaxed"
        >
          Comprehensive passive health check for modern web applications. Audit H1–H3 heading hierarchy, image alt accessibility, contact form endpoints, Cookie Consent settings (Google Consent Mode v2 &amp; Reject All), mandatory legal pages (Privacy, Cookies, Terms), and HTTP protocol standards.
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
            Six Core Pillars of Web Page Health &amp; Compliance
          </h2>
          <p className="text-muted-foreground text-xs md:text-sm">
            Everything search engines, screen readers, data protection authorities, and modern browsers evaluate when inspecting your site.
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
              Combine Website Health &amp; GDPR compliance checks with AI Engine Optimization (AEO/GEO), MITRE CVE vulnerability scanning, and 2026 OWASP Top 10 security compliance.
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
            Website Health, Legal &amp; Consent FAQs
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
