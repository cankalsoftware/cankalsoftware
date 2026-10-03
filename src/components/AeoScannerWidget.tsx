"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Bot,
  ExternalLink,
  Code2,
  FileCode,
  Lock,
} from "lucide-react";
import type { ScanResult } from "@/app/api/aeo-scan/route";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { getScanQuota, recordScanUsage, MAX_FREE_SCANS_PER_MONTH, DEFAULT_SCAN_QUOTA } from "@/lib/scanQuota";

export function AeoScannerWidget({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quota, setQuota] = useState(DEFAULT_SCAN_QUOTA);
  const { executeRecaptcha } = useGoogleReCaptcha();

  useEffect(() => {
    setQuota(getScanQuota());
  }, []);

  const loadingSteps = [
    "Connecting & fetching HTML markup...",
    "Parsing JSON-LD schemas & entity tags...",
    "Verifying /llms.txt specification...",
    "Auditing heading tree & AI parseability...",
    "Checking robots.txt AI bot crawler rules...",
    "Computing AEO / GEO Readiness Score...",
  ];

  const handleScan = async (e?: React.FormEvent, overrideUrl?: string) => {
    if (e) e.preventDefault();
    const target = (overrideUrl || url).trim();
    if (!target) {
      setError("Please enter a valid website URL.");
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
    }, 700);

    try {
      let token = "";
      if (executeRecaptcha) {
        try {
          token = await executeRecaptcha("aeo_scan");
        } catch {
          // Continue if recaptcha fails client-side
        }
      }

      const res = await fetch("/api/aeo-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target, recaptchaToken: token }),
      });

      const data = await res.json();
      clearInterval(stepInterval);

      if (!res.ok) {
        setError(data.error || "Failed to scan website. Please verify the URL and try again.");
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

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "B":
        return "bg-blue-500/20 text-blue-600 dark:text-[#00f0ff] border-blue-500/30";
      case "C":
        return "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30";
      default:
        return "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30";
    }
  };

  const getStatusIcon = (status: "pass" | "warning" | "fail") => {
    if (status === "pass") return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (status === "warning") return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <XCircle className="w-4 h-4 text-rose-500" />;
  };

  return (
    <div className="w-full">
      <div className="glass p-6 md:p-8 rounded-3xl border border-blue-500/20 dark:border-[#b52bff]/30 shadow-xl shadow-blue-500/5 relative overflow-hidden">
        {/* Background glow highlight */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-[#2563eb]/20 to-[#b52bff]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#00f0ff] flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">
                  AEO & LLM Search Readiness Scanner
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-[#2563eb] dark:text-[#00f0ff] border border-blue-500/20">
                  <Sparkles className="w-3 h-3" /> 2026 AI Search Standard
                </span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                Check how ChatGPT, Claude, and Perplexity parse your schemas, llms.txt, entities, and headings.
              </p>
            </div>
          </div>

          {/* Privacy badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>100% Privacy • No Data Saved</span>
          </div>
        </div>

        {/* URL Form */}
        <form onSubmit={handleScan} className="relative z-10 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter any website URL (e.g. example.com or https://mysite.com)"
                disabled={loading}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/60 dark:bg-black/40 border border-gray-200/80 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#2563eb] dark:focus:ring-[#00f0ff] text-sm md:text-base placeholder:text-muted-foreground/60 transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 rounded-2xl bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-gradient-to-r dark:from-[#b52bff] dark:to-[#00f0ff] dark:hover:opacity-90 text-white font-semibold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] dark:shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Audit</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick sample chips & Monthly Quota Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground mb-4 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">Try quick sample:</span>
            {["cankalsoftware.com", "firevision.uk", "openai.com", "wikipedia.org"].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setUrl(sample);
                  handleScan(undefined, sample);
                }}
                className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors border border-gray-200 dark:border-white/10 cursor-pointer text-xs"
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

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-3 mb-4"
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Scan Notice</p>
                <p className="text-xs opacity-90 mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Progress Animation */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-5 rounded-2xl bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 mb-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 border-2 border-[#2563eb] dark:border-[#00f0ff] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium text-[#2563eb] dark:text-[#00f0ff] animate-pulse">
                  {loadingSteps[loadingStep]}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-[#2563eb] via-[#b52bff] to-[#00f0ff] h-1.5"
                  initial={{ width: "10%" }}
                  animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Box */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 pt-6 border-t border-gray-200/60 dark:border-white/10"
            >
              {/* Score Header */}
              <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-white/[0.07] dark:to-white/[0.02] border border-gray-200/70 dark:border-white/10 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative flex items-center justify-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex flex-col items-center justify-center border border-blue-500/30">
                      <span className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] to-[#00f0ff]">
                        {result.overallScore}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        / 100
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getGradeBadge(result.grade)}`}>
                        Grade: {result.grade}
                      </span>
                      <span className="text-sm font-semibold truncate max-w-[200px] sm:max-w-none">
                        {result.domain}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground max-w-xl">
                      {result.verdict}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push(`/aeo-scanner?url=${encodeURIComponent(result.url)}`)}
                  className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#1e3a8a] dark:from-[#b52bff] dark:to-[#00f0ff] text-white text-xs md:text-sm font-semibold transition-all hover:opacity-95 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>View Full Implementation Guide</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {Object.entries(result.categories).map(([key, cat]) => (
                  <div
                    key={key}
                    className="p-4 rounded-xl glass border border-gray-200/50 dark:border-white/5 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-foreground">{cat.title}</span>
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(cat.status)}
                          <span className="text-xs font-mono font-bold">
                            {cat.score}/{cat.maxScore}
                          </span>
                          {cat.lostPoints > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              -{cat.lostPoints} pts
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mb-2 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            cat.status === "pass"
                              ? "bg-emerald-500"
                              : cat.status === "warning"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug">{cat.summary}</p>
                    </div>

                    {/* Itemized Measurements & Deductions */}
                    {cat.breakdown && cat.breakdown.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-gray-200/50 dark:border-white/5 text-[11px]">
                        {cat.breakdown.map((item, idx) => (
                          <div key={idx} className="flex flex-col gap-0.5">
                            <div className="flex items-center justify-between text-muted-foreground">
                              <span className="truncate pr-2 font-medium">
                                {item.passed ? "✓" : item.earned > 0 ? "⚠" : "✕"} {item.label}
                              </span>
                              <span className={`font-mono font-semibold shrink-0 ${item.passed ? "text-emerald-500 dark:text-emerald-400" : item.earned > 0 ? "text-amber-500" : "text-rose-500"}`}>
                                +{item.earned}/{item.max}
                              </span>
                            </div>
                            {item.lostReason && (
                              <p className="text-[10px] text-amber-600 dark:text-amber-400/90 pl-3">
                                ↳ {item.lostReason}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Lead Magnet CTA for Service */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-teal-500/10 border border-blue-500/20 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm md:text-base font-bold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#2563eb] dark:text-[#00f0ff]" />
                    Want us to implement complete AEO & AI Search Readiness for your site?
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    We deploy custom JSON-LD schemas, llms.txt, AI crawlers, and high-converting modern architecture.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/contact?subject=${encodeURIComponent(`AEO & AI Search Optimisation for ${result.domain}`)}`
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-xs md:text-sm font-semibold border border-gray-200 dark:border-white/20 transition-all whitespace-nowrap cursor-pointer"
                >
                  Get Expert Help & Consultation →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info strip */}
        {!result && !compact && (
          <div className="mt-4 pt-4 border-t border-gray-200/40 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-[#2563eb] dark:text-[#00f0ff]" /> Evaluates Schema &amp; Entities
              </span>
              <span className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#9333ea] dark:text-[#b52bff]" /> Checks /llms.txt Standard
              </span>
            </div>
            <button
              type="button"
              onClick={() => router.push("/aeo-scanner")}
              className="hover:text-foreground font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              Explore Full Scanner &amp; Free Guide <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
