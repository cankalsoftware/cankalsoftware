import Link from "next/link";
import { FileText, Shield, Scale, ArrowRight, CheckCircle2 } from "lucide-react";

export default function TermsOfServicePage() {
  const lastUpdated = "October 3, 2026";

  return (
    <div className="pt-4 pb-12 md:pt-6 md:pb-16 max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
      {/* Header */}
      <div className="space-y-4 border-b border-black/10 dark:border-white/10 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-xs font-semibold text-[#b52bff] dark:text-[#00f0ff] border border-purple-500/20">
          <Scale className="w-3.5 h-3.5" />
          <span>Governed by the Laws of England and Wales</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground">
          Last Updated: <strong>{lastUpdated}</strong> • Cankal Software and IT Consultancy Ltd.
        </p>
      </div>

      {/* Terms Body */}
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-sm md:text-base leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            1. Agreement to Terms
          </h2>
          <p className="text-muted-foreground">
            These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;Client&quot;, &quot;User&quot;, &quot;you&quot;) and <strong>Cankal Software and IT Consultancy Ltd.</strong> (&quot;Cankal Software&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;), governing your access to and use of our website, software engineering services, artificial intelligence consultancy, SaaS applications (including Firevision), and free online web utility tools.
          </p>
          <p className="text-muted-foreground">
            By browsing our website, utilising our free web tools, or entering into a Statement of Work (SOW) with us, you confirm that you have read, understood, and agreed to be bound by these Terms. If you do not agree, you must immediately discontinue use of our website and services.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            2. Consultancy &amp; Bespoke Software Engineering
          </h2>
          <p className="text-muted-foreground">
            Where Cankal Software is engaged to deliver bespoke artificial intelligence transformation, custom SaaS architecture, computer vision solutions, or web application development:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              <strong>Statements of Work (SOW):</strong> The specific scope, timeline, milestones, fees, and deliverables for each project will be defined in a mutually executed SOW or formal proposal.
            </li>
            <li>
              <strong>Client Obligations:</strong> The Client agrees to provide timely access to necessary specifications, feedback, design assets, and testing environments required to complete the project deliverables.
            </li>
            <li>
              <strong>Acceptance Testing:</strong> The Client shall have ten (10) business days from delivery of each milestone to test and verify compliance with agreed specifications before milestone sign-off.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            3. Terms Governing Free Online Tools &amp; Scanners
          </h2>
          <p className="text-muted-foreground">
            We provide free web utilities, including the <strong>AEO &amp; LLM Search Readiness Scanner</strong>, the <strong>Website Health &amp; Structure Audit</strong>, the <strong>Cyber Security &amp; Vulnerability Check</strong>, and the <strong>2026 OWASP Top 10 Vulnerability Check</strong>, subject to the following express conditions:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              <strong>Informational &amp; Advisory Nature:</strong> Free scanner tools perform automated, passive, external audits of public HTTP headers, SSL/TLS, and public metadata. Results, scores, and remediation blueprints are provided strictly for educational and preliminary diagnostic purposes.
            </li>
            <li>
              <strong>User Sole Risk &amp; No Warranty:</strong> All free diagnostic tools are provided entirely at your own risk on an &quot;as is&quot; and &quot;as available&quot; basis without warranty of any kind. Cankal Software disclaims all liability for any actions, configurations, or modifications implemented based on free scan results.
            </li>
            <li>
              <strong>Authorisation Warranty:</strong> You represent and warrant that you own or have obtained lawful authorisation from the domain owner before submitting any URL to our scanning engines.
            </li>
            <li>
              <strong>No Guarantee of Total Immunity:</strong> A high score or pass on any vulnerability or OWASP check does not guarantee complete immunity against sophisticated cyberattacks, zero-day vulnerabilities, or manual penetration exploits. It does not replace full-scope, authenticated penetration testing.
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            4. Intellectual Property Rights
          </h2>
          <p className="text-muted-foreground">
            <strong>Cankal Software Pre-existing IP:</strong> All pre-existing frameworks, proprietary code libraries, algorithms, tools, methodologies, trademarks, logos, and website contents remain the exclusive property of Cankal Software and IT Consultancy Ltd.
          </p>
          <p className="text-muted-foreground">
            <strong>Client Deliverables:</strong> Upon full and final settlement of all invoiced fees for bespoke engineering projects, Cankal Software grants the Client full ownership of the custom code and bespoke deliverables specified in the applicable Statement of Work, excluding our underlying reusable core libraries.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            5. Fees, Invoicing &amp; Payment Terms
          </h2>
          <p className="text-muted-foreground">
            Unless otherwise agreed in a written SOW, all fees are quoted in British Pounds Sterling (£ / GBP) and are exclusive of Value Added Tax (VAT) where applicable. Invoices are payable within fourteen (14) calendar days of receipt. We reserve the right to suspend development or cloud hosting services in the event of overdue undisputed invoices.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            6. Warranties &amp; Disclaimers
          </h2>
          <p className="text-muted-foreground">
            We warrant that professional consultancy services will be performed with reasonable skill and care in accordance with recognised industry standards.
          </p>
          <p className="text-muted-foreground">
            EXCEPT AS EXPRESSLY SET FORTH HEREIN, ALL SERVICES, FREE TOOLS, AND WEBSITE CONTENT ARE PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            7. Limitation of Liability
          </h2>
          <p className="text-muted-foreground">
            TO THE FULLEST EXTENT PERMITTED UNDER APPLICABLE LAW, IN NO EVENT SHALL CANKAL SOFTWARE AND IT CONSULTANCY LTD. BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, PUNITIVE, OR LOSS OF PROFIT DAMAGES ARISING OUT OF OR IN CONNECTION WITH OUR SERVICES OR TOOLS.
          </p>
          <p className="text-muted-foreground">
            OUR TOTAL AGGREGATE LIABILITY ARISING UNDER ANY CLAIM RELATING TO THESE TERMS SHALL BE LIMITED TO THE TOTAL FEES PAID BY THE CLIENT TO CANKAL SOFTWARE IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO LIABILITY, OR £10 IN RESPECT OF FREE TOOL USAGE.
          </p>
          <p className="text-muted-foreground text-xs">
            Nothing in these Terms limits or excludes liability for death or personal injury caused by negligence, fraud, or fraudulent misrepresentation.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            8. Governing Law &amp; Jurisdiction
          </h2>
          <p className="text-muted-foreground">
            These Terms, and any dispute or claim arising out of or in connection with them or their subject matter or formation (including non-contractual disputes or claims), shall be governed by and construed in accordance with the <strong>laws of England and Wales</strong>.
          </p>
          <p className="text-muted-foreground">
            The courts of England and Wales shall have exclusive jurisdiction to settle any dispute or claim arising out of or in connection with these Terms.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-3 border-t border-black/10 dark:border-white/10 pt-6">
          <h2 className="text-xl font-bold text-foreground">
            9. Contact Information
          </h2>
          <p className="text-muted-foreground">
            For contractual enquiries, legal notices, or partnership terms, please contact:
          </p>
          <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 text-sm space-y-1">
            <p className="font-bold text-foreground">Cankal Software and IT Consultancy Ltd.</p>
            <p className="text-muted-foreground">United Kingdom</p>
            <p className="text-muted-foreground">Email: info@cankalsoftware.com</p>
          </div>
        </section>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 rounded-3xl glass border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-base">Ready to start an enterprise project with clear terms?</h4>
          <p className="text-xs text-muted-foreground">Contact our consultancy team for custom SOWs, NDAs, and enterprise contracts.</p>
        </div>
        <Link
          href="/contact"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#b52bff] text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shrink-0"
        >
          <span>Initiate Project Consultation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
