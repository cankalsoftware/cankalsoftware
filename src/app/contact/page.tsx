"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GlassContainer } from "@/components/UIComponents";
import { Mail, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setStatus("success");
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="py-12 md:py-20 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Get in <span className="text-[#2563eb] dark:text-[#b52bff]">Touch</span></h1>
        <p className="text-lg text-muted-foreground">Ready to start your next big project? Let's talk.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GlassContainer className="h-full">
            <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-4">Contact Details</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-blue-500/10 text-blue-600 dark:text-[#00f0ff]">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">Email Us</p>
                  <a href="mailto:info@cankalsoftware.com" className="opacity-80 hover:text-[#00f0ff] transition-colors">info@cankalsoftware.com</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-blue-500/10 text-blue-600 dark:text-[#b52bff]">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">Registered Office</p>
                  <p className="opacity-80">Cankal Software and IT Consultancy Ltd.</p>
                  <p className="opacity-80">United Kingdom</p>
                </div>
              </div>
            </div>
          </GlassContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <GlassContainer>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                <input required type="text" id="name" name="name" className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 transition-all" placeholder="John Doe" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                <input required type="email" id="email" name="email" className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 transition-all" placeholder="john@example.com" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                <textarea required id="message" name="message" rows={4} className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 transition-all resize-none" placeholder="How can we help you?"></textarea>
              </div>
              <button 
                type="submit" 
                disabled={status === "loading"}
                className="mt-2 w-full py-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-gradient-to-r dark:from-[#b52bff] dark:to-[#00f0ff] dark:hover:opacity-90 text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {status === "loading" ? "Sending..." : <>Send Message <Send className="w-4 h-4" /></>}
              </button>
              
              {status === "success" && <p className="text-green-500 text-center text-sm mt-2">Message sent successfully!</p>}
              {status === "error" && <p className="text-red-500 text-center text-sm mt-2">Failed to send message. Please try again later.</p>}
            </form>
          </GlassContainer>
        </motion.div>
      </div>
    </div>
  );
}
