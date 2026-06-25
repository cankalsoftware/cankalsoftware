"use client";

import { motion } from "framer-motion";
import { GlassContainer } from "@/components/UIComponents";
import { Award, BrainCircuit, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="py-12 md:py-20 flex flex-col gap-16">
      <section className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">About <span className="text-[#2563eb] dark:text-[#00f0ff]">Us</span></h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            At Cankal Software & IT Consultancy Ltd., we don't just build software. We architect the future using advanced Artificial Intelligence, Machine Learning, and cutting-edge web technologies.
          </p>
        </motion.div>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        {[
          { icon: <BrainCircuit className="w-8 h-8 mb-4 text-[#b52bff]" />, title: "AI-First Approach", desc: "Every solution we design is built with intelligence at its core, enabling businesses to scale efficiently." },
          { icon: <Users className="w-8 h-8 mb-4 text-[#00f0ff]" />, title: "Client-Centric", desc: "From customized SaaS platforms to immersive landing pages, we prioritize our clients' vision and success." },
          { icon: <Award className="w-8 h-8 mb-4 text-[#2563eb]" />, title: "Premium Quality", desc: "We deliver high-end, aesthetic, and robust applications that stand out in today's digital landscape." },
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
              <p className="text-sm opacity-80">{item.desc}</p>
            </GlassContainer>
          </motion.div>
        ))}
      </section>

      <section>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <GlassContainer className="p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-6 border-b border-white/10 pb-4">Our Vision</h2>
            <div className="space-y-4 opacity-90 leading-relaxed">
              <p>
                Founded with a passion for innovation, Cankal Software and IT Consultancy Ltd. operates at the intersection of technology and creativity. Our journey began with a clear mission: to democratize access to high-tier AI and ML tools through intuitive SaaS platforms.
              </p>
              <p>
                Today, our portfolio ranges from complex computer vision projects like <strong>Firevision</strong>, to high-traffic consumer websites, and sophisticated predictive models for finance. We believe that technology should be as beautiful as it is functional—which is why our designs push the boundaries of modern UI/UX.
              </p>
            </div>
          </GlassContainer>
        </motion.div>
      </section>
    </div>
  );
}
