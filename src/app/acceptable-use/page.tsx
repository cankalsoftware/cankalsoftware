import Link from "next/link";
import { ShieldAlert, CheckCircle2, XCircle, ArrowRight, Terminal } from "lucide-react";

export default function AcceptableUsePage() {
  const lastUpdated = "October 3, 2026";

  return (
    <div className="pt-4 pb-12 md:pt-6 md:pb-16 max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
      {/* Header */}
      <div className="space-y-4 border-b border-black/10 dark:border-white/10 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Ethical Use &amp; Platform Security Standards</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Acceptable Use Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Last Updated: <strong>{lastUpdated}</strong> • Cankal Software and IT Consultancy Ltd.
        </p>
      </div>

      {/* Main Content */}
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-sm md:text-base leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            1. Purpose &amp; Scope
          </h2>
          <p className="text-muted-foreground">
            This Acceptable Use Policy (&quot;AUP&quot;) defines the ethical rules and technical standards governing access to and use of all websites, software platforms, hosted SaaS applications (including Firevision), developer APIs, and free online utilities provided by <strong>Cankal Software and IT Consultancy Ltd.</strong> (&quot;Cankal Software&quot;, &quot;we&quot;, &quot;us&quot;).
          </p>
          <p className="text-muted-foreground">
            By accessing or using our services, you agree to comply strictly with this policy. Any breach of this AUP may result in immediate suspension or termination of your access, blocking of IP ranges, and legal action where warranted.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            2. Strictly Prohibited Activities
          </h2>
          <p className="text-muted-foreground">
            You may not access or use Cankal Software platforms or tools for any unlawful, unethical, or abusive purpose, including but not limited to:
          </p>
          <div className="space-y-3">
            {[
              {
                title: "Unauthorised Security Scanning & Reconnaissance",
                desc: "Submitting third-party web assets, government networks, or private servers to our scanner tools without explicit, written authorisation from the legitimate domain owner.",
              },
              {
                title: "Denial of Service (DoS/DDoS) & Rate Limit Abuse",
                desc: "Launching automated, high-frequency scripts, flooding scanner APIs, or attempting to degrade the responsiveness and availability of our infrastructure.",
              },
              {
                title: "Malicious Payload Injection & SSRF Exploitation",
                desc: "Attempting to bypass our Server-Side Request Forgery (SSRF) filters, probing private IP spaces (127.0.0.1, 10.x.x.x, 192.168.x.x), or executing injection payloads.",
              },
              {
                title: "Reverse Engineering & Proprietary IP Theft",
                desc: "Decompiling, disassembling, scraping, or attempting to reconstruct the proprietary algorithms, models, and architectures powering Cankal Software systems.",
              },
              {
                title: "Illegal Content & Intellectual Property Infringement",
                desc: "Hosting, transmitting, or linking to malware, phishing schemes, ransomware, child sexual abuse material (CSAM), or content infringing third-party copyrights.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/15 flex items-start gap-3"
              >
                <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            3. Permitted &amp; Ethical Tool Usage
          </h2>
          <p className="text-muted-foreground">
            Our free tools (such as the <strong>AEO &amp; LLM Scanner</strong>, <strong>Website Health &amp; Structure Audit</strong>, <strong>Vulnerability Check</strong>, and <strong>2026 OWASP Top 10 Audit</strong>) are provided free of charge for defensive, educational, and constructive optimisation purposes under the following conditions:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-foreground">Self-Auditing Your Own Assets</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Auditing your company&apos;s own websites, SaaS platforms, or staging environments.</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-foreground">Authorised Client Audits</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Consultants and agencies analysing websites on behalf of consenting clients.</p>
              </div>
            </div>
          </div>

          {/* Fair-Use Quota Notice */}
          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/15 space-y-2 mt-3">
            <h4 className="font-bold text-xs text-[#2563eb] dark:text-[#00f0ff] uppercase tracking-wider">
              Fair-Use Policy &amp; Monthly Free Scan Limits (10 Scans / Month)
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              To prevent automated denial-of-service, bot abuse, and resource starvation while safeguarding user privacy, our free diagnostic tools are subject to a fair-use limit of <strong>up to ten (10) free audits per calendar month</strong> per client. This quota resets automatically on the first day of every calendar month.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              In accordance with our strict data minimisation and GDPR commitment, we do not record or build user tracking dossiers. Rate limiting is enforced through privacy-first browser storage and non-intrusive <strong>Google reCAPTCHA v3</strong> risk scoring. If your business requires unlimited bulk audits, API access, or automated continuous monitoring, please contact our engineering team.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            4. Enforcement, Throttling &amp; Abuse Reporting
          </h2>
          <p className="text-muted-foreground">
            We actively monitor system telemetry, API query frequencies, and network logs. We reserve the absolute right to:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground text-xs md:text-sm">
            <li>Implement automated rate limits, IP throttling, and CAPTCHA challenges to prevent service abuse.</li>
            <li>Immediately terminate active sessions or revoke API access for violators of this policy.</li>
            <li>Report severe cyber offences to law enforcement authorities, including the <strong>UK National Cyber Crime Unit (NCCU)</strong> and international counterparts.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 border-t border-black/10 dark:border-white/10 pt-6">
          <h2 className="text-xl font-bold text-foreground">
            5. Reporting Violations
          </h2>
          <p className="text-muted-foreground">
            If you become aware of any violation of this Acceptable Use Policy or believe our tools are being misused, please immediately notify our security team at:
          </p>
          <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 text-sm space-y-1">
            <p className="font-bold text-foreground">Cankal Software Security &amp; Compliance</p>
            <p className="text-muted-foreground">Email: info@cankalsoftware.com</p>
          </div>
        </section>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 rounded-3xl glass border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-base">Looking for authorised penetration testing &amp; cyber defence?</h4>
          <p className="text-xs text-muted-foreground">Cankal Software provides certified web application security and server hardening.</p>
        </div>
        <Link
          href="/contact"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-[#00f0ff] text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shrink-0"
        >
          <span>Request Security Assessment</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
