import { NextResponse } from "next/server";

export interface HealthScanResult {
  url: string;
  domain: string;
  timestamp: string;
  overallScore: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  summary: string;
  metrics: {
    totalLinks: number;
    internalLinks: number;
    externalLinks: number;
    deadLinksCount: number;
    emptyAnchorsCount: number;
    totalImages: number;
    missingAltImagesCount: number;
    h1Count: number;
    h2Count: number;
    h3Count: number;
    formsCount: number;
    hasCaptcha: boolean;
    hasCookieConsent: boolean;
    cookieConsentScore: number;
    legalPagesCount: number;
    privacyPolicyFound: boolean;
    cookiePolicyFound: boolean;
    termsFound: boolean;
    contactPageFound: boolean;
    responseTimeMs: number;
    statusCode: number;
    isHttps: boolean;
    hasCanonical: boolean;
    compression: string;
    contactPageUrl?: string;
  };
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    status: "pass" | "warning" | "fail";
    message: string;
  };
  images: {
    total: number;
    withAlt: number;
    missingAlt: number;
    samples: { src: string; alt: string; hasAlt: boolean }[];
    status: "pass" | "warning" | "fail";
    message: string;
  };
  forms: {
    total: number;
    items: {
      action: string;
      method: string;
      inputCount: number;
      hasEmailInput: boolean;
      hasSubmitButton: boolean;
      hasCaptcha: boolean;
      formType?: "standard-form" | "embedded-widget" | "interactive-container";
    }[];
    hasCaptcha: boolean;
    status: "pass" | "warning" | "fail";
    message: string;
    contactPage?: {
      found: boolean;
      url?: string;
      hasForm: boolean;
      formCount: number;
      hasCaptcha: boolean;
      inputsCount: number;
      provider?: string;
      message: string;
    };
  };
  cookieConsent: {
    detected: boolean;
    provider?: string;
    hasRejectAll: boolean;
    hasGranularSettings: boolean;
    hasGoogleConsentModeV2: boolean;
    hasExplicitPriorConsent: boolean;
    hasCookiePolicyLink: boolean;
    hasConsentWithdrawalMechanism: boolean;
    score: number;
    status: "pass" | "warning" | "fail";
    details: string;
    missingAdvice: string[];
  };
  legalPages: {
    totalFound: number;
    totalChecked: number;
    score: number;
    status: "pass" | "warning" | "fail";
    message: string;
    summary: string;
    pages: {
      id: "privacy-policy" | "cookie-policy" | "terms-of-service" | "acceptable-use" | "contact-details";
      name: string;
      found: boolean;
      url?: string;
      status: "pass" | "warning" | "fail";
      requiredBy: string;
      summary: string;
      mandatoryInclusions: string[];
      missingAdvice: string[];
    }[];
  };
  links: {
    total: number;
    internal: number;
    external: number;
    broken: number;
    emptyOrVoid: number;
    insecureTargetBlank: number;
    items: {
      href: string;
      text: string;
      isInternal: boolean;
      isVoid: boolean;
      isInsecureBlank: boolean;
      status?: number;
      isBroken?: boolean;
    }[];
    status: "pass" | "warning" | "fail";
    message: string;
  };
  protocol: {
    statusCode: number;
    isHttps: boolean;
    responseTimeMs: number;
    canonicalUrl?: string;
    compression?: string;
    contentType?: string;
    redirectHops: number;
    status: "pass" | "warning" | "fail";
    message: string;
  };
  remediationSnippets: {
    id: string;
    title: string;
    category: string;
    snippet: string;
    explanation: string;
  }[];
  sisterToolRecommendations: {
    id: string;
    title: string;
    description: string;
    badge: string;
    link: string;
    urgency: "high" | "medium" | "info";
  }[];
}

// ----------------------------------------------------------------------------
// SSRF & Private IP Protection Helper
// ----------------------------------------------------------------------------
function isPrivateHost(hostname: string): boolean {
  if (!hostname) return true;
  const lower = hostname.toLowerCase();

  if (
    lower === "localhost" ||
    lower === "127.0.0.1" ||
    lower === "0.0.0.0" ||
    lower === "::1" ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal") ||
    lower.endsWith(".localhost")
  ) {
    return true;
  }

  const parts = lower.split(".").map(Number);
  if (parts.length === 4 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
    if (parts[0] === 10) return true; // 10.0.0.0/8
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true; // 172.16.0.0/12
    if (parts[0] === 192 && parts[1] === 168) return true; // 192.168.0.0/16
    if (parts[0] === 169 && parts[1] === 254) return true; // 169.254.0.0/16 AWS/GCP Metadata
    if (parts[0] === 127) return true; // 127.0.0.0/8
  }

  return false;
}

