import Link from "next/link";
import { ShieldCheck, Mail, Lock, FileText, ArrowRight } from "lucide-react";

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 3, 2026";

  return (
    <div className="pt-4 pb-12 md:pt-6 md:pb-16 max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
      {/* Header */}
      <div className="space-y-4 border-b border-black/10 dark:border-white/10 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-xs font-semibold text-[#2563eb] dark:text-[#00f0ff] border border-blue-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>UK GDPR &amp; Data Protection Act 2018 Compliant</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Privacy Policy
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
            1. Introduction &amp; Data Controller Overview
          </h2>
          <p className="text-muted-foreground">
            <strong>Cankal Software and IT Consultancy Ltd.</strong> (&quot;Cankal Software&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is a company incorporated in the United Kingdom dedicated to artificial intelligence transformation, SaaS engineering, computer vision solutions, and cybersecurity advisory.
          </p>
          <p className="text-muted-foreground">
            We are committed to protecting the privacy, confidentiality, and security of all personal data we process in full compliance with the <strong>UK General Data Protection Regulation (UK GDPR)</strong>, the <strong>Data Protection Act 2018</strong>, the <strong>EU GDPR</strong>, and the <strong>Privacy and Electronic Communications Regulations (PECR)</strong>.
          </p>
          <p className="text-muted-foreground">
            For the purposes of data protection legislation, Cankal Software and IT Consultancy Ltd. is the <strong>Data Controller</strong>. If you have any enquiries regarding this policy, you may contact our privacy team directly at{" "}
            <a href="mailto:info@cankalsoftware.com" className="text-[#2563eb] dark:text-[#00f0ff] underline font-medium">
              info@cankalsoftware.com
            </a>.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            2. Personal Data We Collect
          </h2>
          <p className="text-muted-foreground">
            Depending on how you interact with our website, free online tools, or consultancy services, we may collect and process the following categories of data:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              <strong>Direct Enquiries &amp; Contact Communications:</strong> When you submit a project enquiry or consultation request via our contact form or direct email, we collect your full name, work email address, company name, telephone number (if provided), and project description. We hold this correspondence solely to evaluate your scope and respond to your communication.
            </li>
            <li>
              <strong>Free Tool Usage Data (AEO, CVE &amp; OWASP Scanners):</strong> When you use our public tools (such as the AEO Scanner, Vulnerability Check, or 2026 OWASP Top 10 Audit), you input public website domains or URLs. <em>Note: Our scanners perform passive, read-only analysis of public HTTP response headers and HTML entirely in-memory. We do not store, harvest, or monetise scanned website contents or discovered vulnerabilities for unauthorised third parties.</em>
            </li>
            <li>
              <strong>Automated Telemetry &amp; Device Information:</strong> Standard server logs, anonymised IP addresses, browser specifications, operating system details, timestamps, and referral paths captured via Google Analytics 4, Microsoft Bing Webmaster Tools, and server diagnostics.
            </li>
            <li>
              <strong>Security &amp; Bot Prevention Data:</strong> Google reCAPTCHA v3 interaction tokens to detect automated spam submissions on our forms.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            3. Lawful Bases for Processing (Article 6 UK GDPR)
          </h2>
          <p className="text-muted-foreground">
            We only process your personal data where we have a recognised legal justification under Article 6 of the UK GDPR:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-1">
              <h4 className="font-bold text-foreground text-sm">A. Contractual Performance</h4>
              <p className="text-xs text-muted-foreground">
                To evaluate project scopes, execute statements of work (SOWs), and deliver software development and AI consultancy services.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-1">
              <h4 className="font-bold text-foreground text-sm">B. Legitimate Interests</h4>
              <p className="text-xs text-muted-foreground">
                To protect our infrastructure from cyberattacks, optimise scanner performance, and provide responsive customer service.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-1">
              <h4 className="font-bold text-foreground text-sm">C. Consent</h4>
              <p className="text-xs text-muted-foreground">
                Where you explicitly opt into non-essential analytics or advertising cookies (e.g. Meta Pixel conversion tracking).
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-1">
              <h4 className="font-bold text-foreground text-sm">D. Legal Obligation</h4>
              <p className="text-xs text-muted-foreground">
                To maintain statutory corporate accounting, tax, and regulatory compliance under United Kingdom law.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            4. Data Sharing &amp; Third-Party Sub-processors
          </h2>
          <p className="text-muted-foreground">
            We never sell, rent, or trade your personal information. We only disclose data to trusted service providers operating under strict confidentiality and data processing agreements:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Cloud Hosting &amp; Infrastructure:</strong> Sovereign enterprise UK and European cloud infrastructure and data centres.</li>
            <li><strong>Email &amp; Communications:</strong> Authenticated SMTP relays and transactional email providers (e.g. Nodemailer) for direct enquiry handling.</li>
            <li><strong>Search Engine &amp; Webmaster Analytics:</strong> Microsoft Corporation (Bing Webmaster Tools &amp; Microsoft Analytics) and Google LLC (Google Analytics 4 &amp; Google Search Console) for website indexing diagnostics and anonymous usage insights.</li>
            <li><strong>Security &amp; Abuse Prevention:</strong> Google LLC (reCAPTCHA v3 bot verification).</li>
            <li><strong>Marketing Analytics:</strong> Meta Platforms Ireland Ltd. (Meta Pixel) for conversion attribution.</li>
            <li><strong>Legal &amp; Regulatory Authorities:</strong> Where strictly mandated by court order or statutory UK law enforcement.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            5. International Data Transfers &amp; Page Analysis
          </h2>
          <p className="text-muted-foreground">
            Our free online diagnostic tools (AEO Scanner, Vulnerability Check, and 2026 OWASP Top 10 Audit) execute transient, real-time analyses purely in-memory on our UK and European servers. We do not store, copy, or transfer scanned target website data across international borders. The passive inspection results are sent directly back to your active browser session and are discarded immediately upon completion of the scan.
          </p>
          <p className="text-muted-foreground">
            Where standard aggregated analytics data (such as Google Analytics 4 or Microsoft Bing Webmaster Tools) is processed, adequate protections are maintained through the UK International Data Transfer Agreement (IDTA), UK Addendum to the EU Standard Contractual Clauses (SCCs), or relevant UK adequacy regulations.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            6. Data Retention &amp; Security Standards
          </h2>
          <p className="text-muted-foreground">
            We retain personal communication records only for as long as necessary to fulfil the business purposes for which they were collected or to comply with statutory accounting requirements (e.g. 6 years for financial transaction invoices).
          </p>
          <p className="text-muted-foreground">
            We employ enterprise-grade technical and organisational security measures, including TLS 1.3 encryption in transit, strict Content-Security-Policies, role-based access control, and adherence to UK NCSC Cyber Essentials guidelines.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            7. Your Statutory Rights &amp; Data Management (UK GDPR)
          </h2>
          <p className="text-muted-foreground">
            Cankal Software operates on a strict data-minimisation principle. We do not maintain user account registries or consumer profiling databases. The only personal information we process corresponds to direct email enquiries or consultation requests sent intentionally by you.
          </p>
          <p className="text-muted-foreground">
            Under United Kingdom data protection law, you possess full control over any communications or information you share with us:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
            <li><strong>Right of Access &amp; Review:</strong> Request a full copy of any email correspondence or enquiry records we hold.</li>
            <li><strong>Right to Rectification:</strong> Request prompt correction of inaccurate or updated contact details.</li>
            <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Request the permanent deletion of your emails, enquiry logs, and communication history from our active systems.</li>
            <li><strong>Right to Restrict Processing:</strong> Limit how we process your communication data while reviewing your request.</li>
            <li><strong>Right to Data Portability:</strong> Receive an export of your enquiry data in a standard, machine-readable format.</li>
            <li><strong>Right to Object:</strong> Object at any time to communication follow-ups or direct enquiries.</li>
          </ul>
          <p className="text-muted-foreground pt-2">
            To exercise any of these rights, or to request the immediate review or deletion of your communication records, please contact us directly at{" "}
            <a href="mailto:info@cankalsoftware.com" className="text-[#2563eb] dark:text-[#00f0ff] underline font-medium">
              info@cankalsoftware.com
            </a>. Our team will review and resolve your request directly and without delay.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3 border-t border-black/10 dark:border-white/10 pt-6">
          <h2 className="text-xl font-bold text-foreground">
            8. Contact &amp; Enquiries
          </h2>
          <p className="text-muted-foreground">
            For questions, data subject requests, or security disclosures, please contact:
          </p>
          <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 text-sm space-y-1">
            <p className="font-bold text-foreground">Cankal Software and IT Consultancy Ltd.</p>
            <p className="text-muted-foreground">United Kingdom</p>
            <p className="text-muted-foreground">Email: info@cankalsoftware.com</p>
          </div>
        </section>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 rounded-3xl glass border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-base">Have questions about our security and privacy standards?</h4>
          <p className="text-xs text-muted-foreground">Our team is available to discuss custom enterprise data handling and SLAs.</p>
        </div>
        <Link
          href="/contact"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#00f0ff] text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shrink-0"
        >
          <span>Contact Our Team</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
