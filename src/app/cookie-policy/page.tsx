import Link from "next/link";
import { Cookie, ShieldCheck, Settings, ArrowRight } from "lucide-react";

export default function CookiePolicyPage() {
  const lastUpdated = "October 3, 2026";

  const cookieInventory = [
    {
      name: "theme",
      provider: "cankalsoftware.com",
      type: "Essential / First-Party",
      purpose: "Stores user theme preference (Dark Mode or Light Mode) across page navigation.",
      duration: "1 Year",
    },
    {
      name: "cankal_monthly_scan_quota",
      provider: "cankalsoftware.com (Local Storage)",
      type: "Essential / Functional",
      purpose: "Maintains anonymous monthly free scan count (max 10 scans/month) on the user's browser without tracking personal data.",
      duration: "Monthly Reset",
    },
    {
      name: "_ga, _ga_*",
      provider: "Google Analytics 4",
      type: "Analytics / Performance",
      purpose: "Collects aggregated, anonymised visitor statistics to understand website traffic and tool usage.",
      duration: "2 Years",
    },
    {
      name: "_fbp",
      provider: "Meta Platforms Ireland Ltd.",
      type: "Marketing / Attribution",
      purpose: "Measures conversion effectiveness of Facebook and Instagram campaigns for Cankal Software.",
      duration: "90 Days",
    },
    {
      name: "_clsk, _clck, MUID",
      provider: "Microsoft Corporation (Bing / Clarity)",
      type: "Analytics & Webmaster",
      purpose: "Collects anonymous telemetry and search indexing diagnostics via Bing Webmaster Tools.",
      duration: "1 Year",
    },
    {
      name: "_grecaptcha",
      provider: "Google LLC",
      type: "Security / Essential",
      purpose: "Provides automated risk analysis on contact form submissions and free tool scans to prevent bot spam and abuse.",
      duration: "6 Months",
    },
  ];

  return (
    <div className="py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
      {/* Header */}
      <div className="space-y-4 border-b border-black/10 dark:border-white/10 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <Cookie className="w-3.5 h-3.5" />
          <span>UK PECR &amp; ePrivacy Directive Compliant</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Cookie Policy
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
            1. What Are Cookies?
          </h2>
          <p className="text-muted-foreground">
            Cookies are small text files placed on your computer or mobile device when you visit websites. They are widely used to make websites function efficiently, enhance user experience, and provide analytical reporting to website operators.
          </p>
          <p className="text-muted-foreground">
            This Cookie Policy explains how <strong>Cankal Software and IT Consultancy Ltd.</strong> (&quot;Cankal Software&quot;, &quot;we&quot;, &quot;us&quot;) uses cookies and similar tracking technologies (such as local storage and tracking pixels) on <a href="https://cankalsoftware.com" className="text-[#2563eb] dark:text-[#00f0ff] underline">https://cankalsoftware.com</a>.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            2. Categories of Cookies We Use
          </h2>
          <div className="space-y-4 pt-2">
            <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-2">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                A. Strictly Necessary &amp; Security Cookies
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                These cookies are essential for the operation of our website, enabling core features such as secure session routing, theme memory, and Google reCAPTCHA v3 spam mitigation. They cannot be switched off in our systems.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-2">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                B. Performance &amp; Analytics Cookies
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                These cookies allow us to count page visits, analyse user journeys, and measure usage of our free tools (AEO Scanner &amp; Vulnerability Check) using Google Analytics 4. All data is collected in an aggregated, anonymous format.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-2">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                C. Marketing &amp; Conversion Pixels
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                We use the Meta Pixel to evaluate the effectiveness of our business advertising campaigns on Facebook and Instagram and track lead enquiries generated through our marketing funnels.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            3. Detailed Cookie Inventory Table
          </h2>
          <div className="rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden bg-black/5 dark:bg-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 font-bold text-foreground">
                    <th className="p-3.5">Cookie Name</th>
                    <th className="p-3.5">Provider</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Duration</th>
                    <th className="p-3.5">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5 text-muted-foreground">
                  {cookieInventory.map((c, i) => (
                    <tr key={i} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-foreground">{c.name}</td>
                      <td className="p-3.5">{c.provider}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-black/5 dark:bg-white/10">
                          {c.type}
                        </span>
                      </td>
                      <td className="p-3.5">{c.duration}</td>
                      <td className="p-3.5 text-xs">{c.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            4. Managing &amp; Controlling Your Cookie Preferences
          </h2>
          <p className="text-muted-foreground">
            Most web browsers allow you to manage your cookie preferences through browser settings. You can set your browser to refuse all cookies, notify you when a cookie is sent, or delete existing cookies.
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-xs md:text-sm">
            <li><strong>Google Chrome:</strong> Settings &gt; Privacy and Security &gt; Cookies and other site data</li>
            <li><strong>Mozilla Firefox:</strong> Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data</li>
            <li><strong>Apple Safari:</strong> Preferences &gt; Privacy &gt; Manage Website Data</li>
            <li><strong>Microsoft Edge:</strong> Settings &gt; Cookies and site permissions &gt; Manage and delete cookies</li>
          </ul>
          <p className="text-muted-foreground text-xs pt-2">
            Please note that disabling strictly necessary cookies may impact the display or functionality of certain features on our website.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 border-t border-black/10 dark:border-white/10 pt-6">
          <h2 className="text-xl font-bold text-foreground">
            5. Enquiries &amp; Policy Updates
          </h2>
          <p className="text-muted-foreground">
            We may update this Cookie Policy periodically to reflect technological changes or regulatory updates. For questions, please reach out to:
          </p>
          <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 text-sm space-y-1">
            <p className="font-bold text-foreground">Cankal Software and IT Consultancy Ltd.</p>
            <p className="text-muted-foreground">Email: info@cankalsoftware.com</p>
          </div>
        </section>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 rounded-3xl glass border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-base">Looking for enterprise software engineering?</h4>
          <p className="text-xs text-muted-foreground">Discover how Cankal Software builds privacy-first AI and SaaS architectures.</p>
        </div>
        <Link
          href="/contact"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#00f0ff] text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shrink-0"
        >
          <span>Contact Us</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