// ----------------------------------------------------------------------------
// POST Handler: Full Website Health & Structure Passive Audit
// ----------------------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const { url: rawUrl, recaptchaToken } = await req.json();

    if (!rawUrl || typeof rawUrl !== "string") {
      return NextResponse.json(
        { error: "A valid website domain or URL is required." },
        { status: 400 }
      );
    }

    // Optional reCAPTCHA v3 verification
    if (process.env.RECAPTCHA_SECRET_KEY && recaptchaToken) {
      try {
        const verifyRes = await fetch(
          "https://www.google.com/recaptcha/api/siteverify",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
          }
        );
        const verifyData = await verifyRes.json();
        if (!verifyData.success || (verifyData.score && verifyData.score < 0.3)) {
          return NextResponse.json(
            { error: "Bot verification failed. Please refresh and try again." },
            { status: 403 }
          );
        }
      } catch {
        // Continue gracefully if captcha server is temporarily unreachable
      }
    }

    // Normalise URL
    let formattedUrl = rawUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(formattedUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid domain format. Please check the URL (e.g. example.com or https://site.com)." },
        { status: 400 }
      );
    }

    if (isPrivateHost(parsedUrl.hostname)) {
      return NextResponse.json(
        { error: "Access to private, localhost, or internal network IP addresses is strictly prohibited." },
        { status: 400 }
      );
    }

    const domain = parsedUrl.hostname;
    const origin = `${parsedUrl.protocol}//${parsedUrl.host}`;

    // ------------------------------------------------------------------------
    // Primary Target Fetch & Latency Probing
    // ------------------------------------------------------------------------
    const startTime = Date.now();
    let targetRes: Response | null = null;
    let html = "";
    let headers: Headers = new Headers();
    let finalUrl = formattedUrl;
    let statusCode = 200;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      targetRes = await fetch(formattedUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 (CankalSoftware-Health-Audit/2026; +https://cankalsoftware.com)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
        },
        redirect: "follow",
      });
      clearTimeout(timeoutId);

      statusCode = targetRes.status;
      headers = targetRes.headers;
      finalUrl = targetRes.url;
      html = (await targetRes.text()).slice(0, 450000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { error: `Could not connect to ${domain}. Please verify the domain is online and reachable (${msg}).` },
        { status: 502 }
      );
    }

    const responseTimeMs = Math.max(1, Date.now() - startTime);
    const isHttps = finalUrl.startsWith("https://");
    const lowerHtml = html.toLowerCase();

    // ------------------------------------------------------------------------
    // 1. Heading Hierarchy Audit (H1, H2, H3)
    // ------------------------------------------------------------------------
    const cleanTagText = (str: string) => str.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

    const h1Matches = Array.from(html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)).map((m) => cleanTagText(m[1])).filter(Boolean);
    const h2Matches = Array.from(html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)).map((m) => cleanTagText(m[1])).filter(Boolean);
    const h3Matches = Array.from(html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)).map((m) => cleanTagText(m[1])).filter(Boolean);

    let headingsStatus: "pass" | "warning" | "fail" = "pass";
    let headingsMessage = "Perfect single H1 tag with structured H2 & H3 hierarchy.";

    if (h1Matches.length === 0) {
      headingsStatus = "fail";
      headingsMessage = "Missing <h1> tag. Search engines and screen readers require a single prominent <h1> per page.";
    } else if (h1Matches.length > 1) {
      headingsStatus = "warning";
      headingsMessage = `Detected ${h1Matches.length} competing <h1> tags. Best practice recommends exactly one main <h1> tag.`;
    } else if (h2Matches.length === 0 && h3Matches.length > 0) {
      headingsStatus = "warning";
      headingsMessage = "Heading hierarchy skipped H2 directly to H3. Maintain logical heading levels.";
    }

    // ------------------------------------------------------------------------
    // 2. Image Health & Alt Text Audit
    // ------------------------------------------------------------------------
    const imgTagMatches = Array.from(html.matchAll(/<img\b([^>]*)>/gi));
    const totalImages = imgTagMatches.length;
    let withAltCount = 0;
    let missingAltCount = 0;
    const imageSamples: { src: string; alt: string; hasAlt: boolean }[] = [];

    for (const match of imgTagMatches) {
      const attrs = match[1];
      const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
      const altMatch = attrs.match(/alt=["']([^"']*)["']/i);

      const src = srcMatch ? srcMatch[1] : "(inline/data-uri)";
      const hasAlt = Boolean(altMatch && altMatch[1].trim().length > 0);
      const alt = altMatch ? altMatch[1] : "";

      if (hasAlt) {
        withAltCount++;
      } else {
        missingAltCount++;
      }

      if (imageSamples.length < 10) {
        imageSamples.push({ src, alt, hasAlt });
      }
    }

    let imagesStatus: "pass" | "warning" | "fail" = "pass";
    let imagesMessage = totalImages === 0 ? "No images found on page." : `All ${totalImages} images provide descriptive alt attributes.`;

    if (missingAltCount > 0) {
      imagesStatus = missingAltCount > 3 ? "fail" : "warning";
      imagesMessage = `${missingAltCount} of ${totalImages} images are missing descriptive alt text (accessibility & image SEO risk).`;
    }

    // ------------------------------------------------------------------------
    // 3. Helper: Form & Bot Defense Parser
    // ------------------------------------------------------------------------
    function parseFormsFromHtml(sourceHtml: string) {
      const lower = sourceHtml.toLowerCase();
      const hasGlobalCaptcha =
        lower.includes("recaptcha") ||
        lower.includes("g-recaptcha") ||
        lower.includes("challenges.cloudflare.com") ||
        lower.includes("turnstile") ||
        lower.includes("cf-turnstile") ||
        lower.includes("hcaptcha") ||
        lower.includes("h-captcha") ||
        lower.includes("protected by recaptcha");

      const formMatches = Array.from(sourceHtml.matchAll(/<form\b([\s\S]*?)<\/form>/gi));
      const items: {
        action: string;
        method: string;
        inputCount: number;
        hasEmailInput: boolean;
        hasSubmitButton: boolean;
        hasCaptcha: boolean;
        formType?: "standard-form" | "embedded-widget" | "interactive-container";
      }[] = [];

      for (const f of formMatches) {
        const formContent = f[1];
        const actionMatch = f[0].match(/action=["']([^"']*)["']/i);
        const methodMatch = f[0].match(/method=["']([^"']*)["']/i);
        const action = actionMatch && actionMatch[1].trim() ? actionMatch[1].trim() : "(same-page / javascript handler)";
        const method = methodMatch && methodMatch[1].trim() ? methodMatch[1].toUpperCase() : "POST / JS";
        
        const hasEmailInput =
          /type=["']email["']/i.test(formContent) ||
          /name=["'](?:email|mail|user_email|contact_email)["']/i.test(formContent) ||
          /id=["'](?:email|mail)["']/i.test(formContent);

        const hasSubmitButton =
          /type=["']submit["']/i.test(formContent) ||
          /<button\b/i.test(formContent) ||
          /type=["']button["']/i.test(formContent);

        const inputCount =
          (formContent.match(/<input\b/gi) || []).length +
          (formContent.match(/<textarea\b/gi) || []).length +
          (formContent.match(/<select\b/gi) || []).length;

        const hasFormCaptcha =
          hasGlobalCaptcha ||
          formContent.toLowerCase().includes("recaptcha") ||
          formContent.toLowerCase().includes("turnstile") ||
          formContent.toLowerCase().includes("hcaptcha");

        items.push({
          action,
          method,
          inputCount: Math.max(1, inputCount),
          hasEmailInput,
          hasSubmitButton,
          hasCaptcha: hasFormCaptcha,
          formType: "standard-form",
        });
      }

      // Check for embedded third-party contact widgets / iframes
      const iframeMatches = Array.from(sourceHtml.matchAll(/<iframe\b([^>]*)>/gi));
      for (const iframe of iframeMatches) {
        const attrs = iframe[1].toLowerCase();
        let provider = "";
        if (attrs.includes("typeform.com")) provider = "Typeform Widget";
        else if (attrs.includes("hubspot") || attrs.includes("hsforms")) provider = "HubSpot Form Widget";
        else if (attrs.includes("jotform.com")) provider = "Jotform Widget";
        else if (attrs.includes("tally.so")) provider = "Tally Form Widget";
        else if (attrs.includes("calendly.com")) provider = "Calendly Booking Widget";
        else if (attrs.includes("formspree.io")) provider = "Formspree Widget";
        else if (attrs.includes("docs.google.com/forms")) provider = "Google Form Embed";
        else if (attrs.includes("zoho.com")) provider = "Zoho Forms Widget";

        if (provider) {
          items.push({
            action: provider,
            method: "EMBEDDED",
            inputCount: 3,
            hasEmailInput: true,
            hasSubmitButton: true,
            hasCaptcha: true,
            formType: "embedded-widget",
          });
        }
      }

      // Check for interactive client-side React / Vue form containers
      if (items.length === 0) {
        const totalInputs = (sourceHtml.match(/<input\b/gi) || []).length;
        const totalTextareas = (sourceHtml.match(/<textarea\b/gi) || []).length;
        const hasEmail = /type=["']email["']/i.test(sourceHtml) || /name=["'](?:email|mail)["']/i.test(sourceHtml);
        const hasButtons = /<button\b/i.test(sourceHtml) || /type=["']submit["']/i.test(sourceHtml);

        if ((totalInputs >= 2 || totalTextareas >= 1) && hasEmail && hasButtons) {
          items.push({
            action: "(client-side interactive form)",
            method: "REACT / AJAX",
            inputCount: totalInputs + totalTextareas,
            hasEmailInput: hasEmail,
            hasSubmitButton: hasButtons,
            hasCaptcha: hasGlobalCaptcha,
            formType: "interactive-container",
          });
        }
      }

      const hasCaptcha = items.some((it) => it.hasCaptcha) || (items.length > 0 && hasGlobalCaptcha);

      return {
        total: items.length,
        items,
        hasCaptcha,
      };
    }

    // ------------------------------------------------------------------------
    // 4. Link & Anchor Health Audit + Legal Page Discovery
    // ------------------------------------------------------------------------
    const anchorMatches = Array.from(html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi));
    const totalLinks = anchorMatches.length;
    let internalLinksCount = 0;
    let externalLinksCount = 0;
    let emptyOrVoidCount = 0;
    let insecureTargetBlankCount = 0;

    const parsedLinks: HealthScanResult["links"]["items"] = [];
    let discoveredContactPageUrl: string | undefined = undefined;
    let discoveredPrivacyPageUrl: string | undefined = undefined;
    let discoveredCookiePolicyUrl: string | undefined = undefined;
    let discoveredTermsPageUrl: string | undefined = undefined;
    let discoveredAcceptableUseUrl: string | undefined = undefined;

    const contactUrlPattern = /\/(?:contact(?:-us|_us|us)?|get-in-touch|reach-us|enquir(?:y|ies)|book-demo|demo|touch)\b/i;
    const contactTextPattern = /\b(?:contact|contact us|get in touch|book a demo|enquir(?:y|ies)|reach us|talk to us)\b/i;

    const privacyUrlPattern = /\/(?:privacy(?:-policy|_policy|-notice|notice)?|data-protection|data-privacy|datenschutz|politique-de-confidentialite)\b/i;
    const privacyTextPattern = /\b(?:privacy|privacy policy|privacy notice|data protection|datenschutz|confidentialit[ée])\b/i;

    const cookieUrlPattern = /\/(?:cookie(?:-policy|_policy|-notice|notice|s)?|cookie-declaration|cookies)\b/i;
    const cookieTextPattern = /\b(?:cookie|cookies|cookie policy|cookie-richtlinie|politique de cookies|cookie declaration)\b/i;

    const termsUrlPattern = /\/(?:terms(?:-of-service|_of_service|-and-conditions|_and_conditions)?|tos|terms-conditions|agb|cgu|conditions-generales|user-agreement)\b/i;
    const termsTextPattern = /\b(?:terms|terms of service|terms & conditions|terms and conditions|terms of use|agb|cgu)\b/i;

    const aupUrlPattern = /\/(?:acceptable-use(?:-policy)?|aup|legal-notice|impressum|mentions-legales|disclaimer|sla|service-level-agreement)\b/i;
    const aupTextPattern = /\b(?:acceptable use|impressum|legal notice|mentions l[ée]gales|disclaimer|service level agreement)\b/i;

    for (const match of anchorMatches) {
      const attrs = match[1];
      const text = cleanTagText(match[2]).slice(0, 80);
      const hrefMatch = attrs.match(/href=["']([^"']*)["']/i);
      const href = hrefMatch ? hrefMatch[1].trim() : "";

      const isVoid =
        !href ||
        href === "#" ||
        href.startsWith("javascript:") ||
        href === "void(0)";

      let isInternal = true;
      if (href.startsWith("http://") || href.startsWith("https://")) {
        try {
          const linkUrl = new URL(href);
          isInternal = linkUrl.hostname === domain || linkUrl.hostname.endsWith(`.${domain}`);
        } catch {
          isInternal = false;
        }
      } else if (href.startsWith("mailto:") || href.startsWith("tel:")) {
        isInternal = false;
      }

      const isTargetBlank = /target=["']_blank["']/i.test(attrs);
      const hasNoopener = /rel=["'][^"']*noopener[^"']*["']/i.test(attrs);
      const isInsecureBlank = isTargetBlank && !hasNoopener && !isInternal;

      if (isVoid) emptyOrVoidCount++;
      if (isInsecureBlank) insecureTargetBlankCount++;
      if (isInternal) internalLinksCount++;
      else externalLinksCount++;

      // Canonicalise helper
      const resolveFullUrl = (h: string) => {
        if (h.startsWith("http")) return h;
        return `${origin}${h.startsWith("/") ? "" : "/"}${h}`;
      };

      // Discovered Legal and Contact Routes
      if (isInternal && href && !href.startsWith("mailto:") && !href.startsWith("tel:") && !href.startsWith("#")) {
        if (!discoveredContactPageUrl && (contactUrlPattern.test(href) || contactTextPattern.test(text))) {
          discoveredContactPageUrl = resolveFullUrl(href);
        }
        if (!discoveredPrivacyPageUrl && (privacyUrlPattern.test(href) || privacyTextPattern.test(text))) {
          discoveredPrivacyPageUrl = resolveFullUrl(href);
        }
        if (!discoveredCookiePolicyUrl && (cookieUrlPattern.test(href) || cookieTextPattern.test(text))) {
          discoveredCookiePolicyUrl = resolveFullUrl(href);
        }
        if (!discoveredTermsPageUrl && (termsUrlPattern.test(href) || termsTextPattern.test(text))) {
          discoveredTermsPageUrl = resolveFullUrl(href);
        }
        if (!discoveredAcceptableUseUrl && (aupUrlPattern.test(href) || aupTextPattern.test(text))) {
          discoveredAcceptableUseUrl = resolveFullUrl(href);
        }
      }

      if (parsedLinks.length < 15 && href && !href.startsWith("mailto:") && !href.startsWith("tel:")) {
        parsedLinks.push({
          href,
          text: text || "(empty anchor text)",
          isInternal,
          isVoid,
          isInsecureBlank,
        });
      }
    }

    // ------------------------------------------------------------------------
    // 5. Asynchronous Parallel Probing (Sample Links + Missing Legal Pages)
    // ------------------------------------------------------------------------
    const sampleTestLinks = parsedLinks
      .filter((l) => !l.isVoid && (l.href.startsWith("http") || l.href.startsWith("/")))
      .slice(0, 5);

    let deadLinksCount = 0;

    // Fast candidate probes for legal routes not discovered in anchors
    const probeCandidateMap: {
      type: "privacy" | "cookie" | "terms" | "aup" | "contact";
      urls: string[];
    }[] = [];

    if (!discoveredPrivacyPageUrl) {
      probeCandidateMap.push({
        type: "privacy",
        urls: [`${origin}/privacy-policy`, `${origin}/privacy`, `${origin}/privacy-notice`],
      });
    }
    if (!discoveredCookiePolicyUrl) {
      probeCandidateMap.push({
        type: "cookie",
        urls: [`${origin}/cookie-policy`, `${origin}/cookies`, `${origin}/cookie-notice`],
      });
    }
    if (!discoveredTermsPageUrl) {
      probeCandidateMap.push({
        type: "terms",
        urls: [`${origin}/terms-of-service`, `${origin}/terms`, `${origin}/terms-and-conditions`],
      });
    }
    if (!discoveredAcceptableUseUrl) {
      probeCandidateMap.push({
        type: "aup",
        urls: [`${origin}/acceptable-use`, `${origin}/impressum`, `${origin}/legal-notice`],
      });
    }
    if (!discoveredContactPageUrl) {
      probeCandidateMap.push({
        type: "contact",
        urls: [`${origin}/contact`, `${origin}/contact-us`],
      });
    }

    // Execute sample link status verification & legal page candidate probes in parallel
    await Promise.all([
      // Sample link probes
      ...sampleTestLinks.map(async (linkItem) => {
        try {
          const testUrl = linkItem.href.startsWith("http")
            ? linkItem.href
            : `${origin}${linkItem.href.startsWith("/") ? "" : "/"}${linkItem.href}`;

          const testController = new AbortController();
          const tId = setTimeout(() => testController.abort(), 2500);

          const testRes = await fetch(testUrl, {
            method: "HEAD",
            signal: testController.signal,
            headers: { "User-Agent": "CankalSoftware-LinkCheck/2026" },
          });
          clearTimeout(tId);

          linkItem.status = testRes.status;
          if (testRes.status >= 400) {
            linkItem.isBroken = true;
            deadLinksCount++;
          }
        } catch {
          linkItem.status = 0;
        }
      }),

      // Legal candidate probes
      ...probeCandidateMap.map(async (candidate) => {
        for (const testUrl of candidate.urls) {
          try {
            const probeController = new AbortController();
            const pId = setTimeout(() => probeController.abort(), 2000);

            const probeRes = await fetch(testUrl, {
              method: "HEAD",
              signal: probeController.signal,
              headers: { "User-Agent": "CankalSoftware-LegalCompliance/2026" },
            });
            clearTimeout(pId);

            if (probeRes.ok || probeRes.status === 200 || probeRes.status === 301 || probeRes.status === 302) {
              if (candidate.type === "privacy" && !discoveredPrivacyPageUrl) discoveredPrivacyPageUrl = testUrl;
              else if (candidate.type === "cookie" && !discoveredCookiePolicyUrl) discoveredCookiePolicyUrl = testUrl;
              else if (candidate.type === "terms" && !discoveredTermsPageUrl) discoveredTermsPageUrl = testUrl;
              else if (candidate.type === "aup" && !discoveredAcceptableUseUrl) discoveredAcceptableUseUrl = testUrl;
              else if (candidate.type === "contact" && !discoveredContactPageUrl) discoveredContactPageUrl = testUrl;
              break;
            }
          } catch {
            // Non-blocking timeout
          }
        }
      }),
    ]);

    let linksStatus: "pass" | "warning" | "fail" = "pass";
    let linksMessage = `Audited ${totalLinks} links (${internalLinksCount} internal, ${externalLinksCount} external).`;

    if (deadLinksCount > 0) {
      linksStatus = "fail";
      linksMessage = `${deadLinksCount} broken / 404 links detected during sample crawl.`;
    } else if (emptyOrVoidCount > 3 || insecureTargetBlankCount > 0) {
      linksStatus = "warning";
      linksMessage = `${emptyOrVoidCount} placeholder hrefs and ${insecureTargetBlankCount} insecure target="_blank" links detected.`;
    }

    // ------------------------------------------------------------------------
    // 6. Contact Form & Dedicated Contact Page Probe
    // ------------------------------------------------------------------------
    const onPageForms = parseFormsFromHtml(html);
    const formsCount = onPageForms.total;
    const formItems = onPageForms.items;
    const hasCaptcha = onPageForms.hasCaptcha;

    let contactPageInfo: HealthScanResult["forms"]["contactPage"] = undefined;

    const isAuditingContactPageDirectly =
      contactUrlPattern.test(finalUrl) ||
      (discoveredContactPageUrl && finalUrl.toLowerCase().replace(/\/$/, "") === discoveredContactPageUrl.toLowerCase().replace(/\/$/, ""));

    if (isAuditingContactPageDirectly) {
      contactPageInfo = {
        found: true,
        url: finalUrl,
        hasForm: formsCount > 0,
        formCount: formsCount,
        hasCaptcha: hasCaptcha,
        inputsCount: formItems.reduce((acc, f) => acc + f.inputCount, 0),
        message: formsCount > 0
          ? `Auditing dedicated Contact Page directly (${formsCount} form(s) verified with ${hasCaptcha ? "reCAPTCHA / Turnstile active" : "no captcha"}).`
          : `Auditing Contact Page route directly (no interactive form markup detected on this URL).`,
      };
    } else if (discoveredContactPageUrl) {
      try {
        const cController = new AbortController();
        const cTimeout = setTimeout(() => cController.abort(), 2500);
        const cRes = await fetch(discoveredContactPageUrl, {
          signal: cController.signal,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 (CankalSoftware-ContactCheck/2026; +https://cankalsoftware.com)",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
        });
        clearTimeout(cTimeout);

        if (cRes.ok) {
          const cHtml = (await cRes.text()).slice(0, 250000);
          const cForms = parseFormsFromHtml(cHtml);
          contactPageInfo = {
            found: true,
            url: discoveredContactPageUrl,
            hasForm: cForms.total > 0,
            formCount: cForms.total,
            hasCaptcha: cForms.hasCaptcha,
            inputsCount: cForms.items.reduce((acc, f) => acc + f.inputCount, 0),
            message: cForms.total > 0
              ? `Dedicated Contact Page verified at ${discoveredContactPageUrl} (${cForms.total} form(s), ${cForms.hasCaptcha ? "reCAPTCHA/Turnstile protected" : "No bot protection"}).`
              : `Dedicated Contact Page route verified at ${discoveredContactPageUrl} (HTTP 200 OK).`,
          };
        } else {
          contactPageInfo = {
            found: true,
            url: discoveredContactPageUrl,
            hasForm: false,
            formCount: 0,
            hasCaptcha: false,
            inputsCount: 0,
            message: `Dedicated contact route found at ${discoveredContactPageUrl} (Returned HTTP ${cRes.status}).`,
          };
        }
      } catch {
        contactPageInfo = {
          found: true,
          url: discoveredContactPageUrl,
          hasForm: false,
          formCount: 0,
          hasCaptcha: false,
          inputsCount: 0,
          message: `Dedicated contact link discovered in navigation: ${discoveredContactPageUrl}.`,
        };
      }
    }

    let formsStatus: "pass" | "warning" | "fail" = "pass";
    let formsMessage = "No interactive contact forms detected on this page.";

    if (formsCount > 0) {
      if (!hasCaptcha) {
        formsStatus = "warning";
        formsMessage = `${formsCount} interactive form(s) found on-page without automated bot protection (reCAPTCHA / Turnstile).`;
      } else {
        formsStatus = "pass";
        formsMessage = `${formsCount} contact form(s) verified on-page with active bot defense.`;
      }
    } else if (contactPageInfo && contactPageInfo.found) {
      if (contactPageInfo.hasForm) {
        if (contactPageInfo.hasCaptcha) {
          formsStatus = "pass";
          formsMessage = `No form on landing page, but dedicated Contact Page verified at ${contactPageInfo.url} with active bot defense.`;
        } else {
          formsStatus = "warning";
          formsMessage = `Dedicated Contact Page found at ${contactPageInfo.url} (${contactPageInfo.formCount} form), but lacks reCAPTCHA bot protection.`;
        }
      } else {
        formsStatus = "pass";
        formsMessage = `Dedicated Contact Page link discovered in navigation (${contactPageInfo.url}).`;
      }
    } else {
      formsStatus = "warning";
      formsMessage = "No on-page contact form or dedicated contact page link detected in site navigation.";
    }

    // ------------------------------------------------------------------------
    // 7. Comprehensive Cookie Consent Settings Audit (UK GDPR / PECR / Consent Mode v2)
    // ------------------------------------------------------------------------
    let hasCookieConsent = false;
    let cookieProvider = "Custom Banner / Consent Mode v2";
    let hasRejectAll = false;
    let hasGranularSettings = false;
    let hasGoogleConsentModeV2 = false;
    let hasExplicitPriorConsent = true;
    let hasCookiePolicyLink = Boolean(discoveredCookiePolicyUrl);
    let hasConsentWithdrawalMechanism = false;

    // 7A: CMP Provider Detection
    if (lowerHtml.includes("onetrust") || lowerHtml.includes("optanon") || lowerHtml.includes("ot-sdk")) {
      hasCookieConsent = true;
      cookieProvider = "OneTrust Consent Management";
    } else if (lowerHtml.includes("cookiebot") || lowerHtml.includes("data-cookieconsent")) {
      hasCookieConsent = true;
      cookieProvider = "Cookiebot CMP";
    } else if (lowerHtml.includes("klaro") || lowerHtml.includes("data-klaro")) {
      hasCookieConsent = true;
      cookieProvider = "Klaro Consent Manager";
    } else if (lowerHtml.includes("termly.io") || lowerHtml.includes("termly")) {
      hasCookieConsent = true;
      cookieProvider = "Termly CMP";
    } else if (lowerHtml.includes("osano")) {
      hasCookieConsent = true;
      cookieProvider = "Osano Consent Manager";
    } else if (lowerHtml.includes("usercentrics")) {
      hasCookieConsent = true;
      cookieProvider = "Usercentrics CMP";
    } else if (lowerHtml.includes("cookieyes") || lowerHtml.includes("cky-consent")) {
      hasCookieConsent = true;
      cookieProvider = "CookieYes CMP";
    } else if (lowerHtml.includes("civicuk.com") || lowerHtml.includes("cookiecontrol")) {
      hasCookieConsent = true;
      cookieProvider = "Civic UK Cookie Control";
    } else if (lowerHtml.includes("didomi")) {
      hasCookieConsent = true;
      cookieProvider = "Didomi CMP";
    } else if (lowerHtml.includes("axeptio") || lowerHtml.includes("axept.io")) {
      hasCookieConsent = true;
      cookieProvider = "Axeptio CMP";
    } else if (lowerHtml.includes("iubenda")) {
      hasCookieConsent = true;
      cookieProvider = "Iubenda Consent Solution";
    } else if (lowerHtml.includes("complianz") || lowerHtml.includes("cmplz")) {
      hasCookieConsent = true;
      cookieProvider = "Complianz Privacy Suite";
    } else if (lowerHtml.includes("borlabs-cookie")) {
      hasCookieConsent = true;
      cookieProvider = "Borlabs Cookie";
    } else if (lowerHtml.includes("quantcast.mgr") || lowerHtml.includes("__tcfapi")) {
      hasCookieConsent = true;
      cookieProvider = "Quantcast Choice (TCF v2.2)";
    } else if (
      (lowerHtml.includes("gtag('consent'") || lowerHtml.includes('gtag("consent"')) &&
      (lowerHtml.includes("analytics_storage") || lowerHtml.includes("ad_storage"))
    ) {
      hasCookieConsent = true;
      cookieProvider = "Google Consent Mode v2";
    } else if (
      (lowerHtml.includes("cookie-banner") ||
        lowerHtml.includes("cookie-consent") ||
        lowerHtml.includes("cookie-popup") ||
        lowerHtml.includes("cookie-notice") ||
        lowerHtml.includes("cankal_cookie_consent") ||
        lowerHtml.includes("cookies-consent")) &&
      (lowerHtml.includes("accept") || lowerHtml.includes("agree") || lowerHtml.includes("allow"))
    ) {
      hasCookieConsent = true;
      cookieProvider = "Custom Cookie Banner";
    }

    // 7B: Consent Settings Specific Checks
    if (
      lowerHtml.includes("reject all") ||
      lowerHtml.includes("reject non-essential") ||
      lowerHtml.includes("decline all") ||
      lowerHtml.includes("decline non-essential") ||
      lowerHtml.includes("only necessary") ||
      lowerHtml.includes("refuse all") ||
      lowerHtml.includes("deny all") ||
      lowerHtml.includes("tout refuser") ||
      lowerHtml.includes("alle ablehnen") ||
      lowerHtml.includes("rechazar todo") ||
      lowerHtml.includes("cky-btn-reject") ||
      lowerHtml.includes("optanon-button-reject")
    ) {
      hasRejectAll = true;
    }

    if (
      lowerHtml.includes("cookie preferences") ||
      lowerHtml.includes("cookie settings") ||
      lowerHtml.includes("manage cookies") ||
      lowerHtml.includes("manage preferences") ||
      lowerHtml.includes("customise") ||
      lowerHtml.includes("customize") ||
      lowerHtml.includes("cookie-einstellungen") ||
      lowerHtml.includes("paramètres des cookies") ||
      lowerHtml.includes("cky-btn-customize") ||
      lowerHtml.includes("ot-sdk-show-settings") ||
      (lowerHtml.includes("analytics") && lowerHtml.includes("marketing") && lowerHtml.includes("necessary"))
    ) {
      hasGranularSettings = true;
    }

    if (
      (lowerHtml.includes("analytics_storage") && lowerHtml.includes("ad_storage")) ||
      lowerHtml.includes("ad_user_data") ||
      lowerHtml.includes("ad_personalization")
    ) {
      hasGoogleConsentModeV2 = true;
    }

    // Script Blocking / Prior Consent Check:
    // If tracking scripts (GA4, FB Pixel, TikTok, Clarity) exist without Consent Mode or CMP data attributes
    const hasUnblockedTracking =
      (lowerHtml.includes("googletagmanager.com/gtag/js") ||
        lowerHtml.includes("connect.facebook.net") ||
        lowerHtml.includes("clarity.ms") ||
        lowerHtml.includes("analytics.tiktok.com")) &&
      !hasGoogleConsentModeV2 &&
      !lowerHtml.includes("data-cookieconsent") &&
      !lowerHtml.includes("type=\"text/plain\"") &&
      !lowerHtml.includes("data-klaro");

    if (hasUnblockedTracking) {
      hasExplicitPriorConsent = false;
    }

    // Re-open / Withdrawal mechanism check
    if (
      lowerHtml.includes("manage cookie") ||
      lowerHtml.includes("cookie settings") ||
      lowerHtml.includes("privacy preferences") ||
      lowerHtml.includes("open-cookie-settings") ||
      lowerHtml.includes("re-open consent") ||
      lowerHtml.includes("manage consent")
    ) {
      hasConsentWithdrawalMechanism = true;
    }

    // Calculate Cookie Consent Score (0-100)
    let cookieScore = 0;
    const missingConsentAdvice: string[] = [];

    if (hasCookieConsent) {
      cookieScore += 30; // Base banner presence
      if (hasRejectAll) cookieScore += 25;
      else {
        missingConsentAdvice.push(
          "Missing explicit 'Reject All' / 'Decline Non-Essential' button on the first layer of the banner. UK ICO and EDPB guidelines mandate that rejecting cookies must require no more clicks or visual effort than accepting."
        );
      }

      if (hasGranularSettings) cookieScore += 20;
      else {
        missingConsentAdvice.push(
          "Missing granular cookie category controls. Visitors must have the ability to toggle individual categories (Analytics, Marketing, Preferences) rather than being forced into a binary all-or-nothing choice."
        );
      }

      if (hasGoogleConsentModeV2) cookieScore += 15;
      else {
        missingConsentAdvice.push(
          "Missing Google Consent Mode v2 default 'denied' configuration (`analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`). Without this, conversion tracking and audience modeling in Google Ads/GA4 are restricted in the UK & EEA."
        );
      }

      if (hasCookiePolicyLink) cookieScore += 10;
      else {
        missingConsentAdvice.push(
          "The consent banner should include a direct hyperlink to an accessible, itemized Cookie Policy explaining cookie purposes and durations."
        );
      }

      if (!hasConsentWithdrawalMechanism) {
        missingConsentAdvice.push(
          "Missing persistent cookie settings widget or footer link. Under GDPR Art. 7(3), withdrawing consent must be as easy as giving it at any time during browsing."
        );
      }

      if (!hasExplicitPriorConsent) {
        cookieScore = Math.max(20, cookieScore - 20);
        missingConsentAdvice.push(
          "Third-party tracking scripts (Analytics / Ads Pixels) appear to fire before explicit user consent. Non-essential cookies must be blocked or held in 'denied' state until consent is granted."
        );
      }
    } else {
      missingConsentAdvice.push(
        "No Cookie Consent banner or CMP detected. Under UK GDPR and PECR Regulation 6, you must obtain prior opt-in consent before setting non-essential cookies (analytics, ads, tracking pixels)."
      );
      missingConsentAdvice.push(
        "Implement a Cookie Management Platform (CMP) or custom banner with Google Consent Mode v2 default 'denied' parameters."
      );
    }

    let cookieStatus: "pass" | "warning" | "fail" = "pass";
    let cookieDetails = "";

    if (!hasCookieConsent) {
      cookieStatus = "fail";
      cookieDetails = "No cookie consent mechanism or Google Consent Mode v2 default 'denied' signals detected in markup.";
    } else if (cookieScore < 70 || missingConsentAdvice.length > 1) {
      cookieStatus = "warning";
      cookieDetails = `Cookie banner detected (${cookieProvider}), but missing key GDPR/PECR compliance settings (${missingConsentAdvice.length} recommendations).`;
    } else {
      cookieStatus = "pass";
      cookieDetails = `Active user consent banner verified (${cookieProvider}). Fully aligned with UK GDPR, PECR, and Google Consent Mode v2.`;
    }

    // ------------------------------------------------------------------------
    // 8. Legal Pages & GDPR Compliance Audit (Privacy, Cookies, Terms, AUP, Contact)
    // ------------------------------------------------------------------------
    const legalPagesAudited: HealthScanResult["legalPages"]["pages"] = [
      {
        id: "privacy-policy",
        name: "Privacy Policy / Data Protection Notice",
        found: Boolean(discoveredPrivacyPageUrl),
        url: discoveredPrivacyPageUrl,
        status: discoveredPrivacyPageUrl ? "pass" : "fail",
        requiredBy: "UK GDPR (Articles 13 & 14) and EU GDPR Regulation (EU) 2016/679",
        summary: "Mandatory legal notice informing data subjects how personal information is collected, processed, stored, and protected.",
        mandatoryInclusions: [
          "Data Controller legal name, company registration number, and registered office address",
          "Specified lawful basis for each processing purpose under GDPR Article 6 (Consent, Contract, Legitimate Interests, Legal Obligation)",
          "Data retention schedules or concrete criteria used to determine retention periods",
          "Comprehensive list of Data Subject Rights (Access, Rectification, Erasure, Restriction, Portability, and Objection)",
          "International data transfer mechanisms & safeguards (UK IDTA / EU Standard Contractual Clauses) if third-party cloud services are used",
          "Explicit notice informing data subjects of their statutory right to lodge a complaint with the ICO (UK) or EU supervisory authority",
        ],
        missingAdvice: discoveredPrivacyPageUrl
          ? []
          : [
              "Missing publicly accessible Privacy Policy. Under UK GDPR and EU GDPR, failure to provide a compliant privacy notice exposes the organisation to regulatory enforcement notices and statutory fines up to £17.5M / 4% of annual global turnover.",
              "Create and publish a dedicated Privacy Policy route (e.g. `/privacy-policy`) linked in your primary navigation or footer.",
            ],
      },
      {
        id: "cookie-policy",
        name: "Cookie Policy & Declaration",
        found: Boolean(discoveredCookiePolicyUrl),
        url: discoveredCookiePolicyUrl,
        status: discoveredCookiePolicyUrl ? "pass" : "fail",
        requiredBy: "UK Privacy and Electronic Communications Regulations (PECR) & EU ePrivacy Directive 2002/58/EC",
        summary: "Itemized breakdown of all first-party and third-party cookies, tracking pixels, and local storage mechanisms.",
        mandatoryInclusions: [
          "Clear explanation of what cookies, local storage, and tracking pixels are",
          "Itemized Cookie Inventory table detailing: Cookie Name, Provider/Domain, Category (Strictly Necessary, Analytics, Marketing), Purpose, and Lifespan/Duration",
          "Detailed explanation of how user consent is recorded and updated (including Google Consent Mode v2 signals)",
          "Step-by-step instructions on how visitors can change preferences or revoke consent at any time",
          "Browser-specific instructions for blocking, disabling, or deleting cookies via Chrome, Safari, Firefox, and Edge",
        ],
        missingAdvice: discoveredCookiePolicyUrl
          ? []
          : [
              "Missing dedicated Cookie Policy. PECR Regulation 6 mandates that users must be provided with clear and comprehensive information regarding storage and access to cookies on their terminal equipment.",
              "Publish an accessible Cookie Policy (e.g. `/cookie-policy`) containing a complete, transparent table of cookies used on your web application.",
            ],
      },
      {
        id: "terms-of-service",
        name: "Terms of Service / Terms & Conditions",
        found: Boolean(discoveredTermsPageUrl),
        url: discoveredTermsPageUrl,
        status: discoveredTermsPageUrl ? "pass" : "fail",
        requiredBy: "UK Electronic Commerce Regulations 2002, Consumer Rights Act 2015 & Commercial Contract Law",
        summary: "Legally binding agreement defining terms of access, user obligations, intellectual property rights, and liability limits.",
        mandatoryInclusions: [
          "Scope of services, user eligibility criteria, and account registration responsibilities",
          "Intellectual Property (IP) ownership, copyright, trademarks, proprietary software rights, and licensing terms",
          "Permitted and prohibited use of the website and developer tools (anti-scraping, anti-abuse)",
          "Enforceable Limitation of Liability and Warranty Disclaimers compliant with the Unfair Contract Terms Act 1977",
          "Governing Law & Jurisdiction clause (e.g. 'These terms shall be governed by and construed in accordance with the laws of England and Wales')",
          "Procedures for amendments, termination of service, and dispute resolution",
        ],
        missingAdvice: discoveredTermsPageUrl
          ? []
          : [
              "No Terms of Service detected. Without published Terms of Service, your business operates without legal protection against user misuse, liability claims, intellectual property infringement, or commercial disputes.",
              "Publish standard Terms of Service (e.g. `/terms-of-service`) covering acceptable use, liability limitations, and governing jurisdiction.",
            ],
      },
      {
        id: "acceptable-use",
        name: "Acceptable Use Policy & Legal Notice / Impressum",
        found: Boolean(discoveredAcceptableUseUrl),
        url: discoveredAcceptableUseUrl,
        status: discoveredAcceptableUseUrl ? "pass" : "warning",
        requiredBy: "EU Digital Services Act (DSA), UK Computer Misuse Act & German Digitale-Dienste-Gesetz (§ 5 DDG / TMG)",
        summary: "Rules governing prohibited technical behaviour, security testing boundaries, and corporate statutory disclosures.",
        mandatoryInclusions: [
          "Prohibited security activities (unauthorized vulnerability scanning, DDoS, SQL injection, automated scraping, malware distribution)",
          "Legal Notice / Impressum (mandatory for EU/DACH web entities): Full registered company name, commercial register number, VAT identification number, managing director names",
          "Vulnerability reporting policy and security disclosure contact (e.g. security@domain or `/.well-known/security.txt`)",
        ],
        missingAdvice: discoveredAcceptableUseUrl
          ? []
          : [
              "Missing published Acceptable Use Policy or Legal Notice. Clearly defining acceptable use protects your digital infrastructure under the Computer Misuse Act and prevents platform abuse.",
              "Publish an Acceptable Use Policy (e.g. `/acceptable-use`) and provide security disclosure contact details.",
            ],
      },
      {
        id: "contact-details",
        name: "Contact Page & Data Controller Identification",
        found: Boolean(discoveredContactPageUrl || contactPageInfo?.found),
        url: discoveredContactPageUrl || contactPageInfo?.url,
        status: (discoveredContactPageUrl || contactPageInfo?.found) ? "pass" : "warning",
        requiredBy: "UK Companies Act 2006, E-Commerce Regulations & GDPR Art. 13(1)(a)",
        summary: "Direct electronic and physical contact coordinates for user inquiries, statutory notices, and Subject Access Requests (SARs).",
        mandatoryInclusions: [
          "Direct, rapid electronic communication method (active contact form or monitored support email)",
          "Registered company name, physical business address, and company registration number",
          "Designated privacy inquiry contact or Data Protection Officer (DPO) details for Subject Access Requests (SARs)",
        ],
        missingAdvice: (discoveredContactPageUrl || contactPageInfo?.found)
          ? []
          : [
              "No dedicated contact page or company identification discovered in site navigation. Under UK Companies Act & GDPR, website operators must provide clear contact channels and legal corporate details.",
            ],
      },
    ];

    const totalLegalFound = legalPagesAudited.filter((p) => p.found).length;
    const totalLegalChecked = legalPagesAudited.length;
    const legalPagesScore = Math.round((totalLegalFound / totalLegalChecked) * 100);

    let legalPagesStatus: "pass" | "warning" | "fail" = "pass";
    let legalPagesMessage = `Discovered ${totalLegalFound} of ${totalLegalChecked} essential legal compliance pages in navigation.`;

    if (totalLegalFound <= 1) {
      legalPagesStatus = "fail";
      legalPagesMessage = `Critical legal non-compliance: Only ${totalLegalFound} of ${totalLegalChecked} essential legal pages found. High regulatory risk under UK GDPR / PECR.`;
    } else if (totalLegalFound < 4) {
      legalPagesStatus = "warning";
      legalPagesMessage = `${totalLegalChecked - totalLegalFound} essential legal pages are missing from site navigation (${legalPagesAudited.filter(p => !p.found).map(p => p.name).join(", ")}).`;
    }

    const legalPagesSummary = totalLegalFound === totalLegalChecked
      ? "All standard regulatory and statutory legal pages (Privacy Policy, Cookie Policy, Terms of Service, Acceptable Use, and Contact) are published and accessible."
      : `Missing ${totalLegalChecked - totalLegalFound} legal compliance page(s). To comply with UK GDPR, EU GDPR, and PECR, publish all missing legal documentation linked in the footer.`;

    // ------------------------------------------------------------------------
    // 9. Protocol, Canonical & Compression Audit
    // ------------------------------------------------------------------------
    const canonicalMatch = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    const canonicalUrl = canonicalMatch ? canonicalMatch[1] : undefined;
    const compression = headers.get("content-encoding") || "none (uncompressed)";
    const contentType = headers.get("content-type") || "text/html";

    let protocolStatus: "pass" | "warning" | "fail" = "pass";
    let protocolMessage = `Status 200 OK via HTTPS (${responseTimeMs}ms response time).`;

    if (!isHttps) {
      protocolStatus = "fail";
      protocolMessage = "Page served over insecure plain HTTP connection.";
    } else if (!canonicalUrl) {
      protocolStatus = "warning";
      protocolMessage = "Missing `<link rel=\"canonical\">` tag to prevent duplicate content indexing.";
    }

    // ------------------------------------------------------------------------
    // 10. Overall Health Score Calculation
    // ------------------------------------------------------------------------
    let score = 100;

    // Headings & Images (20 pts)
    if (headingsStatus === "fail") score -= 12;
    else if (headingsStatus === "warning") score -= 5;

    if (imagesStatus === "fail") score -= 8;
    else if (imagesStatus === "warning") score -= 4;

    // Forms & Bot Defense (15 pts)
    if (formsCount > 0) {
      if (!hasCaptcha) score -= 8;
    } else if (contactPageInfo && contactPageInfo.found) {
      if (contactPageInfo.hasForm && !contactPageInfo.hasCaptcha) {
        score -= 4;
      }
    } else {
      score -= 4;
    }

    // Cookie Consent Settings (20 pts)
    if (!hasCookieConsent) score -= 20;
    else if (cookieScore < 70) score -= 10;
    else if (cookieScore < 90) score -= 4;

    // Legal Pages Compliance (20 pts)
    if (!discoveredPrivacyPageUrl) score -= 8;
    if (!discoveredCookiePolicyUrl) score -= 5;
    if (!discoveredTermsPageUrl) score -= 4;
    if (totalLegalFound < 3) score -= 3;

    // Links & Anchors (15 pts)
    if (deadLinksCount > 0) score -= 10;
    if (emptyOrVoidCount > 3) score -= 3;
    if (insecureTargetBlankCount > 0) score -= 2;

    // Protocol & Speed (10 pts)
    if (!isHttps) score -= 10;
    if (!canonicalUrl) score -= 3;
    if (responseTimeMs > 1500) score -= 3;

    const overallScore = Math.max(0, Math.min(100, Math.round(score)));

    let grade: HealthScanResult["grade"] = "F";
    if (overallScore >= 90) grade = "A+";
    else if (overallScore >= 80) grade = "A";
    else if (overallScore >= 70) grade = "B";
    else if (overallScore >= 60) grade = "C";
    else if (overallScore >= 50) grade = "D";

    // ------------------------------------------------------------------------
    // 11. Dynamic Sister Tool Recommendations
    // ------------------------------------------------------------------------
    const sisterToolRecommendations: HealthScanResult["sisterToolRecommendations"] = [];

    // Check for AEO / Schema
    const hasJsonLd = lowerHtml.includes("application/ld+json");
    if (!hasJsonLd) {
      sisterToolRecommendations.push({
        id: "aeo-readiness",
        title: "Missing Structured JSON-LD & LLMs.txt for AI Search",
        description:
          "Your webpage lacks structured semantic Schema.org entities. Run our dedicated AI Engine Optimization (AEO) audit to prepare for ChatGPT and Google AI Overviews.",
        badge: "AEO / GEO Engine",
        link: `/aeo-scanner?domain=${encodeURIComponent(domain)}`,
        urgency: "high",
      });
    }

    // Check for Security Headers
    const hasHsts = headers.has("strict-transport-security");
    const hasCsp = headers.has("content-security-policy");
    if (!hasHsts || !hasCsp) {
      sisterToolRecommendations.push({
        id: "cve-vulnerability",
        title: "Incomplete HTTP Security & Transport Headers",
        description:
          "Missing Strict-Transport-Security (HSTS) or Content-Security-Policy (CSP). Scan your server against MITRE CVE and NVD databases for known vulnerabilities.",
        badge: "CVE & Zero-Day Check",
        link: `/vulnerability-check?domain=${encodeURIComponent(domain)}`,
        urgency: "high",
      });

      sisterToolRecommendations.push({
        id: "owasp-compliance",
        title: "2026 OWASP Top 10 Security Architecture Review",
        description:
          "Audit Broken Access Control (A01), Cryptographic Failures (A02), and Injection risks (A03) against the modern 2026 OWASP benchmark.",
        badge: "2026 OWASP Audit",
        link: `/owasp-check?domain=${encodeURIComponent(domain)}`,
        urgency: "medium",
      });
    }

    // ------------------------------------------------------------------------
    // 12. Remediation Code Snippets (Consent Mode v2, Cookie Table, GDPR Privacy, etc.)
    // ------------------------------------------------------------------------
    const remediationSnippets: HealthScanResult["remediationSnippets"] = [
      {
        id: "google-consent-mode-v2",
        title: "Google Consent Mode v2 & Cookie Banner Implementation",
        category: "GDPR & Consent Mode v2",
        snippet: `<!-- 1. Place in <head> BEFORE Google Tag Manager or gtag.js -->
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  // Default to denied for EU/UK GDPR compliance
  gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'wait_for_update': 500
  });
</script>

<!-- 2. Execute when user clicks 'Accept All' -->
<script>
  function onUserAcceptAll() {
    gtag('consent', 'update', {
      'analytics_storage': 'granted',
      'ad_storage': 'granted',
      'ad_user_data': 'granted',
      'ad_personalization': 'granted'
    });
    localStorage.setItem('cookie_consent', 'all');
  }
</script>`,
        explanation: "Since March 2024, Google requires Consent Mode v2 (`ad_user_data`, `ad_personalization`) with default 'denied' parameters for all web traffic in the UK and EEA.",
      },
      {
        id: "cookie-inventory-table",
        title: "PECR Compliant Cookie Policy Inventory Table",
        category: "Cookie Policy (PECR)",
        snippet: `<table class="cookie-inventory">
  <thead>
    <tr>
      <th>Cookie Name</th>
      <th>Provider / Host</th>
      <th>Category</th>
      <th>Purpose</th>
      <th>Lifespan</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>session_id</code></td>
      <td>${domain}</td>
      <td>Strictly Necessary</td>
      <td>Maintains encrypted user authentication session.</td>
      <td>Session</td>
    </tr>
    <tr>
      <td><code>_ga, _ga_*</code></td>
      <td>Google Analytics 4</td>
      <td>Analytics</td>
      <td>Aggregated visitor metrics (Held in 'denied' until opt-in).</td>
      <td>2 Years</td>
    </tr>
  </tbody>
</table>`,
        explanation: "PECR Regulation 6 requires an itemized breakdown of all cookies, distinguishing strictly necessary cookies from non-essential tracking cookies.",
      },
      {
        id: "gdpr-privacy-structure",
        title: "UK / EU GDPR Compliant Privacy Notice Blueprint",
        category: "Privacy Policy (Art. 13/14)",
        snippet: `<!-- Privacy Notice Standard Article 13/14 Sections -->
<section>
  <h2>1. Data Controller Identity</h2>
  <p><strong>${domain}</strong>, Company Reg: [NUMBER], Registered Office: [ADDRESS], Email: privacy@${domain}</p>

  <h2>2. Lawful Basis for Processing (GDPR Art. 6)</h2>
  <p>We process personal data under Consent (Art. 6(1)(a)), Contract Performance (Art. 6(1)(b)), and Legitimate Interests (Art. 6(1)(f)).</p>

  <h2>3. Data Subject Rights &amp; Supervisory Authority</h2>
  <p>You have the right to access, rectify, or erase your data. You may lodge a complaint with the Information Commissioner's Office (ICO) at <a href="https://ico.org.uk">ico.org.uk</a>.</p>
</section>`,
        explanation: "A valid GDPR Privacy Notice must specify the data controller identity, lawful basis under Article 6, retention schedules, data subject rights, and the right to lodge a complaint with the ICO.",
      },
      {
        id: "canonical-html",
        title: "Canonical URL Normalisation Tag",
        category: "SEO & Structure",
        snippet: `<link rel="canonical" href="https://${domain}/" />`,
        explanation: "Insert this inside the <head> section to prevent search engines from indexing duplicate URL parameters.",
      },
      {
        id: "image-alt-fix",
        title: "Accessible Image Markup (WCAG 2.2)",
        category: "Accessibility & DOM",
        snippet: `<img src="/assets/logo.svg" alt="${domain} Company Logo" width="200" height="50" loading="lazy" />`,
        explanation: "Always provide descriptive alt text and explicit dimensions to improve Core Web Vitals and screen reader support.",
      },
    ];

    const result: HealthScanResult = {
      url: finalUrl,
      domain,
      timestamp: new Date().toISOString(),
      overallScore,
      grade,
      summary: `Completed comprehensive website health, legal compliance, and structure audit for ${domain}. Evaluated headings, images, forms, cookie consent settings, legal pages, links, and protocol compliance.`,
      metrics: {
        totalLinks,
        internalLinks: internalLinksCount,
        externalLinks: externalLinksCount,
        deadLinksCount,
        emptyAnchorsCount: emptyOrVoidCount,
        totalImages,
        missingAltImagesCount: missingAltCount,
        h1Count: h1Matches.length,
        h2Count: h2Matches.length,
        h3Count: h3Matches.length,
        formsCount,
        hasCaptcha,
        hasCookieConsent,
        cookieConsentScore: cookieScore,
        legalPagesCount: totalLegalFound,
        privacyPolicyFound: Boolean(discoveredPrivacyPageUrl),
        cookiePolicyFound: Boolean(discoveredCookiePolicyUrl),
        termsFound: Boolean(discoveredTermsPageUrl),
        contactPageFound: Boolean(discoveredContactPageUrl || contactPageInfo?.found),
        responseTimeMs,
        statusCode,
        isHttps,
        hasCanonical: Boolean(canonicalUrl),
        compression,
        contactPageUrl: contactPageInfo?.url || discoveredContactPageUrl,
      },
      headings: {
        h1: h1Matches,
        h2: h2Matches.slice(0, 10),
        h3: h3Matches.slice(0, 10),
        status: headingsStatus,
        message: headingsMessage,
      },
      images: {
        total: totalImages,
        withAlt: withAltCount,
        missingAlt: missingAltCount,
        samples: imageSamples,
        status: imagesStatus,
        message: imagesMessage,
      },
      forms: {
        total: formsCount,
        items: formItems,
        hasCaptcha,
        status: formsStatus,
        message: formsMessage,
        contactPage: contactPageInfo,
      },
      cookieConsent: {
        detected: hasCookieConsent,
        provider: cookieProvider,
        hasRejectAll,
        hasGranularSettings,
        hasGoogleConsentModeV2,
        hasExplicitPriorConsent,
        hasCookiePolicyLink,
        hasConsentWithdrawalMechanism,
        score: cookieScore,
        status: cookieStatus,
        details: cookieDetails,
        missingAdvice: missingConsentAdvice,
      },
      legalPages: {
        totalFound: totalLegalFound,
        totalChecked: totalLegalChecked,
        score: legalPagesScore,
        status: legalPagesStatus,
        message: legalPagesMessage,
        summary: legalPagesSummary,
        pages: legalPagesAudited,
      },
      links: {
        total: totalLinks,
        internal: internalLinksCount,
        external: externalLinksCount,
        broken: deadLinksCount,
        emptyOrVoid: emptyOrVoidCount,
        insecureTargetBlank: insecureTargetBlankCount,
        items: parsedLinks,
        status: linksStatus,
        message: linksMessage,
      },
      protocol: {
        statusCode,
        isHttps,
        responseTimeMs,
        canonicalUrl,
        compression,
        contentType,
        redirectHops: targetRes.redirected ? 1 : 0,
        status: protocolStatus,
        message: protocolMessage,
      },
      remediationSnippets,
      sisterToolRecommendations,
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Website health scanner encountered an error: ${errorMsg}` },
      { status: 500 }
    );
  }
}
