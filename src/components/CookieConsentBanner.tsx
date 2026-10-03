"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, ShieldCheck, Settings, Check, X, ChevronRight, Lock } from "lucide-react";

declare global {
  interface Window {
    dataLayer?: Object[];
    gtag?: (...args: any[]) => void;
  }
}

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem("cankal_cookie_consent_v2");
    if (!savedConsent) {
      // Default to Google Consent Mode v2: Denied until user consents
      if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || [];
        function gtag(...args: unknown[]) {
          window.dataLayer?.push(args);
        }
        window.gtag = window.gtag || gtag;

        window.gtag("consent", "default", {
          analytics_storage: "denied",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
          wait_for_update: 500,
        });
      }
      setShowBanner(true);
    } else {
      try {
        const parsed = JSON.parse(savedConsent);
        updateGoogleConsent(parsed.analytics, parsed.marketing);
      } catch {
        setShowBanner(true);
      }
    }
  }, []);

  const updateGoogleConsent = (analytics: boolean, marketing: boolean) => {
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      }
      window.gtag = window.gtag || gtag;

      window.gtag("consent", "update", {
        analytics_storage: analytics ? "granted" : "denied",
        ad_storage: marketing ? "granted" : "denied",
        ad_user_data: marketing ? "granted" : "denied",
        ad_personalization: marketing ? "granted" : "denied",
      });
    }
  };

  const handleAcceptAll = () => {
    const consent = { necessary: true, analytics: true, marketing: true, timestamp: new Date().toISOString() };
    localStorage.setItem("cankal_cookie_consent_v2", JSON.stringify(consent));
    updateGoogleConsent(true, true);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleRejectNonEssential = () => {
    const consent = { necessary: true, analytics: false, marketing: false, timestamp: new Date().toISOString() };
    localStorage.setItem("cankal_cookie_consent_v2", JSON.stringify(consent));
    updateGoogleConsent(false, false);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleSavePreferences = () => {
    const consent = {
      necessary: true,
      analytics: analyticsConsent,
      marketing: marketingConsent,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("cankal_cookie_consent_v2", JSON.stringify(consent));
    updateGoogleConsent(analyticsConsent, marketingConsent);
    setShowBanner(false);
    setShowPreferences(false);
  };

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-xl z-50 pointer-events-auto"
          >
            <div className="p-6 rounded-3xl bg-white/95 dark:bg-[#070514]/95 border border-blue-500/20 dark:border-[#b52bff]/30 shadow-2xl backdrop-blur-2xl space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#00f0ff] flex items-center justify-center text-white shadow-md">
                    <Cookie className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-foreground">
                      Cookie &amp; Privacy Preferences
                    </h4>
                    <span className="text-[10px] font-semibold text-[#2563eb] dark:text-[#00f0ff] uppercase tracking-wider">
                      Google Consent Mode v2 &amp; UK PECR
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                We use strictly necessary cookies to ensure site functionality, and optional privacy-friendly Google Analytics &amp; Meta conversion pixels to understand tool usage. We respect your choice under UK GDPR and Google Consent Mode v2.
              </p>

              {/* Preferences Drawer */}
              {showPreferences && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="space-y-3 pt-2 border-t border-black/5 dark:border-white/5"
                >
                  <div className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-foreground block">Strictly Necessary &amp; Security</span>
                      <span className="text-[11px] text-muted-foreground">Session routing, theme preferences, and Google reCAPTCHA bot mitigation.</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Always Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 text-xs">
                    <div className="space-y-0.5 pr-2">
                      <span className="font-bold text-foreground block">Google Analytics 4</span>
                      <span className="text-[11px] text-muted-foreground">Aggregated, anonymous telemetry to measure tool visits.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={analyticsConsent}
                      onChange={(e) => setAnalyticsConsent(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2563eb] focus:ring-[#2563eb] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 text-xs">
                    <div className="space-y-0.5 pr-2">
                      <span className="font-bold text-foreground block">Marketing &amp; Attribution Pixels</span>
                      <span className="text-[11px] text-muted-foreground">Meta Pixel conversion attribution for marketing funnels.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={marketingConsent}
                      onChange={(e) => setMarketingConsent(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2563eb] focus:ring-[#2563eb] cursor-pointer"
                    />
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex items-center gap-2">
                  <Link
                    href="/cookie-policy"
                    className="text-[11px] text-muted-foreground hover:text-foreground underline"
                  >
                    Read Cookie Policy
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {showPreferences ? (
                    <button
                      type="button"
                      onClick={handleSavePreferences}
                      className="px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                    >
                      Save Preferences
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowPreferences(true)}
                        className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Customise</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRejectNonEssential}
                        className="px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold text-foreground transition-all cursor-pointer"
                      >
                        Reject Non-Essential
                      </button>
                      <button
                        type="button"
                        onClick={handleAcceptAll}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#00f0ff] hover:opacity-90 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                      >
                        Accept All
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Cookie Settings Button for Re-opening Preferences */}
      {!showBanner && (
        <button
          type="button"
          onClick={() => setShowBanner(true)}
          aria-label="Manage Cookie & Consent Preferences"
          title="Manage Cookie Preferences (Google Consent Mode v2)"
          className="fixed bottom-4 left-4 z-40 p-2.5 rounded-full bg-white/80 dark:bg-black/80 hover:bg-white dark:hover:bg-black border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-md text-muted-foreground hover:text-foreground transition-all cursor-pointer group"
        >
          <Cookie className="w-4 h-4 text-[#2563eb] dark:text-[#00f0ff] group-hover:rotate-12 transition-transform" />
        </button>
      )}
    </>
  );
}
