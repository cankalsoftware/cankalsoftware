"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
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
  ChevronDown,
} from "lucide-react";
import type { OwaspScanResult, OwaspItem } from "@/app/api/owasp-scan/route";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { getScanQuota, recordScanUsage, MAX_FREE_SCANS_PER_MONTH, DEFAULT_SCAN_QUOTA } from "@/lib/scanQuota";

interface OwaspScannerWidgetProps {
  compact?: boolean;
  initialDomain?: string;
}

export function OwaspScannerWidget({
  compact = false,
  initialDomain = "",
}: OwaspScannerWidgetProps) {
  const router = useRouter();
  const [url, setUrl] = useState(initialDomain);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<OwaspScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"checklist" | "issues" | "passed" | "fixes">("checklist");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [quota, setQuota] = useState(DEFAULT_SCAN_QUOTA);
  const { executeRecaptcha } = useGoogleReCaptcha();

  useEffect(() => {
    setQuota(getScanQuota());
  }, []);

  const loadingSteps = [
    "Establishing TLS handshake & inspecting response headers...",
    "Evaluating A01: Broken Access Control & CORS whitelist...",
    "Auditing A02: Cryptographic Failures & HSTS preload rules...",
    "Inspecting A03: Content-Security-Policy & XSS protections...",
    "Probing A04: RFC 9116 security.txt & responsible disclosure...",
    "Scanning A05: Server banner & X-Powered-By misconfigurations...",
    "Checking A06: Outdated components, legacy jQuery & CMS CVEs...",
    "Auditing A07: Session cookie HttpOnly & SameSite flags...",
    "Evaluating A08: Subresource Integrity (SRI) on external CDNs...",
    "Probing A09: Security telemetry & A10: SSRF secret exposure...",
    "Synthesising 2026 OWASP Top 10 compliance score...",
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
          token = await executeRecaptcha("owasp_scan");
        } catch {
          // Continue gracefully if client recaptcha encounters an issue
        }
      }

      const res = await fetch("/api/owasp-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target, recaptchaToken: token }),
      });

      const data = await res.json();
      clearInterval(stepInterval);

      if (!res.ok) {
        setError(data.error || "Failed to audit website. Please verify the URL and try again.");
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
      case "D":
      case "F":
      default:
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
    }
  };

  const filteredItems = result?.checklist.filter((item) => {
    if (activeTab === "issues") return item.status === "fail" || item.status === "warning";
    if (activeTab === "passed") return item.status === "pass";
    return true;
  });

  return (
    <div className="w-full">
      <div className="glass p-6 md:p-8 rounded-3xl border border-blue-500/20 dark:border-[#b52bff]/30 shadow-2xl shadow-blue-500/5 relative overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-[#2563eb]/20 via-[#00f0ff]/10 to-[#b52bff]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-gradient-to-tr from-[#b52bff]/15 to-[#2563eb]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#00f0ff] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">
                  2026 OWASP Top 10 Vulnerability Audit
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 dark:bg-purple-500/20 text-[#2563eb] dark:text-[#00f0ff] border border-blue-500/20 dark:border-[#b52bff]/30">
                  <Sparkles className="w-3 h-3" /> 2026 Standard
                </span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                Passive analysis across all 10 OWASP risk categories with instant pass/fail validation &amp; fixes.
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar Input */}
        <form onSubmit={handleScan} className="relative z-10 space-y-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Enter domain or website URL (e.g. yoursite.com or https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-[#2563eb] dark:focus:border-[#00f0ff] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 dark:focus:ring-[#00f0ff]/20 text-sm transition-all placeholder:text-muted-foreground/60"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#2563eb] to-[#00f0ff] hover:opacity-90 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer min-w-[180px]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Auditing OWASP...</span>
                </>
              ) : (
                <>
                  <span>Run OWASP Check</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Quick domain test triggers & Monthly Quota badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">Try quick sample:</span>
              {["cankalsoftware.com", "github.com", "bbc.co.uk", "wordpress.org"].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setUrl(sample);
                    handleScan(undefined, sample);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors border border-black/5 dark:border-white/5 cursor-pointer text-xs"
                >
                  {sample}
                </button>
              ))}
            </div>
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-black/5 dark:border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{quota.remaining} of {MAX_FREE_SCANS_PER_MONTH} free monthly checks left</span>
            </span>
          </div>
        </form>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-3 mb-6 relative z-10"
          >
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Audit Notice</p>
              <p className="text-xs opacity-90 mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Animated Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 flex flex-col items-center justify-center text-center space-y-4 relative z-10"
          >
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#00f0ff] border-r-[#2563eb] border-b-transparent border-l-transparent animate-spin" />
              <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#2563eb] to-[#00f0ff] flex items-center justify-center text-white shadow-inner">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground">
                2026 OWASP Top 10 Evaluation in Progress
              </h4>
              <p className="text-xs text-[#2563eb] dark:text-[#00f0ff] font-mono mt-1 transition-all h-5">
                {loadingSteps[loadingStep]}
              </p>
            </div>
            <div className="w-64 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#2563eb] to-[#00f0ff]"
                initial={{ width: "10%" }}
                animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}

        {/* Results Presentation */}
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6 relative z-10"
          >
            {/* Top Score & Posture Summary Card */}
            <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-md">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Score & Grade */}
                <div className="lg:col-span-4 flex items-center gap-5 border-b lg:border-b-0 lg:border-r border-black/10 dark:border-white/10 pb-6 lg:pb-0 lg:pr-6">
                  <div
                    className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center border-2 shadow-lg ${getGradeBadge(
                      result.grade
                    )}`}
                  >
                    <span className="text-3xl font-black tracking-tight">{result.grade}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {result.overallScore} / 100
                    </span>
                  </div>
                  <div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider mb-1 border ${getGradeBadge(
                        result.grade
                      )}`}
                    >
                      {result.riskLevel}
                    </span>
                    <h4 className="text-lg font-bold text-foreground">{result.domain}</h4>
                    <p className="text-xs text-muted-foreground">
                      Audited {new Date(result.scannedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                {/* Verdict & Pass/Fail Metrics */}
                <div className="lg:col-span-8 space-y-3">
                  <p className="text-sm leading-relaxed text-foreground/90 font-medium">
                    {result.verdict}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {result.passedCount} of 10 Passed
                    </span>
                    {result.warningCount > 0 && (
                      <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {result.warningCount} Warnings
                      </span>
                    )}
                    {result.failedCount > 0 && (
                      <span className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1.5 font-bold">
                        <XCircle className="w-3.5 h-3.5" />
                        {result.failedCount} Critical Flaws
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs - Single-Line Slick Control Bar */}
            <div className="p-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shadow-inner">
              <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
                {/* 1. Complete OWASP Checklist */}
                <button
                  type="button"
                  onClick={() => setActiveTab("checklist")}
                  className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap border ${
                    activeTab === "checklist"
                      ? "bg-blue-500/15 text-blue-600 dark:text-[#00f0ff] border-blue-500/40 shadow-[0_0_15px_rgba(37,99,235,0.25)]"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>All 10 OWASP Risks ({result.checklist.length})</span>
                </button>

                {/* 2. Issues & Warnings */}
                <button
                  type="button"
                  onClick={() => setActiveTab("issues")}
                  className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap border ${
                    activeTab === "issues"
                      ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.25)]"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Vulnerabilities ({result.warningCount + result.failedCount})</span>
                </button>

                {/* 3. Passed Defences */}
                <button
                  type="button"
                  onClick={() => setActiveTab("passed")}
                  className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap border ${
                    activeTab === "passed"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Passed Defences ({result.passedCount})</span>
                </button>

                {/* Vertical Divider */}
                <div className="h-5 w-px bg-black/10 dark:bg-white/10 mx-1 shrink-0" />

                {/* 4. Remediation Blueprints */}
                <button
                  type="button"
                  onClick={() => setActiveTab("fixes")}
                  className={`px-3 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap border ${
                    activeTab === "fixes"
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <Code2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Remediation Blueprints</span>
                </button>
              </div>

              {/* Print / Export Action Button */}
              <div className="flex items-center pl-2 shrink-0 border-l border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap border border-black/5 dark:border-white/5"
                  title="Print or Export PDF Audit Report"
                >
                  <Printer className="w-3.5 h-3.5 text-foreground" />
                  <span className="hidden sm:inline">Export PDF</span>
                </button>
              </div>
            </div>

            {/* Connected Tab Content Panel */}
            <div
              className={`p-5 md:p-6 rounded-3xl bg-black/[0.02] dark:bg-white/[0.02] border-t-2 border border-black/10 dark:border-white/10 transition-all duration-300 relative ${
                activeTab === "issues"
                  ? "border-t-rose-500 shadow-[0_-6px_25px_rgba(244,63,94,0.12)]"
                  : activeTab === "passed"
                  ? "border-t-emerald-500 shadow-[0_-6px_25px_rgba(16,185,129,0.12)]"
                  : activeTab === "fixes"
                  ? "border-t-amber-500 shadow-[0_-6px_25px_rgba(245,158,11,0.12)]"
                  : "border-t-blue-500 shadow-[0_-6px_25px_rgba(37,99,235,0.12)]"
              }`}
            >
              {/* TAB: OWASP Checklist (All, Issues, Passed) */}
              {activeTab !== "fixes" && (
                <div className="space-y-4">
                  {filteredItems && filteredItems.length > 0 ? (
                    <div className="space-y-3">
                      {filteredItems.map((item) => {
                        const isExpanded = expandedItem === item.id;
                        return (
                          <div
                            key={item.id}
                            className={`p-5 rounded-2xl border transition-all space-y-3 ${
                              item.status === "pass"
                                ? "bg-emerald-500/5 border-emerald-500/20"
                                : item.status === "warning"
                                ? "bg-amber-500/5 border-amber-500/20"
                                : "bg-rose-500/5 border-rose-500/20"
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-1 ${
                                    item.status === "pass"
                                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                      : item.status === "warning"
                                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                      : "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30"
                                  }`}
                                >
                                  {item.status === "pass" ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5" /> PASSED ({item.score}/10)
                                    </>
                                  ) : item.status === "warning" ? (
                                    <>
                                      <AlertTriangle className="w-3.5 h-3.5" /> WARNING ({item.score}/10)
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3.5 h-3.5" /> FAILED ({item.score}/10)
                                    </>
                                  )}
                                </span>
                                <span className="font-mono text-xs font-bold text-muted-foreground bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded">
                                  {item.id}
                                </span>
                                {item.cvssScore && (
                                  <span className="text-xs font-bold text-rose-500 font-mono">
                                    CVSS {item.cvssScore}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs font-bold text-foreground">
                                {item.name}
                              </span>
                            </div>

                            <div>
                              <h5 className="text-sm font-bold text-foreground">{item.title}</h5>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {item.explanation}
                              </p>
                            </div>

                            {/* Impact & Remediation Blueprint */}
                            {item.status !== "pass" && item.impact && (
                              <div className="text-xs bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 rounded-xl p-3">
                                <span className="font-bold text-rose-600 dark:text-rose-400">Potential Threat Impact: </span>
                                <span className="text-muted-foreground">{item.impact}</span>
                              </div>
                            )}

                            <div className="text-xs bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 rounded-xl p-3 flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-[#2563eb] dark:text-[#00f0ff]">
                                  {item.status === "pass" ? "Active Defence: " : "Remediation Action: "}
                                </span>
                                <span className="text-muted-foreground">{item.remediation}</span>
                              </div>
                            </div>

                            {/* Expandable Code Fix & References */}
                            <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-black/5 dark:border-white/5">
                              <button
                                type="button"
                                onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                                className="text-xs text-[#2563eb] dark:text-[#00f0ff] font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                              >
                                <span>{isExpanded ? "Hide Code Fix Blueprint" : "View Code Fix & References"}</span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              </button>

                              {item.cwe && (
                                <span className="text-[11px] text-muted-foreground font-mono">
                                  {item.cwe}
                                </span>
                              )}
                            </div>

                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="space-y-3 pt-2"
                              >
                                {item.codeSnippet && (
                                  <div className="rounded-xl border border-black/10 dark:border-white/10 bg-black/40 overflow-hidden">
                                    <div className="flex items-center justify-between px-3 py-1.5 bg-black/60 border-b border-white/5">
                                      <span className="text-[11px] font-mono text-muted-foreground">Configuration Blueprint</span>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(item.codeSnippet!, item.id)}
                                        className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                                      >
                                        {copiedSnippet === item.id ? (
                                          <>
                                            <Check className="w-3 h-3 text-emerald-500" />
                                            <span className="text-emerald-500">Copied</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3 h-3" />
                                            <span>Copy Snippet</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <pre className="p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed">
                                      {item.codeSnippet}
                                    </pre>
                                  </div>
                                )}

                                {item.references && item.references.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-3 text-xs">
                                    <span className="text-muted-foreground text-[11px]">Authoritative Documentation:</span>
                                    {item.references.map((ref, rIdx) => (
                                      <a
                                        key={rIdx}
                                        href={ref.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#2563eb] dark:text-[#00f0ff] hover:underline flex items-center gap-1 text-xs font-medium"
                                      >
                                        {ref.name} <ExternalLink className="w-3 h-3" />
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <h5 className="text-sm font-bold">No issues found matching this filter</h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        All checks in this category are completely passed.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Remediation Blueprints */}
              {activeTab === "fixes" && (
                <div className="space-y-6">
                  {/* Nginx Blueprint */}
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden bg-black/5 dark:bg-[#070514]">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                      <span className="text-xs font-bold font-mono text-[#2563eb] dark:text-[#00f0ff]">
                        nginx.conf (Nginx Reverse Proxy &amp; Web Server)
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(result.remediationSnippets.nginxConfig, "nginx")}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSnippet === "nginx" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre leading-relaxed">
                      {result.remediationSnippets.nginxConfig}
                    </pre>
                  </div>

                  {/* Apache Blueprint */}
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden bg-black/5 dark:bg-[#070514]">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                      <span className="text-xs font-bold font-mono text-[#2563eb] dark:text-[#00f0ff]">
                        .htaccess (Apache HTTP Server)
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(result.remediationSnippets.apacheHtaccess, "apache")}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSnippet === "apache" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre leading-relaxed">
                      {result.remediationSnippets.apacheHtaccess}
                    </pre>
                  </div>

                  {/* Next.js Blueprint */}
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden bg-black/5 dark:bg-[#070514]">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                      <span className="text-xs font-bold font-mono text-[#2563eb] dark:text-[#00f0ff]">
                        next.config.ts (Next.js Application)
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(result.remediationSnippets.nextjsConfig, "nextjs")}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSnippet === "nextjs" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre leading-relaxed">
                      {result.remediationSnippets.nextjsConfig}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* High-Converting Remediation CTA Banner */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#2563eb]/20 via-[#b52bff]/20 to-[#00f0ff]/20 border border-blue-500/30 dark:border-[#b52bff]/40 backdrop-blur-xl relative overflow-hidden shadow-xl mt-8">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#00f0ff]/20 rounded-full blur-2xl pointer-events-none" />
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-[#2563eb] dark:text-[#00f0ff] text-xs font-bold uppercase tracking-wider border border-blue-500/30">
                    <Zap className="w-3.5 h-3.5" /> 2026 OWASP Top 10 Hardening &amp; Defence
                  </div>
                  <h4 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
                    Do you want Cankal Software to remediate these OWASP vulnerabilities?
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Our cyber engineers deploy custom Content Security Policies, fix CORS exposure, harden cookie flags, and lock down your infrastructure against modern OWASP exploits.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const query = new URLSearchParams({
                        domain: result.domain,
                        score: String(result.overallScore),
                        grade: result.grade,
                        issues: `${result.failedCount} OWASP vulnerabilities and ${result.warningCount} warnings detected`,
                      }).toString();
                      router.push(`/contact?${query}`);
                    }}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#2563eb] to-[#00f0ff] hover:opacity-90 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Request OWASP Remediation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
