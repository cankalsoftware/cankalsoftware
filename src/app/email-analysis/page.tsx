import { EmailScannerWidget } from "@/components/EmailScannerWidget";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  HelpCircle,
  Server,
} from "lucide-react";
import Link from "next/link";

export default function EmailAnalysisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Cankal Software Email Phishing Analysis Tool",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
    },
    description:
      "A privacy-first email forensics and phishing analysis tool that decodes Outlook .msg and MIME .eml files, inspects server MTA hops, evaluates SPF/DKIM/DMARC authentication, and unmasks malicious links in a sandbox.",
  };

  const faqs = [
    {
      q: "What is the difference between a .msg and a .eml file?",
      a: "A .msg file is Microsoft Outlook's proprietary binary format (Compound File Binary) used to save individual messages, attachments, and MAPI metadata. A .eml file is an open standard MIME format (RFC 822 / RFC 5322) used by Gmail, Apple Mail, Thunderbird, and standard internet mail transfer agents. Our analyzer parses both formats safely in-memory.",
    },
    {
      q: "Is it safe to upload a suspicious email to Cankal Software?",
      a: "Yes. Our tool operates under a strict Zero-Storage Policy. The file is parsed purely in ephemeral server RAM without writing email bodies, attachments, or sender identities to disk or databases. Attached files are never executed.",
    },
    {
      q: "What do SPF, DKIM, and DMARC mean in simple words?",
      a: "SPF (Sender Policy Framework) is like a company's authorized list of mail servers. DKIM (DomainKeys Identified Mail) is a digital wax seal proving the message wasn't tampered with in transit. DMARC tells receiving servers what to do (e.g. reject or quarantine) if an email fails SPF or DKIM.",
    },
    {
      q: "Can just opening an email infect my computer?",
      a: "Modern webmail clients and mail software generally disable automatic execution of malicious code in the preview pane. However, clicking deceptive hyperlinks, opening macro-enabled attachments (.docm, .xlsm), or downloading executables (.exe, .iso, .vbs) can infect your device. Our tool lets you inspect everything safely without opening it in your mail client.",
    },
    {
      q: "What should I do if the analyzer flags an email as Red (Critical Danger)?",
      a: "Do not click any links, do not open attachments, and do not reply. Report the email to your corporate IT security administrator immediately. If you suspect an active breach or executive account takeover, contact Cankal Software for emergency incident response.",
    },
  ];

  return (
    <div className="min-h-screen pt-4 sm:pt-8 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-rose-400 border border-red-500/20 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Automated Email Threat &amp; Phishing Forensics</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
          Email Phishing Analysis &amp;{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] to-[#00f0ff]">
            Header Inspector
          </span>
        </h1>

        <p className="text-sm sm:text-base opacity-75 max-w-2xl mx-auto leading-relaxed">
          Strip Outlook <code className="text-xs px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono">.msg</code> and <code className="text-xs px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono">.eml</code> files. Compare declared senders against actual mail servers, detect spoofing with Red/Green indicators, and safely sandbox suspicious links.
        </p>
      </div>

      {/* Main Interactive Scanner Widget */}
      <EmailScannerWidget />

      {/* Feature Pillar Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-3 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-[#2563eb] dark:text-[#00f0ff] flex items-center justify-center font-bold">
            <Server className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base">Server MTA Forensics &amp; Alignment</h3>
          <p className="text-xs opacity-75 leading-relaxed">
            Trace the chronological server hops taken by the message. Compare header <code className="font-mono">From:</code> against envelope <code className="font-mono">Return-Path:</code>, reverse DNS records, and SPF/DKIM/DMARC authentication.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-3 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base">Safe Link Detonation &amp; Defanging</h3>
          <p className="text-xs opacity-75 leading-relaxed">
            All embedded links are automatically neutralized (<code className="font-mono">hxxps[://]</code>). Detect deceptive anchor text mismatches, unmask URL shortener chains, and inspect landing pages in total isolation.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-3 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base">Linguistic &amp; Attachment Sentinel</h3>
          <p className="text-xs opacity-75 leading-relaxed">
            Detect high-pressure psychological urgency (&quot;24 hours to act&quot;), Cyrillic homoglyph character obfuscation, and dangerous attachment formats (.exe, .iso, .docm) before they harm your team.
          </p>
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xl space-y-8 max-w-4xl mx-auto">
        <div className="space-y-1 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563eb] dark:text-[#00f0ff]">
            Educational FAQ
          </span>
          <h2 className="text-2xl font-black">Frequently Asked Questions About Email Phishing</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)] space-y-2"
            >
              <h3 className="font-bold text-sm flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <HelpCircle className="w-4 h-4 text-[#2563eb] dark:text-[#00f0ff] shrink-0" />
                {faq.q}
              </h3>
              <p className="text-xs opacity-80 pl-6 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Conversion CTA */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 border border-blue-500/20 backdrop-blur-xl text-center space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00f0ff]">
            Professional Cyber Security Services
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">
            Need Expert Phishing Remediation or Enterprise Mailbox Forensics?
          </h2>
          <p className="text-sm opacity-80 max-w-xl mx-auto leading-relaxed">
            Our certified cybersecurity team assists UK and international organizations with emergency incident response, Business Email Compromise (BEC) containment, and full SPF/DKIM/DMARC hardening.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/contact"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#2563eb] to-[#7c3aed] dark:from-[#00f0ff] dark:to-[#b52bff] text-white dark:text-black shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Schedule a Security Consultation
          </Link>

          <Link
            href="/vulnerability-check"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm bg-black/5 dark:bg-white/5 border border-[var(--border)] hover:bg-black/10 dark:hover:bg-white/10 transition-all text-current"
          >
            Explore Vulnerability Scanner
          </Link>
        </div>
      </div>
    </div>
  );
}
