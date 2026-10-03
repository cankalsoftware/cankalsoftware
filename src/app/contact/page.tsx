"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { GlassContainer } from "@/components/UIComponents";
import {
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  Globe2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { trackFbEvent } from "@/components/MetaPixel";

function ContactFormContent() {
  const searchParams = useSearchParams();
  const domainParam = searchParams.get("domain") || "";
  const scoreParam = searchParams.get("score") || "";
  const gradeParam = searchParams.get("grade") || "";
  const issuesParam = searchParams.get("issues") || "";

  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const { executeRecaptcha } = useGoogleReCaptcha();

  useEffect(() => {
    if (domainParam) {
      const defaultText = `Hello Cankal Software,\n\nI ran a Vulnerability Check on my website (${domainParam})${
        gradeParam ? ` which received Grade ${gradeParam} (Score: ${scoreParam}/100)` : ""
      }${issuesParam ? ` with ${issuesParam}` : ""}.\n\nWe would like assistance resolving these security vulnerabilities and hardening our infrastructure. Please get in touch with us regarding your remediation services.`;
      setMessage(defaultText);
    }
  }, [domainParam, scoreParam, gradeParam, issuesParam]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");

    if (!executeRecaptcha) {
      console.error("reCAPTCHA not available");
      setStatus("error");
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    const token = await executeRecaptcha("contact_form");
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      recaptchaToken: token,
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setStatus("success");
        trackFbEvent("Lead", {
          content_name: "Contact Form Submission",
          status: "success",
        });
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
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
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Get in <span className="text-[#2563eb] dark:text-[#b52bff]">Touch</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Ready to transform your business with AI, deploy a custom SaaS, or build a hardened, high-performance web platform? Let&apos;s discuss your project.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GlassContainer className="h-full flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-4">
                Consultancy &amp; Inquiries
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-blue-500/10 text-blue-600 dark:text-[#00f0ff]">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Direct Email</p>
                    <a
                      href="mailto:info@cankalsoftware.com"
                      className="text-sm opacity-80 hover:text-[#00f0ff] transition-colors"
                    >
                      info@cankalsoftware.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-purple-500/10 text-purple-600 dark:text-[#b52bff]">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Registered Headquarters</p>
                    <p className="text-sm opacity-80">
                      Cankal Software and IT Consultancy Ltd.
                    </p>
                    <p className="text-sm opacity-80">United Kingdom</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-teal-500/10 text-teal-600 dark:text-[#00f0ff]">
                    <Globe2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Founder &amp; Principal Lead</p>
                    <a
                      href="https://alicankal.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 dark:text-[#00f0ff] inline-flex items-center gap-1 hover:underline"
                    >
                      Ali Cankal Portfolio <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-[#00f0ff]" />
                <span>Guaranteed 24-48h Response &amp; NDA Protected</span>
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
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Your Name / Company
                </label>
                <input
                  required
                  type="text"
                  id="name"
                  name="name"
                  className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 transition-all text-sm"
                  placeholder="e.g. John Doe or Acme Corp"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Work Email
                </label>
                <input
                  required
                  type="email"
                  id="email"
                  name="email"
                  className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 transition-all text-sm"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Project Brief or Inquiry
                </label>
                <textarea
                  required
                  id="message"
                  name="message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 transition-all resize-none text-sm"
                  placeholder="Tell us about your project goals, security requirements, or tech stack..."
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="mt-2 w-full py-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-gradient-to-r dark:from-[#b52bff] dark:to-[#00f0ff] dark:hover:opacity-90 text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-500/20"
              >
                {status === "loading" ? (
                  "Sending..."
                ) : (
                  <>
                    Submit Project Inquiry <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              {status === "success" && (
                <div className="flex items-center justify-center gap-2 text-green-500 text-center text-sm mt-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Message sent successfully! We will reach out shortly.</span>
                </div>
              )}
              {status === "error" && (
                <p className="text-red-500 text-center text-sm mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  Failed to send message. Please try again or email info@cankalsoftware.com directly.
                </p>
              )}
            </form>
          </GlassContainer>
        </motion.div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-[#2563eb] rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <ContactFormContent />
    </Suspense>
  );
}
