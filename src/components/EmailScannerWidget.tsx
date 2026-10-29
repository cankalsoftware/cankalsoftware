"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  UploadCloud,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Zap,
  Server,
  Globe2,
  Mail,
  Paperclip,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileCode,
  Radio,
  FileCheck2,
} from "lucide-react";
import type { EmailAnalysisResult } from "@/lib/email-analysis";

export function EmailScannerWidget() {
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<EmailAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "verdict" | "forensics" | "domain" | "content" | "links" | "guide" | "cta"
  >("verdict");
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [defangedView, setDefangedView] = useState(true);
  const [rawInspectorOpen, setRawInspectorOpen] = useState(true);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingSteps = [
    "Parsing message format (.msg / .eml / RFC 822)...",
    "Extracting transport headers & tracing chronological MTA hops...",
    "Validating SPF, DKIM cryptographic keys & DMARC alignment...",
    "Querying DNS for sender MX records & infrastructure fingerprint...",
    "Scanning content for urgency triggers, homoglyphs & dangerous attachments...",
    "Unmasking URL shorteners, checking redirects & sandboxing links...",
    "Synthesizing threat posture score & generating forensic verdict...",
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const runAnalysis = async (options?: { isSample?: boolean; sampleType?: string }) => {
    setError(null);
    setLoading(true);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 900);

    try {
      let res: Response;

      if (options?.isSample) {
        res = await fetch("/api/email-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sample: options.sampleType || "phishing" }),
        });
      } else if (inputMode === "upload") {
        if (!file) {
          setError("Please select or drop an email file (.msg or .eml).");
          clearInterval(stepInterval);
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", file);
        res = await fetch("/api/email-analysis", {
          method: "POST",
          body: formData,
        });
      } else {
        if (!rawText.trim()) {
          setError("Please paste raw email headers or RFC 822 content.");
          clearInterval(stepInterval);
          setLoading(false);
          return;
        }

        res = await fetch("/api/email-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawContent: rawText }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      setResult(data);
      setActiveTab("verdict");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to analyze email.";
      setError(msg);
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, isLink = false, linkId = "") => {
    navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLink(linkId);
      setTimeout(() => setCopiedLink(null), 2000);
    } else {
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* 1. Ingestion Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 sm:p-10 border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-red-500/10 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)]/60 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-500/10 text-red-600 dark:text-rose-400 border border-red-500/20 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> PHISHING FORENSICS
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-500/10 opacity-70 border border-slate-500/20">
                  Privacy-First (In-Memory Only)
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Inspect Suspicious Email &amp; Stripped Headers
              </h2>
              <p className="text-sm opacity-75 mt-1 max-w-2xl">
                Upload an Outlook message (<code className="font-mono text-xs px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">.msg</code>), standard MIME email (<code className="font-mono text-xs px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">.eml</code>), or paste raw transport headers for instant threat analysis.
              </p>
            </div>

            {/* Quick Demo Button */}
            <button
              onClick={() => runAnalysis({ isSample: true, sampleType: "phishing" })}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-rose-400 border border-red-500/30 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Load Phishing Sample Demo
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex gap-2 p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl w-fit border border-[var(--border)]">
            <button
              onClick={() => {
                setInputMode("upload");
                setError(null);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                inputMode === "upload"
                  ? "bg-white dark:bg-slate-800 text-[#2563eb] dark:text-[#00f0ff] shadow-md"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              Upload .msg / .eml File
            </button>
            <button
              onClick={() => {
                setInputMode("paste");
                setError(null);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                inputMode === "paste"
                  ? "bg-white dark:bg-slate-800 text-[#2563eb] dark:text-[#00f0ff] shadow-md"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <FileCode className="w-4 h-4" />
              Paste Raw Headers / MIME
            </button>
          </div>

          {/* Input Area */}
          {inputMode === "upload" ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
                dragOver
                  ? "border-[#2563eb] dark:border-[#00f0ff] bg-blue-500/10 scale-[1.01]"
                  : file
                  ? "border-emerald-500/60 bg-emerald-500/5"
                  : "border-[var(--border)] hover:border-slate-400 dark:hover:border-slate-600 bg-black/5 dark:bg-white/5"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".msg,.eml,.txt,message/rfc822"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform ${
                  file
                    ? "bg-emerald-500/20 text-emerald-500"
                    : "bg-blue-500/10 dark:bg-purple-500/10 text-[#2563eb] dark:text-[#00f0ff]"
                }`}
              >
                {file ? <FileCheck2 className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
              </div>

              <div>
                {file ? (
                  <div className="space-y-1">
                    <p className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                      {file.name}
                    </p>
                    <p className="text-xs opacity-60">
                      {(file.size / 1024).toFixed(1)} KB • Click or drop another file to replace
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-bold text-base">
                      Drag &amp; drop your <span className="text-[#2563eb] dark:text-[#00f0ff]">.msg</span> or{" "}
                      <span className="text-[#2563eb] dark:text-[#00f0ff]">.eml</span> file here
                    </p>
                    <p className="text-xs opacity-60">
                      Or click to browse from your device (Max size: 10MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-75 flex items-center justify-between">
                <span>Raw Email Transport Headers / MIME Payload</span>
                <span className="font-normal opacity-70">RFC 822 / RFC 5322 Format</span>
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste raw email headers starting with 'Received:', 'From:', 'Subject:' or complete MIME content here..."
                rows={7}
                className="w-full font-mono text-xs p-4 rounded-2xl bg-black/10 dark:bg-slate-900 border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[#2563eb] dark:focus:ring-[#00f0ff] transition-all resize-y"
              />
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs opacity-65 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Zero-Storage Policy: Email contents are decoded in RAM and never stored on disk.</span>
            </div>

            <button
              onClick={() => runAnalysis()}
              disabled={loading || (inputMode === "upload" && !file) || (inputMode === "paste" && !rawText.trim())}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#2563eb] to-[#7c3aed] dark:from-[#00f0ff] dark:to-[#b52bff] text-white dark:text-black shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Threat Telemetry...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Analyze Email Security</span>
                </>
              )}
            </button>
          </div>

          {/* Loading Progress State */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)] space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-[#2563eb] dark:text-[#00f0ff]">
                    <Radio className="w-4 h-4 animate-pulse" />
                    Deep Phishing Forensics Engine Active
                  </span>
                  <span className="opacity-70 font-mono">
                    Step {loadingStep + 1} of {loadingSteps.length}
                  </span>
                </div>
                <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] dark:from-[#00f0ff] dark:to-[#b52bff]"
                    initial={{ width: "10%" }}
                    animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs opacity-80 font-mono italic">
                  {loadingSteps[loadingStep]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-rose-400 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Analysis Could Not Complete</p>
                <p className="text-xs opacity-90 mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* 2. Results Section */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* STAGE 2: Raw Email Inspector (Text Box) */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)]/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg flex items-center gap-2">
                    Raw Email Inspector &amp; Stripped Headers
                    <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 opacity-70">
                      {result.fileType.toUpperCase()}
                    </span>
                  </h3>
                  <p className="text-xs opacity-70">
                    Decoded transport headers, MIME boundaries, and unformatted message body
                  </p>
                </div>
              </div>

              {/* Toolbar Controls */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setDefangedView(!defangedView)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                    defangedView
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-black/5 dark:bg-white/5 border-[var(--border)] opacity-70"
                  }`}
                  title="Neutralize clickable URLs to prevent accidental clicks"
                >
                  {defangedView ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{defangedView ? "Defanged Mode (Safe)" : "Original Text"}</span>
                </button>

                <button
                  onClick={() => copyToClipboard(result.rawEmailContent)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-[var(--border)] bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRaw ? "Copied!" : "Copy Raw Content"}</span>
                </button>

                <button
                  onClick={() => setRawInspectorOpen(!rawInspectorOpen)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-[var(--border)] bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-all cursor-pointer"
                >
                  {rawInspectorOpen ? "Collapse" : "Expand"}
                </button>
              </div>
            </div>

            {rawInspectorOpen && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                  <span>Source: {result.fileName || "message_payload.eml"}</span>
                  <span>{result.rawEmailContent.length} characters</span>
                </div>
                <pre className="font-mono text-xs p-4 text-emerald-400 overflow-x-auto max-h-72 overflow-y-auto selection:bg-emerald-900 selection:text-white leading-relaxed">
                  {defangedView
                    ? result.rawEmailContent
                        .replace(/https?:\/\//gi, (m) => (m.toLowerCase().startsWith("https") ? "hxxps://" : "hxxp://"))
                        .replace(/\.([a-z]{2,})/gi, "[.]$1")
                    : result.rawEmailContent}
                </pre>
              </div>
            )}
          </div>

          {/* STAGE 3: Tabbed Breakdown of Phishing Features */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-xl p-6 sm:p-8 shadow-xl space-y-6">
            {/* Horizontal Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--border)]/60 scrollbar-none">
              {[
                { id: "verdict", label: "🛡️ Executive Verdict", badge: `${result.overallScore}/100` },
                { id: "forensics", label: "🔍 Sender & Server Forensics", badge: `${result.headerForensics.hops.length} Hops` },
                { id: "domain", label: "🏢 Domain & Mailbox Intelligence", badge: result.domainIntelligence.mxStatus.toUpperCase() },
                { id: "content", label: "📝 Content & Attachments", badge: `${result.contentAudit.attachments.length} Files` },
                { id: "links", label: "🔗 Link Unmasker & Sandbox", badge: `${result.links.length} Links` },
                { id: "guide", label: "📘 Non-Tech Dummy Guide", badge: "Help" },
                { id: "cta", label: "🚨 Cybersecurity CTA", badge: "Services" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-[#2563eb] to-[#7c3aed] dark:from-[#00f0ff] dark:to-[#b52bff] text-white dark:text-black shadow-md"
                      : "bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100 border border-[var(--border)]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      activeTab === tab.id
                        ? "bg-black/20 dark:bg-black/30 text-white dark:text-black"
                        : "bg-black/10 dark:bg-white/10"
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              ))}
            </div>

            {/* TAB 1: Executive Verdict */}
            {activeTab === "verdict" && (
              <div className="space-y-6">
                {/* Master Verdict Banner */}
                <div
                  className={`p-6 sm:p-8 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                    result.verdictColor === "red"
                      ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-rose-400"
                      : result.verdictColor === "amber"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                        result.verdictColor === "red"
                          ? "bg-red-500/20"
                          : result.verdictColor === "amber"
                          ? "bg-amber-500/20"
                          : "bg-emerald-500/20"
                      }`}
                    >
                      {result.verdictColor === "red" ? (
                        <ShieldAlert className="w-8 h-8" />
                      ) : result.verdictColor === "amber" ? (
                        <AlertTriangle className="w-8 h-8" />
                      ) : (
                        <ShieldCheck className="w-8 h-8" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold tracking-wider uppercase opacity-80">
                        AUTOMATED FORENSIC CONCLUSION
                      </span>
                      <h4 className="text-2xl font-black">{result.verdict}</h4>
                      <p className="text-sm opacity-90 max-w-xl">{result.verdictSummary}</p>
                    </div>
                  </div>

                  {/* Threat Score Dial */}
                  <div className="flex items-center gap-6 self-start md:self-auto border-t md:border-t-0 md:border-l border-current/20 pt-4 md:pt-0 md:pl-8">
                    <div className="text-center">
                      <div className="text-4xl font-black font-mono tracking-tight">
                        {result.overallScore}
                        <span className="text-base font-normal opacity-60">/100</span>
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">
                        Threat Score
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 text-xs font-mono">
                      <span className="text-red-500 font-bold flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                        {result.redFlagCount} Critical Red Flags
                      </span>
                      <span className="text-amber-500 font-bold flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                        {result.amberFlagCount} Amber Warnings
                      </span>
                      <span className="text-emerald-500 font-bold flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                        {result.greenFlagCount} Passed Checks
                      </span>
                    </div>
                  </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)] space-y-1">
                    <span className="text-xs font-bold uppercase opacity-60">Sender Address</span>
                    <p className="text-sm font-mono font-bold truncate">
                      {result.headerForensics.from.address}
                    </p>
                    <p className="text-xs opacity-75 truncate">
                      Display: {result.headerForensics.from.name || "None"}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)] space-y-1">
                    <span className="text-xs font-bold uppercase opacity-60">Originating Server</span>
                    <p className="text-sm font-mono font-bold truncate">
                      {result.headerForensics.originatingMta?.ip || "Unknown IP"}
                    </p>
                    <p className="text-xs opacity-75 truncate">
                      PTR: {result.headerForensics.originatingMta?.reverseDns || "No PTR"}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)] space-y-1">
                    <span className="text-xs font-bold uppercase opacity-60">Authentication</span>
                    <div className="flex gap-1.5 pt-0.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          result.headerForensics.authentication.spf.status === "pass"
                            ? "bg-emerald-500/20 text-emerald-500"
                            : "bg-red-500/20 text-red-500"
                        }`}
                      >
                        SPF: {result.headerForensics.authentication.spf.status.toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          result.headerForensics.authentication.dkim.status === "pass"
                            ? "bg-emerald-500/20 text-emerald-500"
                            : "bg-red-500/20 text-red-500"
                        }`}
                      >
                        DKIM: {result.headerForensics.authentication.dkim.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs opacity-75 truncate">
                      DMARC: {result.headerForensics.authentication.dmarc.status.toUpperCase()} (p={result.headerForensics.authentication.dmarc.policy || "none"})
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)] space-y-1">
                    <span className="text-xs font-bold uppercase opacity-60">Domain Reputation</span>
                    <p className="text-sm font-mono font-bold truncate">
                      {result.domainIntelligence.mailProvider}
                    </p>
                    <p className="text-xs opacity-75">
                      Type: {result.domainIntelligence.domainType.replace("_", " ").toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Primary Red Flags Callout */}
                {result.redFlagCount > 0 && (
                  <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/30 space-y-3">
                    <h5 className="font-extrabold text-sm text-red-600 dark:text-rose-400 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      Critical Red Flags Discovered:
                    </h5>
                    <ul className="space-y-2 text-xs">
                      {result.headerForensics.alignmentFlags.displayNameSpoofing && (
                        <li className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <span>
                            <strong>Display Name Impersonation:</strong> The sender name references a major corporation or executive persona, but was dispatched from an unauthorized address ({result.headerForensics.from.address}).
                          </span>
                        </li>
                      )}
                      {result.headerForensics.authentication.spf.status === "fail" && (
                        <li className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <span>
                            <strong>SPF Hard Fail:</strong> The sending IP ({result.headerForensics.originatingMta?.ip}) has no authorization to send emails on behalf of {result.headerForensics.from.domain}.
                          </span>
                        </li>
                      )}
                      {result.headerForensics.authentication.dmarc.status === "fail" && (
                        <li className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <span>
                            <strong>DMARC Alignment Broken:</strong> Message fails domain-wide authentication conformance.
                          </span>
                        </li>
                      )}
                      {result.links.some((l) => l.isAnchorMismatch) && (
                        <li className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <span>
                            <strong>Deceptive Link Target (Anchor Mismatch):</strong> Hyperlinks in the email display a legitimate brand URL, but direct users to an external destination.
                          </span>
                        </li>
                      )}
                      {result.contentAudit.homoglyphDetected && (
                        <li className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <span>
                            <strong>Homoglyph Obfuscation:</strong> Cyrillic lookalike characters detected to evade automated keyword filtering.
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Sender & Server Forensics */}
            {activeTab === "forensics" && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-extrabold text-base mb-1">MTA Server Hop-by-Hop Trace</h4>
                  <p className="text-xs opacity-75">
                    Physical path traversed by this email from the originating sender to your destination server.
                  </p>
                </div>

                <div className="space-y-3">
                  {result.headerForensics.hops.map((hop) => (
                    <div
                      key={hop.hopNumber}
                      className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-[#2563eb] dark:text-[#00f0ff] font-mono font-bold flex items-center justify-center shrink-0">
                          {hop.hopNumber}
                        </span>
                        <div>
                          <p className="font-mono font-bold">From: {hop.from || "Undisclosed Host"}</p>
                          <p className="opacity-70">By: {hop.by || "Undisclosed Relay"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:text-right">
                        {hop.ip && (
                          <span className="px-2.5 py-1 rounded-md bg-black/10 dark:bg-white/10 font-mono text-[11px]">
                            IP: {hop.ip}
                          </span>
                        )}
                        {hop.withProtocol && (
                          <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono text-[11px]">
                            {hop.withProtocol}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Three-Way Sender Alignment Matrix */}
                <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 border border-[var(--border)] space-y-4">
                  <h5 className="font-extrabold text-sm">Three-Way Sender Alignment Forensics</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                    <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-1">
                      <span className="opacity-60 text-[10px] uppercase font-bold">1. Header From</span>
                      <p className="font-bold truncate">{result.headerForensics.from.address}</p>
                      <p className="opacity-70 text-[11px]">Domain: {result.headerForensics.from.domain}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-1">
                      <span className="opacity-60 text-[10px] uppercase font-bold">2. Envelope Return-Path</span>
                      <p className="font-bold truncate">
                        {result.headerForensics.returnPath?.address || "Not specified"}
                      </p>
                      <p
                        className={`text-[11px] font-bold ${
                          result.headerForensics.alignmentFlags.returnPathMismatch
                            ? "text-red-500"
                            : "text-emerald-500"
                        }`}
                      >
                        {result.headerForensics.alignmentFlags.returnPathMismatch
                          ? "⚠️ Mismatched Return Domain"
                          : "✅ Aligned Return Domain"}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-1">
                      <span className="opacity-60 text-[10px] uppercase font-bold">3. Reply-To Target</span>
                      <p className="font-bold truncate">
                        {result.headerForensics.replyTo?.address || "Defaults to sender"}
                      </p>
                      <p
                        className={`text-[11px] font-bold ${
                          result.headerForensics.alignmentFlags.replyToMismatch
                            ? "text-red-500"
                            : "text-emerald-500"
                        }`}
                      >
                        {result.headerForensics.alignmentFlags.replyToMismatch
                          ? "⚠️ Redirects Responses Externally"
                          : "✅ Aligned Reply-To"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Domain & Mailbox Intelligence */}
            {activeTab === "domain" && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-extrabold text-base mb-1">
                    Domain Deliverability &amp; Infrastructure Intelligence
                  </h4>
                  <p className="text-xs opacity-75">
                    Live DNS validation, MX record health, and provider fingerprinting.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)] space-y-3">
                    <span className="text-xs font-bold uppercase opacity-60">MX Record Health</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          result.domainIntelligence.mxStatus === "valid"
                            ? "bg-emerald-500/20 text-emerald-500"
                            : "bg-red-500/20 text-red-500"
                        }`}
                      >
                        {result.domainIntelligence.mxStatus.toUpperCase()}
                      </span>
                      <span className="text-xs opacity-75">
                        {result.domainIntelligence.mxRecords.length} Active Mail Exchange Host(s)
                      </span>
                    </div>

                    <div className="space-y-1.5 font-mono text-xs max-h-32 overflow-y-auto">
                      {result.domainIntelligence.mxRecords.map((mx, idx) => (
                        <div key={idx} className="flex justify-between p-2 rounded bg-black/10 dark:bg-white/5">
                          <span className="truncate">{mx.exchange}</span>
                          <span className="opacity-60">Pri: {mx.priority}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)] space-y-3">
                    <span className="text-xs font-bold uppercase opacity-60">Mailbox Classification</span>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-[var(--border)]/40">
                        <span className="opacity-70">Mail Provider:</span>
                        <span className="font-bold">{result.domainIntelligence.mailProvider}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[var(--border)]/40">
                        <span className="opacity-70">Domain Category:</span>
                        <span className="font-bold uppercase">
                          {result.domainIntelligence.domainType.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[var(--border)]/40">
                        <span className="opacity-70">Role-Based Account:</span>
                        <span className="font-bold">
                          {result.domainIntelligence.isRoleAccount
                            ? `Yes (${result.domainIntelligence.roleType})`
                            : "Personal / Individual Mailbox"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="opacity-70">Disposable / Throwaway:</span>
                        <span
                          className={`font-bold ${
                            result.domainIntelligence.isDisposable ? "text-red-500" : "text-emerald-500"
                          }`}
                        >
                          {result.domainIntelligence.isDisposable ? "YES (HIGH RISK)" : "No (Permanent Domain)"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Content & Attachment Sentinel */}
            {activeTab === "content" && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-extrabold text-base mb-1">Psychological Triggers &amp; Attachments</h4>
                  <p className="text-xs opacity-75">
                    Automated heuristic analysis for social engineering tactics and high-risk payloads.
                  </p>
                </div>

                {/* Social Engineering Triggers */}
                <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)] space-y-3">
                  <span className="text-xs font-bold uppercase opacity-60">
                    Detected Urgency &amp; Manipulation Hooks
                  </span>
                  {result.contentAudit.psychologicalTriggers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.contentAudit.psychologicalTriggers.map((t, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-500 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Zero high-pressure urgency keywords detected.
                    </p>
                  )}
                </div>

                {/* Attachment Manifest */}
                <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)] space-y-3">
                  <span className="text-xs font-bold uppercase opacity-60">Attachment Risk Manifest</span>
                  {result.contentAudit.attachments.length > 0 ? (
                    <div className="space-y-2">
                      {result.contentAudit.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono ${
                            att.riskLevel === "critical"
                              ? "bg-red-500/10 border-red-500/30 text-red-500"
                              : att.riskLevel === "suspicious"
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                              : "bg-black/5 dark:bg-white/5 border-[var(--border)]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Paperclip className="w-4 h-4 shrink-0" />
                            <span className="font-bold">{att.filename}</span>
                            <span className="opacity-60">({(att.sizeBytes / 1024).toFixed(1)} KB)</span>
                          </div>
                          <span className="font-sans font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-black/10 dark:bg-white/10">
                            {att.riskLevel} - {att.riskReason}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs opacity-70">No attachments found on this message.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: Link Checker & Visual Sandbox Detonation */}
            {activeTab === "links" && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-extrabold text-base mb-1">
                    Defanged Hyperlinks &amp; Sandbox Detonation
                  </h4>
                  <p className="text-xs opacity-75">
                    Safe preview of all embedded URLs, unmasked redirection hops, and destination safety ratings.
                  </p>
                </div>

                {result.links.length > 0 ? (
                  <div className="space-y-4">
                    {result.links.map((link) => (
                      <div
                        key={link.id}
                        className={`p-5 rounded-2xl border space-y-3 ${
                          link.threatLevel === "critical"
                            ? "bg-red-500/10 border-red-500/30"
                            : link.threatLevel === "caution"
                            ? "bg-amber-500/10 border-amber-500/30"
                            : "bg-black/5 dark:bg-white/5 border-[var(--border)]"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider w-fit ${
                              link.threatLevel === "critical"
                                ? "bg-red-500/20 text-red-600 dark:text-rose-400"
                                : link.threatLevel === "caution"
                                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                                : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {link.threatCategory}
                          </span>

                          <button
                            onClick={() => copyToClipboard(link.finalDestinationUrl, true, link.id)}
                            className="text-xs font-mono opacity-70 hover:opacity-100 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                          >
                            {copiedLink === link.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedLink === link.id ? "Copied" : "Copy Target URL"}</span>
                          </button>
                        </div>

                        {/* Anchor vs Destination */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                          <div className="p-3 rounded-xl bg-black/10 dark:bg-white/5 space-y-1">
                            <span className="text-[10px] opacity-60 uppercase font-sans font-bold">
                              Displayed Anchor Text
                            </span>
                            <p className="truncate font-bold text-slate-700 dark:text-slate-300">
                              {link.anchorText || "No text"}
                            </p>
                          </div>

                          <div className="p-3 rounded-xl bg-black/10 dark:bg-white/5 space-y-1">
                            <span className="text-[10px] opacity-60 uppercase font-sans font-bold">
                              True Final Destination (Defanged)
                            </span>
                            <p className="truncate font-bold text-[#2563eb] dark:text-[#00f0ff]">
                              {link.defangedFinalUrl}
                            </p>
                          </div>
                        </div>

                        {/* Threat Reasons */}
                        {link.threatReasons.length > 0 && (
                          <div className="space-y-1 text-xs">
                            <span className="text-[11px] font-bold opacity-75">Analysis Findings:</span>
                            <ul className="list-disc list-inside space-y-0.5 opacity-90">
                              {link.threatReasons.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs opacity-75">No hyperlinks were found in this email message.</p>
                )}
              </div>
            )}

            {/* TAB 6: Non-Tech Dummy Guide */}
            {activeTab === "guide" && (
              <div className="space-y-6 text-sm">
                <div>
                  <h4 className="font-extrabold text-base mb-1">
                    The 5-Step Non-Tech Phishing Triage Guide
                  </h4>
                  <p className="text-xs opacity-75">
                    How to inspect, verify, and handle suspicious emails safely without technical expertise.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)] space-y-2">
                    <span className="w-6 h-6 rounded-full bg-[#2563eb]/20 text-[#2563eb] dark:text-[#00f0ff] font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h5 className="font-bold text-sm">Check the Actual Address, Not Just the Name</h5>
                    <p className="text-xs opacity-80 leading-relaxed">
                      Anyone can set their display name to &quot;Microsoft Security&quot; or your CEO&apos;s name. Look closely at the email address inside the angle brackets.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)] space-y-2">
                    <span className="w-6 h-6 rounded-full bg-[#2563eb]/20 text-[#2563eb] dark:text-[#00f0ff] font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h5 className="font-bold text-sm">Beware of Artificial Panic &amp; Urgency</h5>
                    <p className="text-xs opacity-80 leading-relaxed">
                      Phishing attacks thrive on panic: &quot;Account closing in 2 hours&quot;, &quot;Immediate payment required&quot;, &quot;Suspended mailbox&quot;. Stop and breathe before reacting.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)] space-y-2">
                    <span className="w-6 h-6 rounded-full bg-[#2563eb]/20 text-[#2563eb] dark:text-[#00f0ff] font-bold text-xs flex items-center justify-center">
                      3
                    </span>
                    <h5 className="font-bold text-sm">Never Click Unknown Links</h5>
                    <p className="text-xs opacity-80 leading-relaxed">
                      Deceptive links may look like genuine bank portals but direct you to Russian, Chinese, or bulletproof hosting servers designed to harvest passwords.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)] space-y-2">
                    <span className="w-6 h-6 rounded-full bg-[#2563eb]/20 text-[#2563eb] dark:text-[#00f0ff] font-bold text-xs flex items-center justify-center">
                      4
                    </span>
                    <h5 className="font-bold text-sm">Verify Out-of-Band</h5>
                    <p className="text-xs opacity-80 leading-relaxed">
                      If an email requests wire transfers or password resets, contact the sender using a verified phone number or separate messaging channel.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: Remediation & Incident Response CTA */}
            {activeTab === "cta" && (
              <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-2 relative z-10">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-[#00f0ff] border border-indigo-500/40 inline-flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> ENTERPRISE INCIDENT RESPONSE
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-black">
                    Suspect a Targeted Attack or Compromised Corporate Mailbox?
                  </h4>
                  <p className="text-sm opacity-80 max-w-2xl leading-relaxed">
                    Phishing attacks are frequently the entry point for ransomware, Business Email Compromise (BEC), and wire fraud. Let Cankal Software&apos;s certified UK cybersecurity specialists protect and harden your infrastructure.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium relative z-10">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-[#00f0ff] shrink-0" />
                    <span>Emergency Phishing Triage &amp; Threat Containment</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-[#00f0ff] shrink-0" />
                    <span>Microsoft 365 &amp; Google Workspace Forensics</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-[#00f0ff] shrink-0" />
                    <span>SPF, DKIM, DMARC (p=reject) &amp; BIMI Enforcement</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-[#00f0ff] shrink-0" />
                    <span>Employee Phishing Awareness &amp; Simulated Attacks</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-4 relative z-10">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#00f0ff] to-[#b52bff] text-black shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <span>Request Emergency Cybersecurity Consultation</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <a
                    href="mailto:info@cankalsoftware.com"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm bg-white/10 hover:bg-white/15 border border-white/20 transition-all text-white"
                  >
                    <Mail className="w-4 h-4" />
                    <span>info@cankalsoftware.com</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
