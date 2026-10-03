"use client";

import { useState, useEffect } from "react";
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
    "overview" | "headings" | "forms" | "links" | "protocol" | "fixes" | "tools"
  >("overview");
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [quota, setQuota] = useState(DEFAULT_SCAN_QUOTA);
  const { executeRecaptcha } = useGoogleReCaptcha();

  useEffect(() => {
    setQuota(getScanQuota());
  }, []);

  const loadingSteps = [
    "Establishing TLS handshake & probing HTTP response status...",
    "Crawling page anchors, internal routes & external link health...",
    "Inspecting H1, H2, H3 hierarchy & document semantic structure...",
    "Auditing image alt attributes & media accessibility standards...",
    "Scanning interactive contact forms & reCAPTCHA / Turnstile defense...",
    "Checking Cookie Consent banner & Google Consent Mode v2 signals...",
    "Synthesising website health score & architectural recommendations...",
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
    }, 650);

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
      }
    } catch {
      clearInterval(stepInterval);
      setError("Network or scanner error occurred. Please check your internet connection.");
    } finally {
      setLoading(false);
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
              HTML5 Semantics, Link Health &amp; Protocol Inspector
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Website Health & Structure Audit
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Passive audit of H1–H3 headings, image alt attributes, contact forms, reCAPTCHA bot defense, cookie consent, dead links, and HTTP standards.
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
                Scanning Website Architecture & HTML Hygiene
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
                <p className="text-base font-bold text-foreground">
                  {result.cookieConsent.detected ? "Active CMP" : "Not Found"}
                </p>
                <span className={`text-[10px] font-semibold ${result.cookieConsent.detected ? "text-emerald-400" : "text-amber-400"}`}>
                  {result.cookieConsent.detected ? "✓ GDPR Ready" : "⚠ Missing Banner"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/20 border border-white/5 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  Link Hygiene
                </span>
                <p className="text-base font-bold text-foreground">
                  {result.metrics.totalLinks} Links
                </p>
                <span className={`text-[10px] font-semibold ${result.metrics.deadLinksCount === 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {result.metrics.deadLinksCount === 0 ? "✓ 0 Dead Links" : `✕ ${result.metrics.deadLinksCount} Broken`}
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

            {/* Slick Single-Line Navigation Tabs */}
            <div className="flex items-center gap-1 p-1 bg-secondary/40 border border-white/10 rounded-xl overflow-x-auto no-scrollbar">
              {[
                { id: "overview", label: "Overview", icon: Activity },
                { id: "headings", label: `Headings & Images`, icon: Heading },
                { id: "forms", label: `Forms & Security`, icon: ShieldCheck },
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
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#00f0ff] text-black shadow-md shadow-[#00f0ff]/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
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
                          Interactive Forms & Bot Defense
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

              {/* TAB 3: FORMS & PRIVACY */}
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

                  {/* Cookie Consent Details */}
                  <div className="p-5 rounded-xl bg-secondary/20 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Cookie className="w-4 h-4 text-amber-400" />
                        Cookie Consent & Privacy Framework
                      </span>
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${result.cookieConsent.detected ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                        {result.cookieConsent.detected ? "Compliant" : "Needs Review"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {result.cookieConsent.details}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: LINKS & ANCHORS */}
              {activeTab === "links" && (
                <div className="p-5 rounded-xl bg-secondary/20 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        Link Architecture & Sample Probes
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

              {/* TAB 5: HTTP & PROTOCOLS */}
              {activeTab === "protocol" && (
                <div className="p-5 rounded-xl bg-secondary/20 border border-white/5 space-y-4">
                  <h4 className="text-sm font-bold text-foreground">
                    HTTP Standards & Server Performance
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-2">
                      <span className="text-muted-foreground font-semibold">Response Status & Latency</span>
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
                      <span className="text-muted-foreground font-semibold">Compression & MIME Type</span>
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

              {/* TAB 6: SISTER TOOL RECOMMENDATIONS */}
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
                          AEO & GEO Readiness
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
                          CVE & Zero-Day Check
                        </div>
                        <h5 className="text-base font-bold text-foreground">
                          MITRE & NVD Vulnerability Scan
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

              {/* TAB 7: CODE FIXES */}
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
                  Enterprise Technical SEO & Web Engineering
                </span>
                <h4 className="text-lg font-bold text-foreground">
                  Need Full Site Crawling & Architecture Remediation?
                </h4>
                <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                  Our UK engineering team builds bespoke high-performance web applications with automated CI/CD link linters, Next.js semantic rendering, and zero-defect accessibility compliance.
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
