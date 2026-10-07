"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ExternalLink,
  Code2,
  Lock,
  Zap,
  Copy,
  Check,
  Printer,
  Sparkles,
  RefreshCw,
  FileCheck2,
  Bot,
  Cookie,
  FileCode,
  Layers,
  Heading,
  Image as ImageIcon,
  ShieldCheck,
  Send,
  HelpCircle,
  Scale,
  FileText,
  CheckCheck,
  X,
} from "lucide-react";
import type { HealthScanResult } from "@/app/api/health-scan/route";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import {
  getScanQuota,
  recordScanUsage,
  MAX_FREE_SCANS_PER_MONTH,
  DEFAULT_SCAN_QUOTA,
} from "@/lib/scanQuota";

interface HealthScannerWidgetProps {
  compact?: boolean;
  initialDomain?: string;
}

export function HealthScannerWidget({
  compact = false,
  initialDomain = "",
}: HealthScannerWidgetProps) {
  const router = useRouter();
  const [url, setUrl] = useState(initialDomain);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<HealthScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "headings" | "forms" | "compliance" | "links" | "protocol" | "fixes" | "tools"
  >("overview");
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [quota, setQuota] = useState(DEFAULT_SCAN_QUOTA);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const tabMenuRef = useRef<HTMLDivElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuota(getScanQuota());
  }, []);

  const loadingSteps = [
    "Establishing TLS handshake & probing HTTP response status...",
    "Crawling page anchors, internal routes & external link health...",
    "Inspecting H1, H2, H3 hierarchy & document semantic structure...",
    "Auditing image alt attributes & media accessibility standards...",
    "Scanning interactive contact forms & reCAPTCHA / Turnstile defense...",
    "Verifying Cookie Consent settings, Reject All & Google Consent Mode v2...",
    "Auditing mandatory legal pages (Privacy, Cookies, Terms, Impressum)...",
    "Synthesising website health score & compliance recommendations...",
  ];

  const handleScan = async (e?: React.FormEvent, overrideUrl?: string) => {
    if (e) e.preventDefault();
    const target = (overrideUrl || url).trim();
    if (!target) {
      setError("Please enter a valid website domain or URL.");
      return;
    }

    const currentQuota = getScanQuota();
    if (!currentQuota.allowed) {
      setError(
        `Monthly Fair Use Quota Reached (${MAX_FREE_SCANS_PER_MONTH}/${MAX_FREE_SCANS_PER_MONTH} free scans used this month). If you require continuous automated monitoring or bulk audits, please contact our engineering team.`
      );
      return;
    }

    setError(null);
    setResult(null);
    setLoading(true);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 600);

    try {
      let token = "";
      if (executeRecaptcha) {
        try {
          token = await executeRecaptcha("health_scan");
        } catch {
          // Continue gracefully if recaptcha fails client-side
        }
      }

      const res = await fetch("/api/health-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target, recaptchaToken: token }),
      });

      const data = await res.json();
      clearInterval(stepInterval);

      if (!res.ok) {
        setError(data.error || "Failed to audit website health. Please verify the domain and try again.");
      } else {
        setResult(data);
        const updated = recordScanUsage(target);
        setQuota(updated);

        // Smoothly bring the top of the results into view (anchored on score and tab bar)
        setTimeout(() => {
          if (resultsContainerRef.current) {
            const rect = resultsContainerRef.current.getBoundingClientRect();
            const targetY = window.scrollY + rect.top - 80;
            window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
          }
        }, 120);
      }
    } catch {
      clearInterval(stepInterval);
      setError("Network or scanner error occurred. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    // Ensure the page stays anchored at the tab menu so user does not jump to bottom or get lost
    if (tabMenuRef.current) {
      const rect = tabMenuRef.current.getBoundingClientRect();
      if (rect.top < 75 || rect.top > 250) {
        const targetY = window.scrollY + rect.top - 85;
        window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
      }
    }
  };

  const copyToClipboard = (text: string, snippetId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(snippetId);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "B":
        return "bg-blue-500/15 text-blue-600 dark:text-[#00f0ff] border-blue-500/30";
      case "C":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      default:
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
    }
  };

  return (
    <div className="w-full">
      {/* Scanner Card */}
      <div className="glass p-6 md:p-8 rounded-2xl border border-white/10 relative overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-[#00f0ff]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-[#7000ff]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Title if not compact */}
        {!compact && (
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              HTML5 Semantics, Cookie Consent &amp; Legal Compliance Inspector
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Website Health &amp; Compliance Audit
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Comprehensive passive audit of H1–H3 headings, image alt accessibility, contact forms, Cookie Consent settings, legal pages (GDPR / PECR), dead links, and HTTP standards.
            </p>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleScan} className="relative z-10 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter domain or URL (e.g. example.co.uk or https://mysite.com)"
                disabled={loading}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-secondary/40 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00f0ff] transition-all text-sm md:text-base"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim() || !quota.allowed}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#7000ff] text-black font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00f0ff]/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base whitespace-nowrap cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Auditing Health...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  Inspect Website Health
                </>
              )}
            </button>
          </div>

          {/* Fair-Use Quota & Quick Samples */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Quick inspect:</span>
              {["cankalsoftware.com", "bbc.co.uk", "gov.uk", "stripe.com"].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setUrl(sample);
                    handleScan(undefined, sample);
                  }}
                  disabled={loading}
                  className="px-2 py-0.5 rounded-md bg-secondary/60 hover:bg-secondary border border-white/5 transition-colors text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {sample}
                </button>
              ))}
            </div>

            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{quota.remaining} of {MAX_FREE_SCANS_PER_MONTH} free monthly checks remaining</span>
            </span>
          </div>
        </form>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Audit Blocked or Failed</p>
              <p className="text-xs text-destructive/80 leading-relaxed">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Loading Radar Animation */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 py-12 flex flex-col items-center justify-center text-center space-y-6"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin flex items-center justify-center" />
              <Activity className="w-8 h-8 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="space-y-2 max-w-md">
              <p className="font-semibold text-foreground text-sm md:text-base">
                Scanning Website Architecture &amp; Legal Hygiene
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {loadingSteps[loadingStep]}
              </p>
            </div>
            <div className="w-48 bg-secondary rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#00f0ff] to-emerald-400 h-full transition-all duration-500"
                style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* Results Panel */}
        {result && !loading && (
          <motion.div
            ref={resultsContainerRef}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-6"
          >
            {/* Header Score Banner */}
            <div className="p-6 rounded-2xl bg-secondary/30 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-secondary/60 border border-white/10 flex flex-col items-center justify-center text-center shadow-inner">
                    <span className="text-3xl font-extrabold text-foreground">
                      {result.overallScore}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                      / 100
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-foreground capitalize">
                      {result.domain}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-md border text-xs font-bold ${getGradeBadge(
                        result.grade
                      )}`}
                    >
                      Grade {result.grade}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                    {result.summary}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-secondary/60 hover:bg-secondary border border-white/10 text-xs font-medium text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Report
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setUrl("");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-secondary/60 hover:bg-secondary border border-white/10 text-xs font-medium text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  New Audit
                </button>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-xl bg-secondary/20 border border-white/5 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Heading className="w-3.5 h-3.5 text-[#00f0ff]" />
                  Headings Tree
                </span>
                <p className="text-base font-bold text-foreground">
                  {result.metrics.h1Count} H1 • {result.metrics.h2Count} H2
                </p>
                <span className={`text-[10px] font-semibold ${result.headings.status === "pass" ? "text-emerald-400" : "text-amber-400"}`}>
                  {result.headings.status === "pass" ? "✓ Valid Structure" : "⚠ Heading Issues"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/20 border border-white/5 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                  Image Alt Tags
                </span>
                <p className="text-base font-bold text-foreground">
                  {result.images.withAlt} / {result.images.total} Alt
                </p>
                <span className={`text-[10px] font-semibold ${result.images.missingAlt === 0 ? "text-emerald-400" : "text-amber-400"}`}>
                  {result.images.missingAlt === 0 ? "✓ 100% Accessible" : `⚠ ${result.images.missingAlt} Missing Alt`}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/20 border border-white/5 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-blue-400" />
                  Contact Health
                </span>
                <p className="text-base font-bold text-foreground truncate">
                  {result.metrics.formsCount > 0
                    ? `${result.metrics.formsCount} Form(s) On-Page`
                    : result.forms.contactPage?.found
                    ? "Contact Page Found"
                    : "No Form Found"}
                </p>
                <span className={`text-[10px] font-semibold ${result.forms.status === "pass" ? "text-emerald-400" : "text-amber-400"}`}>
                  {result.metrics.formsCount > 0
                    ? (result.metrics.hasCaptcha ? "✓ Bot Guarded" : "⚠ No Captcha")
                    : result.forms.contactPage?.found
                    ? (result.forms.contactPage.hasCaptcha ? "✓ Verified & Guarded" : "⚠ Route Needs Captcha")
                    : "⚠ No Contact Link"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/20 border border-white/5 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Cookie className="w-3.5 h-3.5 text-amber-400" />
                  Cookie Consent
                </span>
                <p className="text-base font-bold text-foreground truncate">
                  {result.cookieConsent.detected ? result.cookieConsent.provider : "Missing Banner"}
                </p>
                <span className={`text-[10px] font-semibold ${result.cookieConsent.status === "pass" ? "text-emerald-400" : result.cookieConsent.status === "warning" ? "text-amber-400" : "text-rose-400"}`}>
                  {result.cookieConsent.status === "pass" ? "✓ GDPR & PECR Pass" : result.cookieConsent.status === "warning" ? `⚠ Score ${result.cookieConsent.score}/100` : "✕ Non-Compliant"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/20 border border-white/5 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-teal-400" />
                  Legal Pages
                </span>
                <p className="text-base font-bold text-foreground">
                  {result.legalPages.totalFound} / {result.legalPages.totalChecked} Found
                </p>
                <span className={`text-[10px] font-semibold ${result.legalPages.status === "pass" ? "text-emerald-400" : result.legalPages.status === "warning" ? "text-amber-400" : "text-rose-400"}`}>
                  {result.legalPages.status === "pass" ? "✓ Full Compliance" : result.legalPages.status === "warning" ? `⚠ ${result.legalPages.totalChecked - result.legalPages.totalFound} Missing` : "✕ Critical Deficit"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/20 border border-white/5 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#00f0ff]" />
                  Server Latency
                </span>
                <p className="text-base font-bold text-foreground">
                  {result.metrics.responseTimeMs} ms
                </p>
                <span className="text-[10px] font-semibold text-emerald-400">
                  HTTP {result.metrics.statusCode} • {result.metrics.isHttps ? "TLS 1.3" : "Plain HTTP"}
                </span>
              </div>
            </div>

            {/* Navigation Tabs - Sticky Anchor Bar */}
            <div
              ref={tabMenuRef}
              className="sticky top-20 z-20 flex items-center gap-1 p-1.5 bg-background/95 dark:bg-[#070514]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-x-auto no-scrollbar shadow-lg shadow-black/20"
            >
              {[
                { id: "overview", label: "Overview", icon: Activity },
                { id: "headings", label: `Headings & Images`, icon: Heading },
                { id: "forms", label: `Forms & Security`, icon: ShieldCheck },
                { id: "compliance", label: `Consent & Legal (GDPR)`, icon: Scale, badge: `${result.legalPages.totalFound}/${result.legalPages.totalChecked}` },
                { id: "links", label: `Links (${result.metrics.totalLinks})`, icon: Layers },
                { id: "protocol", label: "HTTP & Protocol", icon: Zap },
                { id: "tools", label: `Sister Tools (${result.sisterToolRecommendations.length})`, icon: Sparkles },
                { id: "fixes", label: "Code Fixes", icon: Code2 },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id as typeof activeTab)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#00f0ff] text-black shadow-md shadow-[#00f0ff]/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? "bg-black/20 text-black" : "bg-white/10 text-muted-foreground"}`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="space-y-4">
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Headings & DOM Summary */}
                    <div className="p-5 rounded-xl bg-secondary/20 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground flex items-center gap-2">
                          <Heading className="w-4 h-4 text-[#00f0ff]" />
                          Heading Hierarchy (H1–H3)
                        </span>
                        {result.headings.status === "pass" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {result.headings.message}
                      </p>
                      <div className="space-y-1.5 pt-1">
                        {result.headings.h1.map((h1, i) => (
                          <div key={i} className="text-xs font-semibold text-foreground px-2.5 py-1.5 rounded-lg bg-secondary/50 border border-white/5 flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#00f0ff]/20 text-[#00f0ff]">H1</span>
                            <span className="truncate">{h1}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Forms & Bot Defense Summary */}
                    <div className="p-5 rounded-xl bg-secondary/20 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-purple-400" />
                          Interactive Forms &amp; Bot Defense
                        </span>
                        {result.forms.status === "pass" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {result.forms.message}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${result.forms.hasCaptcha || result.forms.contactPage?.hasCaptcha ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                          Bot Defense: {result.forms.hasCaptcha || result.forms.contactPage?.hasCaptcha ? "Active (reCAPTCHA / Turnstile)" : "Missing"}
                        </span>
                        {result.forms.contactPage?.url && (
                          <button
                            type="button"
                            onClick={() => {
                              setUrl(result.forms.contactPage!.url!);
                              handleScan(undefined, result.forms.contactPage!.url!);
                            }}
                            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <span>Inspect Contact Route</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Cookie Consent Summary */}
                    <div className="p-5 rounded-xl bg-secondary/20 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground flex items-center gap-2">
                          <Cookie className="w-4 h-4 text-amber-400" />
                          Cookie Consent &amp; Privacy Settings
                        </span>
                        {result.cookieConsent.status === "pass" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : result.cookieConsent.status === "warning" ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {result.cookieConsent.details}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                        <span className={`px-2.5 py-0.5 rounded-md border font-semibold ${result.cookieConsent.detected ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
                          CMP: {result.cookieConsent.detected ? result.cookieConsent.provider : "Not Detected"}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-md border font-semibold ${result.cookieConsent.hasRejectAll ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                          Reject All Button: {result.cookieConsent.hasRejectAll ? "✓ Present" : "✕ Missing"}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-md border font-semibold ${result.cookieConsent.hasGoogleConsentModeV2 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                          Consent Mode v2: {result.cookieConsent.hasGoogleConsentModeV2 ? "✓ Configured" : "✕ Denied Signals Missing"}
                        </span>
                      </div>
                    </div>

                    {/* Legal Pages Summary */}
                    <div className="p-5 rounded-xl bg-secondary/20 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground flex items-center gap-2">
                          <Scale className="w-4 h-4 text-teal-400" />
                          Mandatory Legal Pages (UK GDPR &amp; PECR)
                        </span>
                        {result.legalPages.status === "pass" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : result.legalPages.status === "warning" ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {result.legalPages.message}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {result.legalPages.pages.map((p) => (
                          <span
                            key={p.id}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${
                              p.found
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                          >
                            {p.found ? "✓" : "✕"} {p.name.split("/")[0].trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sister Tool Callout Banner */}
                  {result.sisterToolRecommendations.length > 0 && (
                    <div className="p-5 rounded-xl bg-gradient-to-r from-[#00f0ff]/10 via-[#7000ff]/10 to-transparent border border-[#00f0ff]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#00f0ff] uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5" />
                          Recommended Next Step
                        </span>
                        <p className="text-sm font-semibold text-foreground">
                          {result.sisterToolRecommendations[0].title}
                        </p>
                        <p className="text-xs text-muted-foreground max-w-xl">
                          {result.sisterToolRecommendations[0].description}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push(result.sisterToolRecommendations[0].link)}
                        className="px-4 py-2 rounded-xl bg-[#00f0ff] text-black font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all shrink-0 cursor-pointer"
                      >
                        Launch Sister Tool
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: HEADINGS & IMAGES */}
              {activeTab === "headings" && (
                <div className="space-y-6">
                  {/* Headings Tree */}
                  <div className="p-5 rounded-xl bg-secondary/20 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">
                          Heading Hierarchy Breakdown
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {result.headings.message}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">
                        {result.metrics.h1Count} H1 • {result.metrics.h2Count} H2 • {result.metrics.h3Count} H3
                      </span>
                    </div>

                    <div className="space-y-2">
                      {result.headings.h1.map((h1, i) => (
                        <div key={`h1-${i}`} className="p-3 rounded-lg bg-secondary/40 border border-white/5 flex items-start gap-3">
                          <span className="px-2 py-0.5 rounded bg-[#00f0ff]/20 text-[#00f0ff] font-bold text-xs">H1</span>
                          <span className="text-sm font-bold text-foreground">{h1}</span>
                        </div>
                      ))}

                      {result.headings.h2.map((h2, i) => (
                        <div key={`h2-${i}`} className="p-2.5 pl-6 rounded-lg bg-secondary/20 border border-white/5 flex items-start gap-3 ml-4">
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-xs">H2</span>
                          <span className="text-xs font-semibold text-foreground">{h2}</span>
                        </div>
                      ))}

                      {result.headings.h3.map((h3, i) => (
                        <div key={`h3-${i}`} className="p-2 pl-8 rounded-lg bg-secondary/10 border border-white/5 flex items-start gap-3 ml-8">
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-xs">H3</span>
                          <span className="text-xs text-muted-foreground">{h3}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Images & Alt Text */}
                  <div className="p-5 rounded-xl bg-secondary/20 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">
                          Image Alt Text Accessibility ({result.images.total} Total Images)
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {result.images.message}
                        </p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${result.images.missingAlt === 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                        {result.images.withAlt} / {result.images.total} Alt Present
                      </span>
                    </div>

                    <div className="divide-y divide-white/5">
                      {result.images.samples.map((img, i) => (
                        <div key={i} className="py-2.5 flex items-center justify-between gap-4">
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-xs font-mono text-muted-foreground truncate max-w-md">
                              {img.src}
                            </p>
                            <p className="text-xs text-foreground font-medium">
                              Alt: {img.alt || <span className="text-rose-400 italic">Missing Alt Attribute</span>}
                            </p>
                          </div>
                          {img.hasAlt ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                              ✓ Accessible
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                              ✕ Missing Alt
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: FORMS & BOT DEFENSE */}
              {activeTab === "forms" && (
                <div className="space-y-4">
                  {/* Dedicated Contact Route Card */}
                  {result.forms.contactPage?.found && (
                    <div className="p-5 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent border border-blue-500/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground flex items-center gap-2">
                          <Send className="w-4 h-4 text-blue-400" />
                          Dedicated Contact Route Discovered
                        </span>
                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${result.forms.contactPage.hasCaptcha ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                          {result.forms.contactPage.hasCaptcha ? "✓ Bot Defense Verified" : "⚠ Bot Protection Missing"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {result.forms.contactPage.message}
                      </p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                        <span className="text-xs font-mono text-[#00f0ff] truncate max-w-md">
                          {result.forms.contactPage.url}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setUrl(result.forms.contactPage!.url!);
                            handleScan(undefined, result.forms.contactPage!.url!);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <span>Inspect Contact Page URL</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Forms Grid */}
                  <div className="p-5 rounded-xl bg-secondary/20 border border-white/5 space-y-4">
                    <h4 className="text-sm font-bold text-foreground">
                      On-Page Form Elements ({result.forms.total} Detected on Audited URL)
                    </h4>
                    {result.forms.items.length === 0 ? (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        No HTML &lt;form&gt; elements located on this specific URL. {result.forms.contactPage?.found ? "Your contact form is hosted on your dedicated contact page discovered above." : "Ensure your site provides a visible contact route or form for prospects."}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {result.forms.items.map((form, i) => (
                          <div key={i} className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold text-[#00f0ff]">
                                Form #{i + 1} ({form.method})
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${form.hasCaptcha ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                                {form.hasCaptcha ? "✓ Protected by Captcha" : "⚠ No Bot Protection"}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Action Endpoint: <span className="font-mono text-foreground">{form.action}</span>
                            </p>
                            <div className="flex gap-4 text-xs text-muted-foreground pt-1">
                              <span>Inputs: <strong>{form.inputCount}</strong></span>
                              <span>Email Field: <strong>{form.hasEmailInput ? "Yes" : "No"}</strong></span>
                              <span>Submit Trigger: <strong>{form.hasSubmitButton ? "Yes" : "No"}</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: CONSENT & LEGAL COMPLIANCE (GDPR & PECR) */}
              {activeTab === "compliance" && (
                <div className="space-y-6">
                  {/* SECTION 1: COOKIE CONSENT SETTINGS DEEP DIVE */}
                  <div className="p-6 rounded-2xl bg-secondary/25 border border-white/10 space-y-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                          <Cookie className="w-3.5 h-3.5" />
                          PECR &amp; ePrivacy Consent Audit
                        </span>
                        <h4 className="text-base font-bold text-foreground">
                          Cookie Consent Settings &amp; Google Consent Mode v2
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {result.cookieConsent.details}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono text-muted-foreground">
                          Score: <strong className="text-foreground">{result.cookieConsent.score}/100</strong>
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${result.cookieConsent.status === "pass" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : result.cookieConsent.status === "warning" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-rose-500/15 text-rose-400 border-rose-500/30"}`}>
                          {result.cookieConsent.status === "pass" ? "✓ Fully Compliant" : result.cookieConsent.status === "warning" ? "⚠ Configuration Required" : "✕ Non-Compliant"}
                        </span>
                      </div>
                    </div>

                    {/* 6-Point Settings Matrix */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      {/* 1. CMP Provider */}
                      <div className="p-3.5 rounded-xl bg-secondary/40 border border-white/5 space-y-1">
                        <span className="text-muted-foreground font-medium flex items-center justify-between">
                          <span>1. CMP Banner Platform</span>
                          {result.cookieConsent.detected ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-rose-400" />
                          )}
                        </span>
                        <p className="font-bold text-foreground">
                          {result.cookieConsent.detected ? result.cookieConsent.provider : "No CMP Detected"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {result.cookieConsent.detected ? "Active consent UI detected" : "Required for non-essential cookies"}
                        </p>
                      </div>

                      {/* 2. Reject All */}
                      <div className="p-3.5 rounded-xl bg-secondary/40 border border-white/5 space-y-1">
                        <span className="text-muted-foreground font-medium flex items-center justify-between">
                          <span>2. Explicit &apos;Reject All&apos;</span>
                          {result.cookieConsent.hasRejectAll ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </span>
                        <p className="font-bold text-foreground">
                          {result.cookieConsent.hasRejectAll ? "Equal Prominence" : "Missing / Obscured"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          EDPB &amp; UK ICO require 1-click rejection
                        </p>
                      </div>

                      {/* 3. Granular Category Controls */}
                      <div className="p-3.5 rounded-xl bg-secondary/40 border border-white/5 space-y-1">
                        <span className="text-muted-foreground font-medium flex items-center justify-between">
                          <span>3. Granular Category Toggles</span>
                          {result.cookieConsent.hasGranularSettings ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </span>
                        <p className="font-bold text-foreground">
                          {result.cookieConsent.hasGranularSettings ? "Preferences Drawer Present" : "Missing Granular Toggles"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Separate Analytics, Ads, Preferences
                        </p>
                      </div>

                      {/* 4. Google Consent Mode v2 */}
                      <div className="p-3.5 rounded-xl bg-secondary/40 border border-white/5 space-y-1">
                        <span className="text-muted-foreground font-medium flex items-center justify-between">
                          <span>4. Google Consent Mode v2</span>
                          {result.cookieConsent.hasGoogleConsentModeV2 ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </span>
                        <p className="font-bold text-foreground">
                          {result.cookieConsent.hasGoogleConsentModeV2 ? "Default 'Denied' Configured" : "Missing Consent Mode v2"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          ad_user_data &amp; analytics_storage
                        </p>
                      </div>

                      {/* 5. Prior Consent Blocking */}
                      <div className="p-3.5 rounded-xl bg-secondary/40 border border-white/5 space-y-1">
                        <span className="text-muted-foreground font-medium flex items-center justify-between">
                          <span>5. Prior Consent Script Guard</span>
                          {result.cookieConsent.hasExplicitPriorConsent ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </span>
                        <p className="font-bold text-foreground">
                          {result.cookieConsent.hasExplicitPriorConsent ? "Tags Deferred / Guarded" : "Unblocked Trackers Detected"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Cookies cannot load prior to opt-in
                        </p>
                      </div>

                      {/* 6. Revocation Mechanism */}
                      <div className="p-3.5 rounded-xl bg-secondary/40 border border-white/5 space-y-1">
                        <span className="text-muted-foreground font-medium flex items-center justify-between">
                          <span>6. Consent Revocation Link</span>
                          {result.cookieConsent.hasConsentWithdrawalMechanism ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </span>
                        <p className="font-bold text-foreground">
                          {result.cookieConsent.hasConsentWithdrawalMechanism ? "Persistent Trigger Present" : "Missing Revocation Widget"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Users must be able to alter choice anytime
                        </p>
                      </div>
                    </div>

                    {/* Actionable Missing Consent Advice */}
                    {result.cookieConsent.missingAdvice.length > 0 && (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>Actionable Cookie Consent Advice (UK GDPR &amp; PECR Regulation 6)</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                          {result.cookieConsent.missingAdvice.map((advice, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {advice}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* SECTION 2: LEGAL PAGES & REGULATORY COMPLIANCE MATRIX */}
                  <div className="p-6 rounded-2xl bg-secondary/25 border border-white/10 space-y-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-400 uppercase tracking-wider">
                          <Scale className="w-3.5 h-3.5" />
                          Statutory &amp; Regulatory Documentation
                        </span>
                        <h4 className="text-base font-bold text-foreground">
                          Mandatory Legal Pages Audit ({result.legalPages.totalFound} of {result.legalPages.totalChecked} Verified)
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {result.legalPages.summary}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border shrink-0 ${result.legalPages.status === "pass" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : result.legalPages.status === "warning" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-rose-500/15 text-rose-400 border-rose-500/30"}`}>
                        {result.legalPages.totalFound} / {result.legalPages.totalChecked} Legal Pages Found
                      </span>
                    </div>

                    {/* Legal Pages Breakdown Cards */}
                    <div className="space-y-4">
                      {result.legalPages.pages.map((page) => (
                        <div
                          key={page.id}
                          className={`p-5 rounded-xl border transition-all ${
                            page.found
                              ? "bg-secondary/30 border-white/10"
                              : "bg-rose-500/5 border-rose-500/20"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <FileText className={`w-4 h-4 ${page.found ? "text-emerald-400" : "text-rose-400"}`} />
                                <h5 className="text-sm font-bold text-foreground">
                                  {page.name}
                                </h5>
                              </div>
                              <span className="text-[10px] font-semibold text-muted-foreground block">
                                Governing Law: <strong className="text-foreground">{page.requiredBy}</strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {page.found ? (
                                <>
                                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                    <CheckCheck className="w-3.5 h-3.5" /> Published
                                  </span>
                                  {page.url && (
                                    <a
                                      href={page.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2.5 py-1 rounded-md bg-secondary/80 hover:bg-secondary text-[11px] font-semibold text-foreground border border-white/10 flex items-center gap-1 transition-all"
                                    >
                                      <span>Visit Route</span>
                                      <ExternalLink className="w-3 h-3 text-[#00f0ff]" />
                                    </a>
                                  )}
                                </>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                                  <XCircle className="w-3.5 h-3.5" /> Missing from Navigation
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground my-3 leading-relaxed">
                            {page.summary}
                          </p>

                          {/* Mandatory Checklist */}
                          <div className="space-y-2 pt-1">
                            <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                              Mandatory Inclusions for Full Compliance:
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {page.mandatoryInclusions.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="p-2 rounded-lg bg-black/20 dark:bg-white/5 text-[11px] text-muted-foreground flex items-start gap-2"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] mt-1.5 shrink-0" />
                                  <span className="leading-snug">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Advice if missing */}
                          {!page.found && page.missingAdvice.length > 0 && (
                            <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
                              <p className="font-bold flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                                Legal Compliance Advice:
                              </p>
                              {page.missingAdvice.map((adv, aIdx) => (
                                <p key={aIdx} className="text-[11px] text-muted-foreground leading-relaxed">
                                  {adv}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: LINKS & ANCHORS */}
              {activeTab === "links" && (
                <div className="p-5 rounded-xl bg-secondary/20 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        Link Architecture &amp; Sample Probes
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {result.links.message}
                      </p>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                        {result.links.internal} Internal
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
                        {result.links.external} External
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-white/5">
                    {result.links.items.map((link, i) => (
                      <div key={i} className="py-2.5 flex items-center justify-between gap-4">
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate max-w-md">
                            {link.text}
                          </p>
                          <p className="text-[11px] font-mono text-muted-foreground truncate max-w-md">
                            {link.href}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${link.isInternal ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20"}`}>
                            {link.isInternal ? "Internal" : "External"}
                          </span>
                          {link.isVoid && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Placeholder #
                            </span>
                          )}
                          {link.isInsecureBlank && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              Noopener Missing
                            </span>
                          )}
                          {link.status && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${link.status === 200 ? "text-emerald-400" : "text-rose-400"}`}>
                              HTTP {link.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: HTTP & PROTOCOLS */}
              {activeTab === "protocol" && (
                <div className="p-5 rounded-xl bg-secondary/20 border border-white/5 space-y-4">
                  <h4 className="text-sm font-bold text-foreground">
                    HTTP Standards &amp; Server Performance
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-2">
                      <span className="text-muted-foreground font-semibold">Response Status &amp; Latency</span>
                      <p className="text-base font-bold text-emerald-400">
                        {result.protocol.statusCode} OK ({result.protocol.responseTimeMs} ms)
                      </p>
                      <p className="text-muted-foreground">{result.protocol.message}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-2">
                      <span className="text-muted-foreground font-semibold">Canonical Tag Normalisation</span>
                      <p className="text-sm font-mono text-foreground truncate">
                        {result.protocol.canonicalUrl || "Missing Canonical Tag"}
                      </p>
                      <p className="text-muted-foreground">
                        {result.protocol.canonicalUrl ? "✓ Prevents duplicate content" : "⚠ Add <link rel=\"canonical\">"}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-2">
                      <span className="text-muted-foreground font-semibold">Compression &amp; MIME Type</span>
                      <p className="text-sm font-bold text-foreground capitalize">
                        {result.protocol.compression}
                      </p>
                      <p className="text-muted-foreground">Content-Type: {result.protocol.contentType}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-2">
                      <span className="text-muted-foreground font-semibold">Transport Security (TLS/HTTPS)</span>
                      <p className="text-base font-bold text-emerald-400">
                        {result.protocol.isHttps ? "Enforced HTTPS" : "Insecure HTTP"}
                      </p>
                      <p className="text-muted-foreground">Redirect Hops: {result.protocol.redirectHops}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: SISTER TOOL RECOMMENDATIONS */}
              {activeTab === "tools" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-secondary/20 border border-white/5">
                    <h4 className="text-sm font-bold text-foreground mb-1">
                      Cross-Tool Ecosystem Diagnostics
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Our suite of free developer tools inspects deeper cybersecurity, AI search, and CVE benchmarks for {result.domain}:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* AEO Scanner Card */}
                    <div className="p-5 rounded-2xl bg-secondary/30 border border-white/10 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] text-[11px] font-bold">
                          <Bot className="w-3.5 h-3.5" />
                          AEO &amp; GEO Readiness
                        </div>
                        <h5 className="text-base font-bold text-foreground">
                          AI Engine Optimization Audit
                        </h5>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Audit Schema.org JSON-LD entities, /llms.txt AI crawler accessibility, and robots.txt bot directives.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push(`/aeo-scanner?domain=${encodeURIComponent(result.domain)}`)}
                        className="w-full py-2.5 rounded-xl bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Launch AEO Scanner
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* CVE Scanner Card */}
                    <div className="p-5 rounded-2xl bg-secondary/30 border border-white/10 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[11px] font-bold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          CVE &amp; Zero-Day Check
                        </div>
                        <h5 className="text-base font-bold text-foreground">
                          MITRE &amp; NVD Vulnerability Scan
                        </h5>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Probe TLS certificate parameters, software library version CVEs, and NCSC UK Cyber Essentials compliance.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push(`/vulnerability-check?domain=${encodeURIComponent(result.domain)}`)}
                        className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Launch CVE Scanner
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* OWASP Scanner Card */}
                    <div className="p-5 rounded-2xl bg-secondary/30 border border-white/10 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[11px] font-bold">
                          <Lock className="w-3.5 h-3.5" />
                          2026 OWASP Top 10
                        </div>
                        <h5 className="text-base font-bold text-foreground">
                          OWASP Security Compliance Audit
                        </h5>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Audit Broken Access Control (A01), Cryptographic Failures (A02), Injection (A03), and SSRF (A10).
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push(`/owasp-check?domain=${encodeURIComponent(result.domain)}`)}
                        className="w-full py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Launch OWASP Audit
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: CODE FIXES */}
              {activeTab === "fixes" && (
                <div className="space-y-4">
                  {result.remediationSnippets.map((fix) => (
                    <div key={fix.id} className="p-5 rounded-xl bg-secondary/20 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {fix.category}
                          </span>
                          <h4 className="text-sm font-bold text-foreground mt-1">
                            {fix.title}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(fix.snippet, fix.id)}
                          className="px-3 py-1.5 rounded-lg bg-secondary/60 hover:bg-secondary border border-white/10 text-xs font-semibold text-foreground flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          {copiedSnippet === fix.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy Code
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {fix.explanation}
                      </p>
                      <pre className="p-3.5 rounded-lg bg-black/60 border border-white/10 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre">
                        {fix.snippet}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lead Generation CTA Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#00f0ff]/10 to-purple-500/10 border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6 mt-8">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Enterprise Technical SEO &amp; Web Engineering
                </span>
                <h4 className="text-lg font-bold text-foreground">
                  Need Full Site Crawling &amp; Architecture Remediation?
                </h4>
                <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                  Our UK engineering team builds bespoke high-performance web applications with automated CI/CD link linters, Next.js semantic rendering, Google Consent Mode v2 setup, and zero-defect accessibility compliance.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push(`/contact?service=web-health-audit&domain=${encodeURIComponent(result.domain)}`)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#7000ff] text-black font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-[#00f0ff]/20 shrink-0 cursor-pointer flex items-center gap-2"
              >
                Schedule Architecture Review
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
