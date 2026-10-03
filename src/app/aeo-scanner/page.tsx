"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  ShieldCheck,
  FileCode,
  Code2,
  Terminal,
  Lock,
  ArrowRight,
  ExternalLink,
  Layers,
  Globe2,
  HelpCircle,
  ChevronDown,
  RefreshCw,
  Cpu,
  Zap,
  BookOpen,
  Send,
} from "lucide-react";
import type { ScanResult } from "@/app/api/aeo-scan/route";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

function AeoScannerContent() {
  const searchParams = useSearchParams();
  const initialUrlParam = searchParams.get("url") || "";

  const [url, setUrl] = useState(initialUrlParam);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"recommendations" | "snippets" | "outline">("recommendations");
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const loadingSteps = [
    "Connecting to target server & parsing HTML DOM...",
    "Extracting JSON-LD semantic schemas & graph nodes...",
    "Querying /llms.txt and /llms-full.txt endpoints...",
    "Auditing H1-H6 heading hierarchy & document outline...",
    "Analysing robots.txt crawler permissions for AI engines...",
    "Synthesising AEO & GEO scoring metrics...",
  ];

  const handleScan = async (targetToScan?: string) => {
    const inputUrl = (targetToScan || url).trim();
    if (!inputUrl) {
      setError("Please enter a valid website URL to analyse.");
      return;
    }

    setError(null);
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
        body: JSON.stringify({ url: inputUrl, recaptchaToken: token }),
      });

      const data = await res.json();
      clearInterval(stepInterval);

      if (!res.ok) {
        setError(data.error || "Failed to scan website. Please verify the URL and try again.");
      } else {
        setResult(data);
      }
    } catch {
      clearInterval(stepInterval);
      setError("Network or scanner error occurred. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialUrlParam && !result && !loading) {
      handleScan(initialUrlParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrlParam]);

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(identifier);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return "from-emerald-500 to-teal-400 text-emerald-400";
      case "B":
        return "from-blue-500 to-cyan-400 text-blue-400";
      case "C":
        return "from-amber-500 to-yellow-400 text-amber-400";
      default:
        return "from-rose-500 to-pink-500 text-rose-400";
    }
  };

  const guideFaqs = [
    {
      q: "What is AEO (Answer Engine Optimisation) & GEO (Generative Engine Optimisation)?",
      a: "AEO is the practice of structuring web content so AI answer engines (like ChatGPT Search, Claude, and Perplexity) can directly cite and answer user questions with your brand. GEO focuses on training and generative synthesis optimisation, ensuring LLMs understand your entities, services, and authority.",
    },
    {
      q: "Why is traditional SEO no longer enough in 2026?",
      a: "Traditional SEO focused on keywords and backlinks for 10 blue links. Today, millions of queries are answered directly inside AI conversational interfaces without users clicking traditional search links. If your site lacks semantic schemas and llms.txt, AI engines cannot reliably cite your business.",
    },
    {
      q: "What is the /llms.txt standard?",
      a: "Inspired by robots.txt, /llms.txt is a standardised plain text/markdown file located at the root of a domain. It provides AI agents, scrapers, and LLMs with a clean, concise, structured summary of your company, services, and authoritative links without noise or bloated HTML.",
    },
    {
      q: "How does Cankal Software help my business with AEO?",
      a: "We perform full-stack architectural upgrades: injecting verified JSON-LD knowledge graphs, deploying custom llms.txt specifications, re-engineering heading structures for semantic chunking, and optimising AI crawler permissions. We handle everything end-to-end.",
    },
    {
      q: "Do you store or track the URLs that are scanned on this page?",
      a: "No. We have a strict zero-data retention policy for this tool. All audits are processed entirely in memory in real time. We do not store URLs, website contents, or audit scores in any database.",
    },
  ];

  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Header & Hero */}
      <section className="text-center max-w-4xl mx-auto pt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 border border-[#2563eb]/30 dark:border-[#b52bff]/30 text-xs md:text-sm font-medium">
            <Sparkles className="w-4 h-4 text-[#2563eb] dark:text-[#00f0ff]" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] to-[#1e3a8a] dark:from-[#b52bff] dark:to-[#00f0ff]">
              AEO &amp; GEO Diagnostic Tool • 2026 Edition
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            AEO &amp; LLM Search{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] to-[#1e3a8a] dark:from-[#b52bff] dark:to-[#00f0ff]">
              Readiness Scanner
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Audit whether your website can be indexed, understood, and cited by <strong>ChatGPT</strong>, <strong>Claude</strong>, and <strong>Perplexity</strong>.
          </p>

          {/* Privacy Guarantee Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs md:text-sm font-medium mb-10 shadow-sm">
            <Lock className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>100% Privacy-First:</strong> We do not save or log your data. Scans run on-the-fly purely for your diagnostic benefit.
            </span>
          </div>
        </motion.div>

        {/* URL Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass p-4 md:p-6 rounded-3xl border border-blue-500/30 dark:border-[#b52bff]/30 shadow-2xl relative"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleScan();
            }}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter your website URL (e.g. example.com or https://yoursite.com)"
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white/70 dark:bg-black/50 border border-gray-200 dark:border-white/15 focus:outline-none focus:ring-2 focus:ring-[#2563eb] dark:focus:ring-[#00f0ff] text-base placeholder:text-muted-foreground/60 transition-all shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 rounded-2xl bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-gradient-to-r dark:from-[#b52bff] dark:to-[#00f0ff] dark:hover:opacity-90 text-white font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] dark:shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Scanning...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Analyse Website</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Preset Samples */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
            <span>Quick test examples:</span>
            {["cankalsoftware.com", "firevision.uk", "openai.com", "github.com"].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setUrl(sample);
                  handleScan(sample);
                }}
                className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors border border-gray-200 dark:border-white/10 cursor-pointer"
              >
                {sample}
              </button>
            ))}
          </div>

          {/* Error Notice */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-3 text-left"
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Scan Notice</p>
                  <p className="text-xs opacity-90 mt-0.5">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Animation */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-6 rounded-2xl bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 border-2 border-[#2563eb] dark:border-[#00f0ff] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-semibold text-[#2563eb] dark:text-[#00f0ff] animate-pulse">
                    {loadingSteps[loadingStep]}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-[#2563eb] via-[#b52bff] to-[#00f0ff] h-2"
                    initial={{ width: "10%" }}
                    animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Results Dashboard Section */}
      <AnimatePresence>
        {result && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-6xl mx-auto"
          >
            {/* Main Score Hero Card */}
            <div className="glass p-8 md:p-10 rounded-3xl border border-blue-500/30 dark:border-[#b52bff]/30 mb-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#2563eb]/10 via-[#b52bff]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                {/* Score Circle & Grade */}
                <div className="flex items-center gap-6">
                  <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-white/90 to-white/40 dark:from-white/10 dark:to-white/5 border border-gray-200 dark:border-white/15 flex flex-col items-center justify-center shadow-xl">
                    <span className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] via-[#9333ea] to-[#00f0ff]">
                      {result.overallScore}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">
                      Score / 100
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-base font-extrabold px-3 py-1 rounded-xl border bg-gradient-to-r ${getGradeColor(result.grade)} bg-opacity-10 border-current/30`}>
                        Grade: {result.grade}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {new Date(result.scannedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                      {result.domain}
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground max-w-xl">
                      {result.verdict}
                    </p>
                  </div>
                </div>

                {/* Quick Action Button */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <button
                    type="button"
                    onClick={() => handleScan()}
                    className="px-5 py-3 rounded-xl glass glass-hover text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" /> Re-scan
                  </button>
                  <Link
                    href={`/contact?subject=${encodeURIComponent(`AEO & AI Search Implementation for ${result.domain}`)}`}
                    className="px-6 py-3 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-gradient-to-r dark:from-[#b52bff] dark:to-[#00f0ff] text-white text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Fix With Cankal Software</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* 5 Core Pillars Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8 pt-8 border-t border-gray-200 dark:border-white/10">
                {Object.entries(result.categories).map(([key, cat]) => {
                  const statusBorder =
                    cat.status === "pass"
                      ? "border-emerald-500/30"
                      : cat.status === "warning"
                      ? "border-amber-500/30"
                      : "border-rose-500/30";
                  const statusBg =
                    cat.status === "pass"
                      ? "bg-emerald-500"
                      : cat.status === "warning"
                      ? "bg-amber-500"
                      : "bg-rose-500";

                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-2xl glass border ${statusBorder} flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-bold truncate">{cat.title}</span>
                          <span className="text-xs font-mono font-bold">
                            {cat.score}/{cat.maxScore}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mb-3 overflow-hidden">
                          <div className={`h-1.5 rounded-full ${statusBg}`} style={{ width: `${cat.percentage}%` }} />
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        {cat.summary}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Tabs */}
            <div className="flex border-b border-gray-200 dark:border-white/10 mb-8 gap-4 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("recommendations")}
                className={`pb-3 text-sm md:text-base font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  activeTab === "recommendations"
                    ? "border-[#2563eb] text-[#2563eb] dark:border-[#00f0ff] dark:text-[#00f0ff]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Audit Findings &amp; Solutions ({result.recommendations.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("snippets")}
                className={`pb-3 text-sm md:text-base font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  activeTab === "snippets"
                    ? "border-[#2563eb] text-[#2563eb] dark:border-[#00f0ff] dark:text-[#00f0ff]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>Ready-to-Deploy Code Fixes</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("outline")}
                className={`pb-3 text-sm md:text-base font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  activeTab === "outline"
                    ? "border-[#2563eb] text-[#2563eb] dark:border-[#00f0ff] dark:text-[#00f0ff]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Heading &amp; Schema Inspector</span>
              </button>
            </div>

            {/* Tab 1: Recommendations */}
            {activeTab === "recommendations" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 mb-12"
              >
                {result.recommendations.map((rec, idx) => {
                  const isPass = rec.severity === "pass";
                  const isCrit = rec.severity === "critical";
                  const isWarn = rec.severity === "warning";

                  const badgeClass = isPass
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : isCrit
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                    : isWarn
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    : "bg-blue-500/10 text-blue-600 dark:text-[#00f0ff] border-blue-500/20";

                  const icon = isPass ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  ) : isCrit ? (
                    <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  );

                  return (
                    <div
                      key={idx}
                      className="glass p-6 rounded-2xl border border-gray-200/70 dark:border-white/10 flex flex-col gap-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          {icon}
                          <h3 className="text-base md:text-lg font-bold">{rec.title}</h3>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                          {rec.category}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed pl-8">
                        {rec.description}
                      </p>

                      {rec.codeSnippet && (
                        <div className="mt-3 pl-8">
                          <div className="flex items-center justify-between px-4 py-2 bg-gray-900 text-gray-300 rounded-t-xl text-xs font-mono">
                            <span>Recommended Fix ({rec.codeSnippetLanguage || "code"})</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(rec.codeSnippet!, `rec-${idx}`)}
                              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                            >
                              {copiedSnippet === `rec-${idx}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-4 bg-gray-950 text-gray-100 rounded-b-xl text-xs font-mono overflow-x-auto border border-gray-800">
                            {rec.codeSnippet}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* Tab 2: Ready-to-Deploy Code Snippets */}
            {activeTab === "snippets" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8 mb-12"
              >
                {/* 1. llms.txt */}
                <div className="glass p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <FileCode className="w-5 h-5 text-[#2563eb] dark:text-[#00f0ff]" />
                        1. Tailored /llms.txt File
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Save this file as <code>public/llms.txt</code> (or root <code>/llms.txt</code>) on your web server.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.generatedSnippets.llmsTxt, "llmsTxt")}
                      className="px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-[#2563eb] dark:text-[#00f0ff] border border-blue-500/30 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      {copiedSnippet === "llmsTxt" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedSnippet === "llmsTxt" ? "Copied to Clipboard!" : "Copy llms.txt"}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-gray-950 text-gray-100 text-xs font-mono overflow-x-auto border border-gray-800 leading-relaxed">
                    {result.generatedSnippets.llmsTxt}
                  </pre>
                </div>

                {/* 2. JSON-LD Schema */}
                <div className="glass p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-[#9333ea] dark:text-[#b52bff]" />
                        2. JSON-LD Organization &amp; WebSite Schema
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Place this script tag inside your HTML <code>&lt;head&gt;</code> or Next.js Root Layout.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.generatedSnippets.jsonLdSchema, "schema")}
                      className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-[#9333ea] dark:text-[#b52bff] border border-purple-500/30 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      {copiedSnippet === "schema" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedSnippet === "schema" ? "Copied to Clipboard!" : "Copy Schema Code"}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-gray-950 text-gray-100 text-xs font-mono overflow-x-auto border border-gray-800 leading-relaxed">
                    {result.generatedSnippets.jsonLdSchema}
                  </pre>
                </div>

                {/* 3. robots.txt */}
                <div className="glass p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Bot className="w-5 h-5 text-emerald-500" />
                        3. AI Bot-Friendly robots.txt Configuration
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ensures GPTBot, ClaudeBot, PerplexityBot, and Google-Extended can index and synthesize your updates.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.generatedSnippets.robotsTxt, "robots")}
                      className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      {copiedSnippet === "robots" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedSnippet === "robots" ? "Copied to Clipboard!" : "Copy robots.txt"}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-gray-950 text-gray-100 text-xs font-mono overflow-x-auto border border-gray-800 leading-relaxed">
                    {result.generatedSnippets.robotsTxt}
                  </pre>
                </div>
              </motion.div>
            )}

            {/* Tab 3: Outline & Detected Entities */}
            {activeTab === "outline" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
              >
                {/* Detected Schemas */}
                <div className="glass p-6 rounded-3xl border border-gray-200 dark:border-white/10">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-[#2563eb] dark:text-[#00f0ff]" />
                    Detected JSON-LD Schemas ({result.details.schemasDetected.length})
                  </h3>
                  {result.details.schemasDetected.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No JSON-LD schemas detected on this page. Consider adding Organization and FAQPage schemas.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {result.details.schemasDetected.map((sch, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-white/50 dark:bg-black/30 border border-gray-200 dark:border-white/10 text-xs flex items-center justify-between"
                        >
                          <span className="font-mono font-semibold text-[#2563eb] dark:text-[#00f0ff]">
                            @{sch.type}
                          </span>
                          <span className="text-emerald-500 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Valid JSON
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Heading Outline */}
                <div className="glass p-6 rounded-3xl border border-gray-200 dark:border-white/10">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#9333ea] dark:text-[#b52bff]" />
                    Heading Structure ({result.details.headingsOutline.length} Headings)
                  </h3>
                  {result.details.headingsOutline.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No headings found in the extracted HTML.</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                      {result.details.headingsOutline.map((h, i) => (
                        <div
                          key={i}
                          className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                            h.tag === "h1"
                              ? "bg-blue-500/10 border-blue-500/30 font-bold text-[#2563eb] dark:text-[#00f0ff]"
                              : h.tag === "h2"
                              ? "bg-purple-500/10 border-purple-500/20 font-semibold"
                              : "bg-white/40 dark:bg-black/20 border-gray-200 dark:border-white/5 text-muted-foreground"
                          }`}
                        >
                          <span className="uppercase font-mono px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[10px]">
                            {h.tag}
                          </span>
                          <span className="truncate">{h.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* "We Build It For You" Conversion Card */}
            <div className="glass p-8 md:p-12 rounded-3xl border border-blue-500/40 dark:border-[#00f0ff]/40 shadow-2xl bg-gradient-to-br from-[#2563eb]/10 via-[#9333ea]/10 to-teal-500/10 mb-16 text-center relative overflow-hidden">
              <div className="max-w-3xl mx-auto relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#00f0ff] flex items-center justify-center text-white mx-auto mb-6 shadow-lg">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                  Unsure How to Implement AEO &amp; AI Search Features?
                </h2>
                <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
                  Let <strong>Cankal Software &amp; IT Consultancy Ltd.</strong> handle the entire engineering process for you. We inject multi-node JSON-LD knowledge graphs, create tailored <code>llms.txt</code> files, structure heading hierarchies, and ensure your business ranks at the top of <strong>ChatGPT, Claude, and Perplexity</strong> search results.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href={`/contact?subject=${encodeURIComponent(`AEO & AI Search Readiness Service for ${result.domain}`)}`}
                    className="px-8 py-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-gradient-to-r dark:from-[#b52bff] dark:to-[#00f0ff] text-white font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] dark:shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    <span>Let Us Do The Work For You</span>
                  </Link>
                  <Link
                    href="/about"
                    className="px-8 py-4 rounded-xl glass glass-hover font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <span>Our Technical Track Record</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Comprehensive Implementation Guide Section */}
      <section className="max-w-5xl mx-auto w-full pt-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-[#2563eb] dark:text-[#00f0ff] text-xs font-bold uppercase tracking-wider mb-3">
            <BookOpen className="w-4 h-4" /> Technical Reference Guide
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold">
            How to Implement AEO &amp; GEO for 2026 AI Search
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-3 text-base md:text-lg">
            A comprehensive, actionable engineering guide to ensuring your website is discovered, cited, and recommended by modern AI engines.
          </p>
        </div>

        {/* 5 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Pillar 1 */}
          <div className="glass p-8 rounded-3xl border border-gray-200 dark:border-white/10 hover:border-blue-500/40 transition-all flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-[#2563eb] dark:text-[#00f0ff] flex items-center justify-center mb-5">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">1. Semantic Schema Markup (JSON-LD)</h3>
            <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
              AI engines don't just read visual text; they construct internal Knowledge Graphs. By embedding structured JSON-LD schemas (<code>Organization</code>, <code>LocalBusiness</code>, <code>FAQPage</code>, <code>Product</code>), you explicitly declare your company name, verified services, leadership, and geographic service areas without ambiguity.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="glass p-8 rounded-3xl border border-gray-200 dark:border-white/10 hover:border-purple-500/40 transition-all flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-[#9333ea] dark:text-[#b52bff] flex items-center justify-center mb-5">
              <FileCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">2. The /llms.txt Standard</h3>
            <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
              Created for the generative AI era, <code>/llms.txt</code> provides a concise markdown summary of your site's core purpose and key URLs. LLM scrapers prioritise this file to grasp your company's value proposition in single-digit tokens instead of scraping megabytes of complex JavaScript.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="glass p-8 rounded-3xl border border-gray-200 dark:border-white/10 hover:border-teal-500/40 transition-all flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-5">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">3. Strict Heading Hierarchies</h3>
            <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
              AI agents break web pages into semantic chunks during retrieval (RAG). Having exactly one clear <code>&lt;h1&gt;</code> topic title and strictly ordered <code>&lt;h2&gt;</code> and <code>&lt;h3&gt;</code> sections allows AI models to cleanly extract answers without hallucinating context from unrelated blocks.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="glass p-8 rounded-3xl border border-gray-200 dark:border-white/10 hover:border-emerald-500/40 transition-all flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">4. AI Bot Crawler Access</h3>
            <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
              Ensure your <code>robots.txt</code> permits major AI search agents: <code>GPTBot</code> (OpenAI / ChatGPT), <code>ClaudeBot</code> (Anthropic), <code>PerplexityBot</code>, and <code>Google-Extended</code>. Blocking these user agents will render your brand invisible in conversational search results.
            </p>
          </div>
        </div>

        {/* CLI & Developer Automation */}
        <div className="glass p-8 md:p-10 rounded-3xl border border-gray-200 dark:border-white/10 mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-900 text-gray-200 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">CLI &amp; CI/CD Automated Auditing</h3>
              <p className="text-xs text-muted-foreground">
                Integrate AEO scans into your deployment pipelines or terminal workflows.
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            You can trigger an automated audit against our lightweight endpoint via cURL or any standard HTTP client:
          </p>
          <div className="relative">
            <pre className="p-4 rounded-2xl bg-gray-950 text-gray-100 text-xs font-mono overflow-x-auto border border-gray-800">
{`# Run AEO Diagnostic Scan via cURL
curl -X POST https://cankalsoftware.com/api/aeo-scan \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://yourwebsite.com"}'`}
            </pre>
            <button
              type="button"
              onClick={() =>
                copyToClipboard(
                  `curl -X POST https://cankalsoftware.com/api/aeo-scan -H "Content-Type: application/json" -d '{"url": "https://yourwebsite.com"}'`,
                  "curl"
                )
              }
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-gray-200 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              {copiedSnippet === "curl" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSnippet === "curl" ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {guideFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="glass rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-semibold text-base md:text-lg cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed border-t border-gray-200/50 dark:border-white/5 pt-4"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="text-center p-10 rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-teal-500/10 border border-blue-500/30 dark:border-[#b52bff]/30">
          <h3 className="text-2xl md:text-4xl font-extrabold mb-3">
            Ready to Dominate AI Search Engines?
          </h3>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto mb-6">
            Get in touch with Cankal Software today to audit, rebuild, or optimise your web presence for the generative AI era.
          </p>
          <Link
            href="/contact?subject=AEO & AI Search Readiness Strategy"
            className="inline-flex px-8 py-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-gradient-to-r dark:from-[#b52bff] dark:to-[#00f0ff] dark:hover:opacity-90 text-white font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] dark:shadow-[0_0_20px_rgba(0,240,255,0.4)] items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" /> Start Your AEO Transformation
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function AeoScannerPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-[#2563eb] dark:border-[#00f0ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading AI Scanner Suite...</p>
        </div>
      }
    >
      <AeoScannerContent />
    </Suspense>
  );
}
