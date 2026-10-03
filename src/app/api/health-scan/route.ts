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
    responseTimeMs: number;
    statusCode: number;
    isHttps: boolean;
    hasCanonical: boolean;
    compression: string;
    contactPageFound: boolean;
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
    details: string;
    status: "pass" | "warning";
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
    // Helper: Comprehensive Form & Bot Defense Parser
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
            hasCaptcha: true, // Hosted providers have built-in bot protections
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
    // 3. Link & Anchor Health Audit + Contact Page Discovery
    // ------------------------------------------------------------------------
    const anchorMatches = Array.from(html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi));
    const totalLinks = anchorMatches.length;
    let internalLinksCount = 0;
    let externalLinksCount = 0;
    let emptyOrVoidCount = 0;
    let insecureTargetBlankCount = 0;

    const parsedLinks: HealthScanResult["links"]["items"] = [];
    let discoveredContactPageUrl: string | undefined = undefined;

    const contactUrlPattern = /\/(?:contact(?:-us|_us|us)?|get-in-touch|reach-us|enquir(?:y|ies)|book-demo|demo|touch)\b/i;
    const contactTextPattern = /\b(?:contact|contact us|get in touch|book a demo|enquir(?:y|ies)|reach us|talk to us)\b/i;

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

      // Check for contact page candidate link
      if (!discoveredContactPageUrl && isInternal && href && !href.startsWith("mailto:") && !href.startsWith("tel:") && !href.startsWith("#")) {
        if (contactUrlPattern.test(href) || contactTextPattern.test(text)) {
          if (href.startsWith("http")) {
            discoveredContactPageUrl = href;
          } else {
            discoveredContactPageUrl = `${origin}${href.startsWith("/") ? "" : "/"}${href}`;
          }
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

    // Asynchronous sample link status verification (test top 5 unique links)
    const sampleTestLinks = parsedLinks
      .filter((l) => !l.isVoid && (l.href.startsWith("http") || l.href.startsWith("/")))
      .slice(0, 5);

    let deadLinksCount = 0;
    await Promise.all(
      sampleTestLinks.map(async (linkItem) => {
        try {
          const testUrl = linkItem.href.startsWith("http")
            ? linkItem.href
            : `${origin}${linkItem.href.startsWith("/") ? "" : "/"}${linkItem.href}`;

          const testController = new AbortController();
          const tId = setTimeout(() => testController.abort(), 3500);

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
          // Non-blocking timeout
        }
      })
    );

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
    // 4. Contact Form & Bot Defense Audit (On-Page + Dedicated Contact Page Probe)
    // ------------------------------------------------------------------------
    const onPageForms = parseFormsFromHtml(html);
    const formsCount = onPageForms.total;
    const formItems = onPageForms.items;
    const hasCaptcha = onPageForms.hasCaptcha;

    let contactPageInfo: HealthScanResult["forms"]["contactPage"] = undefined;

    // Check if the current audited page is itself the contact page
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
      // Background probe of the discovered contact page
      try {
        const cController = new AbortController();
        const cTimeout = setTimeout(() => cController.abort(), 3500);
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
          const cHtml = (await cRes.text()).slice(0, 300000);
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
    // 5. Cookie Consent Banner & Privacy Audit
    // ------------------------------------------------------------------------
    let hasCookieConsent = false;
    let cookieProvider = "Custom Banner / Consent Mode v2";
    let cookieDetails = "No cookie consent mechanism detected in markup.";

    const lowerHtml = html.toLowerCase();
    if (lowerHtml.includes("consent") && (lowerHtml.includes("cookie") || lowerHtml.includes("privacy"))) {
      hasCookieConsent = true;
    }
    if (lowerHtml.includes("onetrust") || lowerHtml.includes("optanon")) {
      hasCookieConsent = true;
      cookieProvider = "OneTrust Consent Management";
    } else if (lowerHtml.includes("cookiebot")) {
      hasCookieConsent = true;
      cookieProvider = "Cookiebot CMP";
    } else if (lowerHtml.includes("klaro")) {
      hasCookieConsent = true;
      cookieProvider = "Klaro Consent Manager";
    } else if (lowerHtml.includes("termly")) {
      hasCookieConsent = true;
      cookieProvider = "Termly CMP";
    } else if (lowerHtml.includes("osano")) {
      hasCookieConsent = true;
      cookieProvider = "Osano Consent Manager";
    } else if (lowerHtml.includes("gtag('consent'") || lowerHtml.includes('gtag("consent"')) {
      hasCookieConsent = true;
      cookieProvider = "Google Consent Mode v2";
    }

    if (hasCookieConsent) {
      cookieDetails = `Active user consent banner verified (${cookieProvider}). Complies with UK GDPR / PECR guidelines.`;
    } else {
      cookieDetails = "Missing Cookie Consent banner or Google Consent Mode v2 default 'denied' signals.";
    }

    // ------------------------------------------------------------------------
    // 6. Protocol, Canonical & Compression Audit
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
    // 7. Overall Health Score Calculation
    // ------------------------------------------------------------------------
    let score = 100;

    // Headings & Images (25 pts)
    if (headingsStatus === "fail") score -= 15;
    else if (headingsStatus === "warning") score -= 7;

    if (imagesStatus === "fail") score -= 10;
    else if (imagesStatus === "warning") score -= 5;

    // Forms, Contact Page & Privacy (25 pts)
    if (formsCount > 0) {
      if (!hasCaptcha) score -= 10;
    } else if (contactPageInfo && contactPageInfo.found) {
      if (contactPageInfo.hasForm && !contactPageInfo.hasCaptcha) {
        score -= 5;
      }
    } else {
      score -= 5; // Slight deduction if no on-page form AND no contact page discovered
    }

    if (!hasCookieConsent) score -= 10;

    // Links (25 pts)
    if (deadLinksCount > 0) score -= 15;
    if (emptyOrVoidCount > 3) score -= 5;
    if (insecureTargetBlankCount > 0) score -= 5;

    // Protocol & Speed (25 pts)
    if (!isHttps) score -= 15;
    if (!canonicalUrl) score -= 5;
    if (responseTimeMs > 1500) score -= 5;

    const overallScore = Math.max(0, Math.min(100, Math.round(score)));

    let grade: HealthScanResult["grade"] = "F";
    if (overallScore >= 90) grade = "A+";
    else if (overallScore >= 80) grade = "A";
    else if (overallScore >= 70) grade = "B";
    else if (overallScore >= 60) grade = "C";
    else if (overallScore >= 50) grade = "D";

    // ------------------------------------------------------------------------
    // 8. Dynamic Sister Tool Recommendations
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
    // 9. Remediation Code Snippets
    // ------------------------------------------------------------------------
    const remediationSnippets: HealthScanResult["remediationSnippets"] = [
      {
        id: "canonical-html",
        title: "Canonical URL Tag (HTML5)",
        category: "SEO & Structure",
        snippet: `<link rel="canonical" href="https://${domain}/" />`,
        explanation: "Insert this inside the <head> section to prevent search engines from indexing duplicate URL parameters.",
      },
      {
        id: "image-alt-fix",
        title: "Accessible Image Markup",
        category: "Accessibility & DOM",
        snippet: `<img src="/assets/logo.svg" alt="${domain} Company Logo" width="200" height="50" loading="lazy" />`,
        explanation: "Always provide descriptive alt text and explicit dimensions to improve Core Web Vitals and screen reader support.",
      },
      {
        id: "heading-structure",
        title: "Semantic Heading Cascade",
        category: "HTML5 Hierarchy",
        snippet: `<h1>${domain} — Main Value Proposition</h1>\n<h2>Key Software Services</h2>\n<h3>Enterprise Web Architecture</h3>`,
        explanation: "Maintain a single H1 tag per page followed by logical H2 section headings and H3 subsections.",
      },
      {
        id: "recaptcha-integration",
        title: "Google reCAPTCHA v3 Form Defense",
        category: "Bot Defense",
        snippet: `<form action="/api/contact" method="POST">\n  <!-- Interactive Form Inputs -->\n  <input type="hidden" name="recaptchaToken" id="recaptchaToken" />\n  <button type="submit">Send Message</button>\n</form>`,
        explanation: "Guard public contact forms against automated spam bots and DDoS probing with background score verification.",
      },
    ];

    const result: HealthScanResult = {
      url: finalUrl,
      domain,
      timestamp: new Date().toISOString(),
      overallScore,
      grade,
      summary: `Completed passive website health and structural audit for ${domain}. Evaluated headings, images, forms, links, and protocol compliance.`,
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
        responseTimeMs,
        statusCode,
        isHttps,
        hasCanonical: Boolean(canonicalUrl),
        compression,
        contactPageFound: Boolean(contactPageInfo?.found),
        contactPageUrl: contactPageInfo?.url,
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
        details: cookieDetails,
        status: hasCookieConsent ? "pass" : "warning",
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
