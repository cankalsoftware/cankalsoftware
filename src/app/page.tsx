"use client";

import { motion } from "framer-motion";
import { ProjectCard } from "@/components/UIComponents";
import Link from "next/link";
import { ArrowRight, Code2, Cpu, Rocket } from "lucide-react";

export default function Home() {
  const saasProjects = [
    { title: "Firevision", description: "AI-powered fire detection and monitoring system.", link: "https://firevision.uk", tags: ["AI", "Computer Vision", "SaaS"] },
    { title: "Evacuation App", description: "Smart evacuation routing and management platform.", link: "#", tags: ["Mobile App", "Safety", "Real-time"] },
    { title: "Forex Tracker & Prediction", description: "Machine learning driven Forex market prediction.", link: "#", tags: ["ML", "Finance", "Predictive Analytics"] },
    { title: "Arcade Games", description: "Interactive and engaging arcade game experiences.", link: "#", tags: ["Gaming", "Entertainment"] },
  ];

  const clientProjects = [
    { title: "Yangincim", link: "https://yangincim.com" },
    { title: "Usman Yangin", link: "https://usman-yangin.com" },
    { title: "Dardayim", link: "https://dardayim.com" },
    { title: "Ali Cankal", link: "https://alicankal.com" },
    { title: "Go to Altinkum", link: "https://gotoaltinkum.com" },
    { title: "CBT-OS", link: "https://cbt-os.com" },
    { title: "Handmade to Order", link: "https://handmadetoorder.uk" },
    { title: "Mentorin AI", link: "https://mentorinai.com" },
  ];

  return (
    <div className="flex flex-col gap-24 pb-12">
      {/* Hero Section */}
      <section className="pt-20 lg:pt-32 flex flex-col items-center text-center">
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
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
            Shaping the Future <br className="hidden md:block" /> of <span className="text-[#2563eb] dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-[#b52bff] dark:to-[#00f0ff]">Software Solutions</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 opacity-80">
            Premium SaaS products and AI-driven web development, crafted by Cankal Software & IT Consultancy Ltd.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-8 py-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-gradient-to-r dark:from-[#b52bff] dark:to-[#00f0ff] dark:hover:opacity-90 text-white font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] dark:shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2">
              Start Your Project <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#portfolio" className="px-8 py-4 rounded-xl glass glass-hover font-semibold transition-all flex items-center justify-center gap-2">
              View Portfolio <Code2 className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* SaaS Portfolio */}
      <section id="portfolio" className="pt-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Rocket className="w-8 h-8 text-[#2563eb] dark:text-[#b52bff]" />
            <h2 className="text-3xl md:text-4xl font-bold">Our SaaS Products</h2>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Client Success Stories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {clientProjects.map((project, idx) => (
              <motion.a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                key={project.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="glass glass-hover p-6 rounded-2xl flex items-center justify-center text-center font-medium h-24 hover:text-[#2563eb] dark:hover:text-[#00f0ff]"
              >
                {project.title}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
