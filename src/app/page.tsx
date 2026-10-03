"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectCard, GlassContainer } from "@/components/UIComponents";
import { ClientStoryCard } from "@/components/ClientStoryCard";
import { AeoScannerWidget } from "@/components/AeoScannerWidget";
import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Cpu,
  Rocket,
  BrainCircuit,
  Workflow,
  ShieldCheck,
  ShieldAlert,
  Users,
  CalendarDays,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  Award,
  Zap,
  Globe2,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const saasProjects = [
    {
      title: "Firevision",
      description: "AI-powered fire detection, security surveillance, and real-time monitoring system.",
      link: "https://firevision.uk",
      tags: ["AI", "Computer Vision", "SaaS", "Edge IoT"],
    },
    {
      title: "Evacuation App",
      description: "Smart dynamic evacuation routing and real-time emergency safety platform.",
      link: "https://www.firevision.uk/evacuation-app",
      tags: ["Mobile App", "Safety", "Real-time", "Geo-Routing"],
    },
    {
      title: "Forex Tracker & Prediction",
      description: "Machine learning driven Forex market analytics and predictive forecasting.",
      link: "#",
      tags: ["ML", "Finance", "Predictive Analytics"],
    },
    {
      title: "Google Scrape App",
      description: "Automated Google Search and Maps lead generation, data extraction, and business intelligence tool.",
      link: "https://github.com/cankalsoftware/Google-Scrape",
      tags: ["Python", "Automation", "Data Scraping", "Open Source"],
    },
  ];

  const clientProjects = [
    {
      title: "Yangincim",
      link: "https://yangincim.com",
      problem: "Inefficient fire safety management system requiring manual oversight.",
      solution: "Developed an AI-powered fire detection and monitoring system with smart sensor integration.",
      results: "Reduced response times, improved safety compliance, and cut operational costs by 30%.",
    },
    {
      title: "Uzman Yangin",
      link: "https://www.uzman-yangin.com",
      problem: "Outdated website and lack of digital presence for a leading fire safety company.",
      solution: "Designed and developed a modern, responsive website with seamless UI/UX and inquiry pipelines.",
      results: "Increased online inquiries by 50% and enhanced corporate brand credibility.",
    },
    {
      title: "Dardayim",
      link: "https://dardayim.com",
      problem: "Need for a robust e-commerce platform to sell handmade goods online.",
      solution: "Built a secure, scalable e-commerce platform with automated payment gateways and inventory.",
      results: "Achieved a 40% increase in sales within 6 months and expanded customer reach globally.",
    },
    {
      title: "Ali Cankal",
      link: "https://alicankal.com",
      problem: "Personal branding and engineering hub required to showcase AI projects and expertise.",
      solution: "Crafted a minimalist portfolio website highlighting key systems, skills, and client links.",
      results: "Established strong developer authority and a centralized digital portfolio.",
    },
    {
      title: "Go to Altinkum",
      link: "https://gotoaltinkum.com",
      problem: "Outdated travel guide website with poor navigation and mobile compatibility.",
      solution: "Revamped the website with modern design, intuitive discovery, and fast mobile responsiveness.",
      results: "Improved user engagement by 60% and boosted regional tourism bookings.",
    },
    {
      title: "CBT-OS",
      link: "https://cbt-os.com",
      problem: "Complex internal systems requiring a streamlined operating system for cognitive-behavioral therapy.",
      solution: "Developed a custom clinical operating system to manage patient data, therapy sessions, and progress tracking.",
      results: "Increased therapist administrative efficiency by 25%, prioritizing direct patient care.",
    },
    {
      title: "Handmade to Order",
      link: "https://handmadetoorder.uk",
      problem: "Growing demand for custom handmade products, needing a bespoke order customization platform.",
      solution: "Created an interactive e-commerce platform with live product customization and secure checkout.",
      results: "Boosted custom order volume by 35% and streamlined artisan order fulfillment.",
    },
    {
      title: "Mentorin AI",
      link: "https://mentorinai.com",
      problem: "Startup requiring an AI-driven platform for smart mentorship matching and career pathing.",
      solution: "Developed an intelligent machine learning matching algorithm for mentees and industry mentors.",
      results: "Successfully launched the platform, onboarding high-profile mentors across tech and business.",
    },
  ];

  const faqs = [
    {
      q: "What services does Cankal Software provide?",
      a: "We specialize in end-to-end AI Transformation, Machine Learning & Computer Vision systems (such as Firevision), high-performance custom SaaS platforms, and bespoke web application engineering using modern stacks like Next.js and Cloud native infrastructure.",
    },
    {
      q: "How can AI Transformation benefit my existing business?",
      a: "We replace manual, error-prone workflows with structured AI automations, implement secure enterprise AI governance, and build custom predictive or generative models that directly reduce operational costs and accelerate growth.",
    },
    {
      q: "Who leads the development and architecture at Cankal Software?",
      a: "All architecture and development is led by founder Ali Cankal (https://alicankal.com), a veteran software architect specializing in AI systems, Computer Vision, and full-stack engineering, backed by a dedicated UK-registered consultancy team.",
    },
    {
      q: "What is your typical project timeline and delivery process?",
      a: "Timelines vary depending on scope: modern web applications and AI workflow integrations typically take 2 to 4 weeks, while complex full-scale SaaS platforms or custom ML models take 6 to 12 weeks. We work in transparent, agile milestones with continuous testing and weekly updates.",
    },
    {
      q: "Do you offer ongoing support and cloud maintenance after launch?",
      a: "Yes. We offer long-term support packages including cloud infrastructure monitoring, security audits, AI model fine-tuning, and continuous feature expansion to ensure 99.9% uptime and high performance.",
    },
    {
      q: "How do I start a project or request a proposal?",
      a: "You can book a consultancy call or send us a message via our Contact page. We analyze your requirements and provide a clear technical roadmap, architecture plan, and cost estimate within 24 to 48 hours.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <div className="flex flex-col gap-24 pb-12">
      {/* Dynamic FAQ Schema for AEO & Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Section */}
      <section className="pt-4 sm:pt-8 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 border border-[#2563eb]/30 dark:border-[#b52bff]/30 text-sm font-medium">
            <Cpu className="w-4 h-4 text-[#2563eb] dark:text-[#b52bff]" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] to-[#1e3a8a] dark:from-[#b52bff] dark:to-[#00f0ff]">
              Innovating with AI & Machine Learning
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
              We Turn Your{" "}
            </span>
            <span className="relative inline-block">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] to-[#1e3a8a] dark:from-[#b52bff] dark:to-[#00f0ff]">
                Problems
              </span>
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
              Into Powerful{" "}
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] to-[#1e3a8a] dark:from-[#b52bff] dark:to-[#00f0ff]">
              Solutions
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 opacity-80 leading-relaxed">
            Premium SaaS products, custom AI systems, and high-converting web applications, engineered by Cankal Software & IT Consultancy Ltd.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-gradient-to-r dark:from-[#b52bff] dark:to-[#00f0ff] dark:hover:opacity-90 text-white font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] dark:shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2"
            >
              Start Your Project <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#portfolio"
              className="px-8 py-4 rounded-xl glass glass-hover font-semibold transition-all flex items-center justify-center gap-2"
            >
              View Portfolio <Code2 className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>

        {/* Social Proof & Metrics Strip (High-Conversion Hook for Ads) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 w-full max-w-5xl"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl glass border border-white/10 text-center">
            <div className="p-3">
              <div className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] to-[#00f0ff]">
                10+
              </div>
              <p className="text-xs text-muted-foreground mt-1">Enterprise Systems Built</p>
            </div>
            <div className="p-3 border-l border-white/10">
              <div className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#9333ea] to-[#b52bff]">
                UK Reg.
              </div>
              <p className="text-xs text-muted-foreground mt-1">Official IT Consultancy</p>
            </div>
            <div className="p-3 border-l-0 md:border-l border-white/10">
              <div className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] to-[#00f0ff]">
                99.9%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Cloud Reliability & Uptime</p>
            </div>
            <div className="p-3 border-l border-white/10">
              <div className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#9333ea] to-[#b52bff]">
                100%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Bespoke AI Architecture</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* AI Transformation Services */}
      <section id="ai-transformation" className="pt-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BrainCircuit className="w-10 h-10 text-[#2563eb] dark:text-[#b52bff]" />
              <h2 className="text-3xl md:text-5xl font-bold">AI Transformation</h2>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              We help you effectively integrate AI into your business to solve problems, accelerate growth, and work smarter.
            </p>
          </div>

          {/* AEO & LLM Search Readiness Scanner Feature */}
          <div className="mb-10">
            <AeoScannerWidget />
          </div>

          {/* Cyber Security & Vulnerability Check Feature Banner */}
          <div className="mb-16 p-6 rounded-3xl glass border border-blue-500/20 dark:border-[#b52bff]/30 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#00f0ff] flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base md:text-lg">New: Free Cyber Security &amp; Vulnerability Check</h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    CVE • NVD
                  </span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                  Audit your website against MITRE CVE, NIST NVD, and NCSC UK Cyber Essentials standards.
                </p>
              </div>
            </div>
            <Link
              href="/vulnerability-check"
              className="px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-gradient-to-r dark:from-[#b52bff] dark:to-[#00f0ff] dark:hover:opacity-90 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-1.5 shrink-0"
            >
              <span>Launch Security Check</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Case Study 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass p-8 rounded-2xl border border-gray-200/50 dark:border-white/10 hover:border-[#2563eb]/50 dark:hover:border-[#b52bff]/50 transition-all flex flex-col h-full"
            >
              <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 text-[#2563eb] dark:text-[#00f0ff]">
                <Workflow className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Automated AI Workflows</h3>
              <p className="text-muted-foreground flex-grow">
                <strong>The Challenge:</strong> Teams manually copy-pasting data using basic tools.<br /><br />
                <strong>Our Solution:</strong> We design structured, automated AI workflows and robust, scalable pipelines with measurable business outcomes.
              </p>
            </motion.div>

            {/* Case Study 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass p-8 rounded-2xl border border-gray-200/50 dark:border-white/10 hover:border-[#2563eb]/50 dark:hover:border-[#b52bff]/50 transition-all flex flex-col h-full"
            >
              <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6 text-[#9333ea] dark:text-[#b52bff]">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Safe AI & Governance</h3>
              <p className="text-muted-foreground flex-grow">
                <strong>The Challenge:</strong> Teams adopting unapproved AI tools without security controls.<br /><br />
                <strong>Our Solution:</strong> We establish AI Governance and safe testing environments with auditable trails for compliant multimodal AI generation.
              </p>
            </motion.div>

            {/* Case Study 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass p-8 rounded-2xl border border-gray-200/50 dark:border-white/10 hover:border-[#2563eb]/50 dark:hover:border-[#b52bff]/50 transition-all flex flex-col h-full"
            >
              <div className="w-14 h-14 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-6 text-teal-600 dark:text-teal-400">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI Change Leadership</h3>
              <p className="text-muted-foreground flex-grow">
                <strong>The Challenge:</strong> Staff anxiety and friction adopting new AI workflows.<br /><br />
                <strong>Our Solution:</strong> We use Change Leadership to manage the transition smoothly, upskilling teams and driving confident adoption of new technologies.
              </p>
            </motion.div>
          </div>

          {/* CTA Banner */}
          <div className="text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 p-10 rounded-3xl border border-gray-200 dark:border-gray-800">
            <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Whether you need to automate workflows, build proprietary SaaS, or scale your web application, we guide your digital journey with precision.
            </p>
            <Link
              href="/contact"
              className="inline-flex px-8 py-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-gradient-to-r dark:from-[#b52bff] dark:to-[#00f0ff] dark:hover:opacity-90 text-white font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] dark:shadow-[0_0_20px_rgba(0,240,255,0.4)] items-center justify-center gap-2"
            >
              <CalendarDays className="w-5 h-5" /> Book a Free Consultation Call
            </Link>
          </div>
        </motion.div>
      </section>

      {/* SaaS Portfolio */}
      <section id="portfolio" className="pt-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Rocket className="w-8 h-8 text-[#2563eb] dark:text-[#b52bff]" />
              <h2 className="text-3xl md:text-4xl font-bold">Our SaaS Products</h2>
            </div>
            <p className="text-lg md:text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] to-[#1e3a8a] dark:from-[#b52bff] dark:to-[#00f0ff] ml-11">
              Shaping the Future of Intelligent Software
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {saasProjects.map((project, idx) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <ProjectCard {...project} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Client Portfolio */}
      <section>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Client Success Stories</h2>
              <p className="text-muted-foreground mt-2">
                Proven results delivered for founders, brands, and specialized enterprises.
              </p>
            </div>
            <a
              href="https://alicankal.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563eb] dark:text-[#00f0ff] hover:underline"
            >
              View More on alicankal.com <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {clientProjects.map((project, idx) => (
              <ClientStoryCard
                key={project.title}
                title={project.title}
                link={project.link}
                problem={project.problem}
                solution={project.solution}
                results={project.results}
                idx={idx}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Founder Spotlight Banner (E-E-A-T & Trust) */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <GlassContainer className="p-8 md:p-10 border border-blue-500/20 dark:border-[#b52bff]/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5 text-left">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#2563eb] to-[#00f0ff] p-0.5 shrink-0">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xl font-bold text-white">
                    AC
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">Engineered by Ali Cankal</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-[#00f0ff]">
                      Founder & Lead Architect
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Specialist in Machine Learning, Computer Vision systems, and modern SaaS development based in the UK.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <a
                  href="https://alicankal.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Globe2 className="w-4 h-4" /> alicankal.com <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <Link
                  href="/about"
                  className="px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-gradient-to-r dark:from-[#b52bff] dark:to-[#00f0ff] text-white text-sm font-semibold transition-all"
                >
                  About Our Team
                </Link>
              </div>
            </div>
          </GlassContainer>
        </motion.div>
      </section>

      {/* Interactive FAQ Section (AEO, SEO, & Conversion Rate Boost) */}
      <section id="faq" className="pt-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4 border border-[#2563eb]/30 dark:border-[#b52bff]/30 text-sm font-medium">
              <HelpCircle className="w-4 h-4 text-[#2563eb] dark:text-[#b52bff]" />
              <span>Got Questions? We Have Answers</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about working with Cankal Software, our development cycle, and AI integrations.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="glass border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-500/40"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-6 text-left flex justify-between items-center gap-4 focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="font-bold text-base md:text-lg">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 transition-transform duration-300 text-blue-500 dark:text-[#00f0ff] ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6 text-sm md:text-base text-muted-foreground leading-relaxed border-t border-white/5 pt-4">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Final Conversion Call To Action */}
      <section className="pt-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative overflow-hidden rounded-3xl p-10 md:p-16 text-center glass border border-blue-500/30 dark:border-[#b52bff]/40 shadow-2xl">
            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-600 dark:text-[#00f0ff] text-xs font-semibold mb-6">
                <Zap className="w-3.5 h-3.5" /> High-Impact Digital Execution
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">
                Ready to Launch or Modernize Your Platform?
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-8">
                Connect with our UK engineering team today. Let’s turn your vision into a scalable, high-performance reality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="px-8 py-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-gradient-to-r dark:from-[#b52bff] dark:to-[#00f0ff] text-white font-bold text-base transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  Schedule a Consultation <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="mailto:info@cankalsoftware.com"
                  className="px-8 py-4 rounded-xl glass glass-hover font-semibold text-base transition-all flex items-center justify-center gap-2"
                >
                  Email Us Directly
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
