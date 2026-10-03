import Link from "next/link";
import { Zap, Clock, ShieldCheck, CheckCircle2, Server, ArrowRight } from "lucide-react";

export default function ServiceLevelAgreementPage() {
  const lastUpdated = "October 3, 2026";

  const incidentTiers = [
    {
      severity: "Severity 1 (Critical)",
      definition: "Complete service outage affecting core business operations with no available workaround.",
      initialResponse: "< 1 Hour",
      targetResolution: "< 4 Hours",
      availability: "24/7/365",
      badgeColor: "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30",
    },
    {
      severity: "Severity 2 (Major)",
      definition: "Significant system degradation affecting key features or performance, but partial operations continue.",
      initialResponse: "< 4 Hours",
      targetResolution: "< 12 Hours",
      availability: "Extended Business Hours",
      badgeColor: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
    },
    {
      severity: "Severity 3 (Minor)",
      definition: "Non-critical feature issue, minor UI flaw, or general operational request with full workaround available.",
      initialResponse: "< 1 Business Day",
      targetResolution: "Next Scheduled Release",
      availability: "Standard Business Hours",
      badgeColor: "bg-blue-500/20 text-blue-600 dark:text-[#00f0ff] border-blue-500/30",
    },
  ];

  return (
    <div className="pt-4 pb-12 md:pt-6 md:pb-16 max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
      {/* Header */}
      <div className="space-y-4 border-b border-black/10 dark:border-white/10 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-xs font-semibold text-[#00f0ff] border border-cyan-500/20">
          <Zap className="w-3.5 h-3.5" />
          <span>99.9% Uptime Commitment &amp; Rapid Incident Response</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Service Level Agreement (SLA)
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
            1. Scope &amp; Application
          </h2>
          <p className="text-muted-foreground">
            This Service Level Agreement (&quot;SLA&quot;) sets forth the technical support standards, system availability guarantees, incident response times, and disaster recovery commitments provided by <strong>Cankal Software and IT Consultancy Ltd.</strong> (&quot;Cankal Software&quot;, &quot;we&quot;, &quot;our&quot;) to clients subscribed to our hosted enterprise SaaS platforms (including Firevision), managed cloud solutions, and bespoke software maintenance contracts.
          </p>
          <p className="text-muted-foreground">
            <em>Note: Free public web tools (such as the AEO Scanner and Vulnerability Check) are provided on an &quot;as-is&quot; basis and are excluded from this formal SLA.</em>
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            2. System Availability &amp; Uptime Commitment
          </h2>
          <p className="text-muted-foreground">
            We target a monthly system availability of at least <strong>99.9% Uptime</strong> across our core hosted platforms and API services, calculated on a calendar month basis.
          </p>
          <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-2">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Server className="w-4 h-4 text-[#2563eb] dark:text-[#00f0ff]" />
              Uptime Calculation Formula
            </h4>
            <p className="text-xs font-mono text-muted-foreground bg-black/5 dark:bg-black/30 p-2.5 rounded-xl">
              Monthly Uptime % = [(Total Monthly Minutes − Unscheduled Downtime Minutes) ÷ Total Monthly Minutes] × 100
            </p>
            <p className="text-xs text-muted-foreground pt-1">
              *Scheduled maintenance windows (notified at least 48 hours in advance) and issues arising from external network failures beyond our control are excluded from downtime calculations.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            3. Incident Classification &amp; Response Times
          </h2>
          <p className="text-muted-foreground">
            When an incident is reported through our support channels (<a href="mailto:info@cankalsoftware.com" className="text-[#2563eb] dark:text-[#00f0ff] underline">info@cankalsoftware.com</a> or dedicated client portal), our engineering team classifies the issue and responds within the following contractual windows:
          </p>

          <div className="space-y-3">
            {incidentTiers.map((tier, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${tier.badgeColor}`}>
                      {tier.severity}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Support: {tier.availability}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {tier.definition}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5">
                    <span className="text-muted-foreground block text-[11px]">Initial Response Target:</span>
                    <span className="font-bold text-foreground">{tier.initialResponse}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5">
                    <span className="text-muted-foreground block text-[11px]">Resolution / Workaround Target:</span>
                    <span className="font-bold text-foreground">{tier.targetResolution}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            4. Backup &amp; Disaster Recovery Standards
          </h2>
          <p className="text-muted-foreground">
            All enterprise cloud deployments engineered by Cankal Software adhere to enterprise resilience benchmarks:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/15 space-y-1">
              <h4 className="font-bold text-xs text-foreground">Recovery Point Objective (RPO)</h4>
              <p className="text-2xl font-black text-[#2563eb] dark:text-[#00f0ff]">&lt; 1 Hour</p>
              <p className="text-xs text-muted-foreground">Continuous automated snapshot replication across geographically distributed UK &amp; EU data centres.</p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/15 space-y-1">
              <h4 className="font-bold text-xs text-foreground">Recovery Time Objective (RTO)</h4>
              <p className="text-2xl font-black text-[#2563eb] dark:text-[#00f0ff]">&lt; 4 Hours</p>
              <p className="text-xs text-muted-foreground">Automated multi-region failover and containerised infrastructure orchestration for rapid restoration.</p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            5. Service Credits &amp; Remedies
          </h2>
          <p className="text-muted-foreground">
            In the event that Cankal Software fails to meet the 99.9% monthly availability target for a covered enterprise managed service, the Client is entitled to request a service credit applied to their subsequent billing invoice:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-xs md:text-sm">
            <li><strong>99.0% to 99.89% Uptime:</strong> 10% monthly service credit</li>
            <li><strong>95.0% to 98.99% Uptime:</strong> 25% monthly service credit</li>
            <li><strong>Below 95.0% Uptime:</strong> 50% monthly service credit</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3 border-t border-black/10 dark:border-white/10 pt-6">
          <h2 className="text-xl font-bold text-foreground">
            6. Enquiries &amp; Support Escalations
          </h2>
          <p className="text-muted-foreground">
            For critical incident reporting, SLA questions, or enterprise custom support tiers:
          </p>
          <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 text-sm space-y-1">
            <p className="font-bold text-foreground">Cankal Software Incident Response Team</p>
            <p className="text-muted-foreground">Email: info@cankalsoftware.com</p>
            <p className="text-muted-foreground">United Kingdom</p>
          </div>
        </section>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 rounded-3xl glass border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-base">Need a tailored 24/7 mission-critical SLA?</h4>
          <p className="text-xs text-muted-foreground">We engineer custom support packages for enterprise AI and SaaS systems.</p>
        </div>
        <Link
          href="/contact"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#00f0ff] text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shrink-0"
        >
          <span>Discuss Enterprise SLA</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
