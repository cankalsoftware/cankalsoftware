"use client";

import { motion } from "framer-motion";
import { GlassContainer } from "@/components/UIComponents";
import {
  Award,
  BrainCircuit,
  Users,
  Code2,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Globe2,
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="pt-4 pb-12 md:pt-6 md:pb-16 flex flex-col gap-12">
      {/* Header Section */}
      <section className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 border border-[#2563eb]/30 dark:border-[#b52bff]/30 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-[#2563eb] dark:text-[#b52bff]" />
            <span>UK Registered IT Consultancy & AI Lab</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About <span className="text-[#2563eb] dark:text-[#00f0ff]">Cankal Software</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            At Cankal Software & IT Consultancy Ltd., we architect modern digital intelligence.
            From proprietary computer vision platforms to enterprise SaaS and high-converting web applications,
            we deliver scalable technology built to outperform.
          </p>
        </motion.div>
      </section>

      {/* Founder & Leadership Spotlight (E-E-A-T) */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <GlassContainer className="p-8 md:p-12 relative overflow-hidden border border-blue-500/20 dark:border-[#b52bff]/30">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-1 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-white/10 pb-8 md:pb-0 md:pr-8">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-[#2563eb] via-[#9333ea] to-[#00f0ff] p-1 mb-4 shadow-xl shadow-blue-500/20">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl font-black text-white">
                    AC
                  </div>
                </div>
                <h2 className="text-2xl font-bold">Ali Cankal</h2>
                <p className="text-sm font-medium text-[#2563eb] dark:text-[#00f0ff] mt-1">
                  Founder & Principal AI Architect
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <a
                    href="https://alicankal.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2563eb]/10 hover:bg-[#2563eb]/20 text-[#2563eb] dark:text-[#00f0ff] border border-[#2563eb]/30 transition-all"
                  >
                    <Globe2 className="w-3.5 h-3.5" /> alicankal.com <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://linkedin.com/company/cankal_software"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                  >
                    LinkedIn <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-blue-500 dark:text-purple-400">
                  <Code2 className="w-4 h-4" /> Founder & Engineering Philosophy
                </div>
                <h3 className="text-xl md:text-2xl font-bold">
                  Bridging Cutting-Edge AI Research with High-Impact Business Reality
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Led by Ali Cankal, Cankal Software combines deep technical mastery in Machine Learning, Computer Vision, and Next.js full-stack engineering with real-world business acumen. From conceptualising and deploying <strong>Firevision</strong> to building customised operational software for high-growth businesses, every project is engineered with precision, security, and speed.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {[
                    "AI System Design",
                    "Computer Vision",
                    "Next.js & Cloud",
                    "SaaS Architecture",
                    "AI Governance",
                    "Custom ERP & OS",
                  ].map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00f0ff]" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassContainer>
        </motion.div>
      </section>

      {/* Core Values Section */}
      <section className="grid md:grid-cols-3 gap-8">
        {[
          {
            icon: <BrainCircuit className="w-8 h-8 mb-4 text-[#b52bff]" />,
            title: "AI-First Engineering",
            desc: "Every architecture is designed with intelligent automation at its core, enabling exponential scalability and operational efficiency.",
          },
          {
            icon: <Users className="w-8 h-8 mb-4 text-[#00f0ff]" />,
            title: "Client-Centred Execution",
            desc: "We partner directly with founders, executives, and enterprise teams to turn friction points into high-ROI digital solutions.",
          },
          {
            icon: <Award className="w-8 h-8 mb-4 text-[#2563eb]" />,
            title: "Uncompromising Quality",
            desc: "We don't build generic templates. Every line of code is bespoke, high-performance, and designed to stand out visually.",
          },
        ].map((item, idx) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <GlassContainer className="h-full flex flex-col items-center text-center">
              {item.icon}
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </GlassContainer>
          </motion.div>
        ))}
      </section>

      {/* Vision & UK Identity */}
      <section>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <GlassContainer className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
              <div className="space-y-4 max-w-3xl">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#2563eb] dark:text-[#00f0ff]">
                  <ShieldCheck className="w-4 h-4" /> UK Registered Company
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">Our Vision &amp; Commitment</h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Headquartered in the United Kingdom, Cankal Software &amp; IT Consultancy Ltd. provides international clients with tier-one software engineering and consulting. We believe modern software must be aesthetically breathtaking, lightning fast, and deeply intelligent.
                </p>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Whether you are looking to deploy specialised AI models, build a new SaaS product, or optimise your business workflows, we provide end-to-end strategy, development, and long-term support.
                </p>
              </div>
              <div className="w-full md:w-auto shrink-0 flex flex-col gap-3">
                <Link
                  href="/contact"
                  className="px-6 py-3 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-gradient-to-r dark:from-[#b52bff] dark:to-[#00f0ff] text-white text-center font-semibold text-sm transition-all shadow-lg"
                >
                  Work With Us
                </Link>
                <a
                  href="https://alicankal.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl glass glass-hover text-center font-semibold text-sm transition-all flex items-center justify-center gap-1.5"
                >
                  Visit alicankal.com <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </GlassContainer>
        </motion.div>
      </section>
    </div>
  );
}
