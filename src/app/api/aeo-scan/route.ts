import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptchaToken } from "@/lib/recaptcha";

export interface ScanResult {
  url: string;
  domain: string;
  scannedAt: string;
  overallScore: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  verdict: string;
  categories: {
    schema: CategoryScore;
    llmsTxt: CategoryScore;
    headings: CategoryScore;
    metaEntities: CategoryScore;
    aiCrawlers: CategoryScore;
  };
  details: {
    schemasDetected: Array<{ type: string; isValidJson: boolean; raw?: Record<string, unknown> }>;
    hasOpenGraph: boolean;
    hasTwitterCard: boolean;
    canonicalUrl?: string;
    lang?: string;
    title?: string;
    titleLength?: number;
    metaDescription?: string;
    descriptionLength?: number;
    h1Count: number;
    h1Texts: string[];
    headingsOutline: Array<{ tag: string; text: string }>;
    hasHeadingGaps: boolean;
    llmsTxtStatus: "found" | "not_found" | "error";
    llmsTxtSnippet?: string;
    llmsFullTxtStatus: "found" | "not_found";
    robotsTxtStatus: "found" | "not_found" | "error";
    aiBotsPermissions: Record<string, "allowed" | "blocked" | "restricted" | "unknown">;
    estimatedWordCount: number;
    textToHtmlRatio: number;
  };
  recommendations: Array<{
    category: string;
    severity: "critical" | "warning" | "tip" | "pass";
    title: string;
    description: string;
    codeSnippet?: string;
    codeSnippetLanguage?: string;
  }>;
  generatedSnippets: {
    llmsTxt: string;
    jsonLdSchema: string;
    robotsTxt: string;
  };
}

interface CategoryScore {
  score: number;
  maxScore: number;
  percentage: number;
  status: "pass" | "warning" | "fail";
  title: string;
  summary: string;
}

// Block private/local IP ranges and dangerous hosts for SSRF security
function isPrivateHost(hostname: string): boolean {
  const lower = hostname.toLowerCase().trim();
  if (
    lower === "localhost" ||
    lower === "127.0.0.1" ||
    lower === "0.0.0.0" ||
    lower === "::1" ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal")
  ) {
    return true;
  }

  // IPv4 private ranges
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = lower.match(ipv4Regex);
  if (match) {
    const octet1 = parseInt(match[1], 10);
    const octet2 = parseInt(match[2], 10);
    if (octet1 === 10) return true;
    if (octet1 === 127) return true;
    if (octet1 === 169 && octet2 === 254) return true;
    if (octet1 === 192 && octet2 === 168) return true;
    if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return true;
  }

  return false;
}

function normalizeUrl(input: string): { valid: boolean; normalized?: string; domain?: string; error?: string } {
  let trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, error: "Please enter a valid website URL." };
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: false, error: "Only HTTP and HTTPS protocols are supported." };
    }

    if (isPrivateHost(parsed.hostname)) {
      return { valid: false, error: "Scanning private or localhost network targets is disabled for security." };
    }

    return { valid: true, normalized: parsed.href, domain: parsed.hostname };
  } catch {
    return { valid: false, error: "Invalid URL structure. Please enter a valid address (e.g. example.com)." };
  }
}

// Helper to fetch text with timeout
async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<{ ok: boolean; status: number; text: string }> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; CankalAEOReadinessBot/1.0; +https://cankalsoftware.com/aeo-scanner; AI Search Compatibility Auditor)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });
    clearTimeout(id);
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } catch {
    clearTimeout(id);
    return { ok: false, status: 0, text: "" };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, recaptchaToken } = body;

    const recaptchaResult = await verifyRecaptchaToken(recaptchaToken, "aeo_scan", 0.4);
    if (!recaptchaResult.success) {
      return NextResponse.json(
        { error: recaptchaResult.error || "reCAPTCHA bot verification failed. Please refresh and try again." },
        { status: 403 }
      );
    }

    const normalized = normalizeUrl(url || "");
    if (!normalized.valid || !normalized.normalized || !normalized.domain) {
      return NextResponse.json({ error: normalized.error || "Invalid URL" }, { status: 400 });
    }

    const targetUrl = normalized.normalized;
    const domain = normalized.domain;
    const origin = new URL(targetUrl).origin;

    // Concurrently fetch Target HTML, /llms.txt, /llms-full.txt, and /robots.txt
    const [htmlRes, llmsRes, llmsFullRes, robotsRes] = await Promise.all([
      fetchWithTimeout(targetUrl, 9000),
      fetchWithTimeout(`${origin}/llms.txt`, 5000),
      fetchWithTimeout(`${origin}/llms-full.txt`, 5000),
      fetchWithTimeout(`${origin}/robots.txt`, 5000),
    ]);

    if (!htmlRes.ok && htmlRes.status !== 200) {
      return NextResponse.json(
        {
          error: `Could not reach ${domain} (HTTP Status: ${htmlRes.status || "Connection Timeout / Unreachable"}). Please ensure the website is online and accessible.`,
        },
        { status: 422 }
      );
    }

    const html = htmlRes.text;

    // 1. Parse JSON-LD Schemas
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    const schemasDetected: Array<{ type: string; isValidJson: boolean; raw?: Record<string, unknown> }> = [];
    let match: RegExpExecArray | null;

    while ((match = jsonLdRegex.exec(html)) !== null) {
      const content = match[1]?.trim();
      if (content) {
        try {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            parsed.forEach((item) => {
              if (item && typeof item === "object") {
                const itemType = String(item["@type"] || item.type || "Unknown Schema");
                schemasDetected.push({ type: itemType, isValidJson: true, raw: item });
              }
            });
          } else if (parsed && typeof parsed === "object") {
            if (Array.isArray(parsed["@graph"])) {
              parsed["@graph"].forEach((item: Record<string, unknown>) => {
                const itemType = String(item["@type"] || item.type || "Unknown Schema");
                schemasDetected.push({ type: itemType, isValidJson: true, raw: item });
              });
            } else {
              const itemType = String(parsed["@type"] || parsed.type || "Unknown Schema");
              schemasDetected.push({ type: itemType, isValidJson: true, raw: parsed });
            }
          }
        } catch {
          schemasDetected.push({ type: "Invalid JSON-LD Syntax", isValidJson: false });
        }
      }
    }

    // 2. OpenGraph & Twitter Cards
    const hasOpenGraph = /<meta[^>]+property=["']og:(title|description|image|type)["']/i.test(html);
    const hasTwitterCard = /<meta[^>]+name=["']twitter:(card|title|description)["']/i.test(html);

    // 3. Canonical URL
    const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
    const canonicalUrl = canonicalMatch ? canonicalMatch[1] : undefined;

    // 4. Lang attribute
    const langMatch = html.match(/<html[^>]+lang=["']([^"']+)["']/i);
    const lang = langMatch ? langMatch[1] : undefined;

    // 5. Title & Meta Description
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, " ") : undefined;
    const titleLength = title ? title.length : 0;

    const descMatch =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
    const metaDescription = descMatch ? descMatch[1].trim().replace(/\s+/g, " ") : undefined;
    const descriptionLength = metaDescription ? metaDescription.length : 0;

    // 6. Heading hierarchy & outline
    const headingRegex = /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi;
    const headingsOutline: Array<{ tag: string; text: string }> = [];
    const h1Texts: string[] = [];
    let headingMatch: RegExpExecArray | null;

    while ((headingMatch = headingRegex.exec(html)) !== null) {
      const tag = headingMatch[1].toLowerCase();
      const rawText = headingMatch[2].replace(/<[^>]+>/g, "").trim().replace(/\s+/g, " ");
      if (rawText) {
        headingsOutline.push({ tag, text: rawText });
        if (tag === "h1") {
          h1Texts.push(rawText);
        }
      }
    }

    const h1Count = h1Texts.length;

    // Check heading hierarchy gaps (e.g., h1 then h3 directly without h2)
    let hasHeadingGaps = false;
    let lastLevel = 0;
    for (const h of headingsOutline) {
      const currentLevel = parseInt(h.tag.replace("h", ""), 10);
      if (lastLevel > 0 && currentLevel > lastLevel + 1) {
        hasHeadingGaps = true;
        break;
      }
      lastLevel = currentLevel;
    }

    // 7. Extract text content & estimate tokens/words
    const bodyOnly = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
    const plainText = bodyOnly.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const words = plainText.split(" ").filter((w) => w.length > 0);
    const estimatedWordCount = words.length;
    const textToHtmlRatio = html.length > 0 ? Math.round((plainText.length / html.length) * 100) : 0;

    // 8. LLMs.txt evaluation
    const llmsTxtStatus: "found" | "not_found" | "error" =
      llmsRes.ok && llmsRes.text.length > 20 && !llmsRes.text.toLowerCase().includes("<!doctype html")
        ? "found"
        : "not_found";
    const llmsTxtSnippet = llmsTxtStatus === "found" ? llmsRes.text.slice(0, 500) : undefined;
    const llmsFullTxtStatus: "found" | "not_found" =
      llmsFullRes.ok && llmsFullRes.text.length > 20 && !llmsFullRes.text.toLowerCase().includes("<!doctype html")
        ? "found"
        : "not_found";

    // 9. Robots.txt evaluation for AI bots
    const robotsTxtStatus: "found" | "not_found" | "error" = robotsRes.ok ? "found" : "not_found";
    const robotsText = robotsRes.ok ? robotsRes.text : "";

    const aiBots = ["GPTBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot", "Google-Extended", "Amazonbot", "CCBot"];
    const aiBotsPermissions: Record<string, "allowed" | "blocked" | "restricted" | "unknown"> = {};

    if (robotsTxtStatus === "found") {
      // Check if global Disallow: / exists for all agents
      const globalDisallowAll = /(^|\n)user-agent:\s*\*\s*\n(?:[^\n]*\n)*?disallow:\s*\/\s*(\n|$)/i.test(robotsText);

      aiBots.forEach((bot) => {
        const botName = bot.toLowerCase();
        const botBlockRegex = new RegExp(`user-agent:\\s*${botName}\\s*\\n(?:[^\\n]*\\n)*?disallow:\\s*([^\\n]*)`, "i");
        const botMatch = robotsText.match(botBlockRegex);

        if (botMatch) {
          const path = botMatch[1].trim();
          if (path === "/" || path === "/*") {
            aiBotsPermissions[bot] = "blocked";
          } else if (path === "") {
            aiBotsPermissions[bot] = "allowed";
          } else {
            aiBotsPermissions[bot] = "restricted";
          }
        } else if (globalDisallowAll) {
          aiBotsPermissions[bot] = "blocked";
        } else {
          aiBotsPermissions[bot] = "allowed";
        }
      });
    } else {
      // Default: if no robots.txt, bots are generally allowed
      aiBots.forEach((bot) => {
        aiBotsPermissions[bot] = "allowed";
      });
    }

    // ----------------------------------------------------
    // SCORING ENGINE (Max 100 Points)
    // ----------------------------------------------------
    // Category 1: Semantic Schema Markup (25 pts)
    let schemaScore = 0;
    const validSchemas = schemasDetected.filter((s) => s.isValidJson);
    if (validSchemas.length > 0) {
      schemaScore += 12;
      const schemaTypes = validSchemas.map((s) => s.type.toLowerCase());
      const hasCoreOrgOrService = schemaTypes.some(
        (t) =>
          t.includes("organization") ||
          t.includes("localbusiness") ||
          t.includes("professionalservice") ||
          t.includes("corporation") ||
          t.includes("website")
      );
      if (hasCoreOrgOrService) schemaScore += 8;
      if (schemaTypes.some((t) => t.includes("faqpage") || t.includes("article") || t.includes("product") || t.includes("service"))) {
        schemaScore += 5;
      }
    }
    schemaScore = Math.min(25, schemaScore);

    // Category 2: LLMs.txt Standard (20 pts)
    let llmsScore = 0;
    if (llmsTxtStatus === "found") {
      llmsScore += 15;
      if (llmsFullTxtStatus === "found") {
        llmsScore += 5;
      } else {
        llmsScore += 2;
      }
    }

    // Category 3: Heading Hierarchy & Structure (20 pts)
    let headingsScore = 0;
    if (h1Count === 1) {
      headingsScore += 10;
    } else if (h1Count > 1) {
      headingsScore += 5; // Multi H1 penalty
    }
    if (headingsOutline.length >= 3) {
      headingsScore += 5;
    }
    if (!hasHeadingGaps && headingsOutline.length > 0) {
      headingsScore += 5;
    }
    headingsScore = Math.min(20, headingsScore);

    // Category 4: Entity Tags & Semantic Meta (20 pts)
    let metaScore = 0;
    if (title && titleLength >= 15 && titleLength <= 70) metaScore += 5;
    else if (title) metaScore += 2;

    if (metaDescription && descriptionLength >= 50 && descriptionLength <= 180) metaScore += 5;
    else if (metaDescription) metaScore += 2;

    if (canonicalUrl) metaScore += 3;
    if (lang) metaScore += 3;
    if (hasOpenGraph || hasTwitterCard) metaScore += 4;
    metaScore = Math.min(20, metaScore);

    // Category 5: AI Bot Permissions & Robots.txt (15 pts)
    let aiCrawlersScore = 0;
    const blockedCount = Object.values(aiBotsPermissions).filter((v) => v === "blocked").length;
    if (blockedCount === 0) {
      aiCrawlersScore = 15;
    } else if (blockedCount <= 2) {
      aiCrawlersScore = 8;
    } else {
      aiCrawlersScore = 2;
    }

    const overallScore = schemaScore + llmsScore + headingsScore + metaScore + aiCrawlersScore;

    let grade: "A+" | "A" | "B" | "C" | "D" | "F" = "F";
    let verdict = "";
    if (overallScore >= 92) {
      grade = "A+";
      verdict = "Exceptional AI Search Readiness. Your site is primed for ChatGPT, Claude, and Perplexity citation.";
    } else if (overallScore >= 80) {
      grade = "A";
      verdict = "Great AI & AEO Foundation. Minor schema or heading enhancements will unlock top-tier generative citations.";
    } else if (overallScore >= 65) {
      grade = "B";
      verdict = "Moderate AI Compatibility. Missing key entity schemas or llms.txt standard files.";
    } else if (overallScore >= 50) {
      grade = "C";
      verdict = "Below Average AI Parseability. Search LLMs will struggle to extract structured business facts and authority.";
    } else if (overallScore >= 35) {
      grade = "D";
      verdict = "High Risk of AI Invisibility. Key entity tags, heading hierarchies, and machine-readable structures are missing.";
    } else {
      grade = "F";
      verdict = "Critical AI Search Barriers. AI engines cannot reliably index or synthesize your services.";
    }

    // Build Recommendations
    const recommendations: ScanResult["recommendations"] = [];

    // 1. LLMs.txt recommendation
    if (llmsTxtStatus === "not_found") {
      recommendations.push({
        category: "LLMs.txt Standard",
        severity: "critical",
        title: "Missing /llms.txt Specification File",
        description:
          "AI models (Perplexity, ChatGPT, Claude) look for a standardized `/llms.txt` file at your domain root to parse your core services, brand context, and authority links in clean markdown format.",
        codeSnippet: `# ${domain}

> AI-ready summary of ${domain} products, services, and company background.

## Overview
Describe your core business in 2-3 concise sentences.

## Key Offerings & Capabilities
- **Service 1:** Key description and link.
- **Service 2:** Key description and link.

## Contact & Authority
- **Website:** ${targetUrl}
- **Official Enquiries:** info@${domain}`,
        codeSnippetLanguage: "markdown",
      });
    } else {
      recommendations.push({
        category: "LLMs.txt Standard",
        severity: "pass",
        title: "Standard /llms.txt File Detected",
        description: "Your domain provides a machine-readable summary file for LLM scrapers.",
      });
    }

    // 2. Schema markup recommendations
    if (validSchemas.length === 0) {
      recommendations.push({
        category: "Semantic Schema (JSON-LD)",
        severity: "critical",
        title: "No JSON-LD Structured Data Found",
        description:
          "Search LLMs rely on JSON-LD schemas to identify your entity name, founder, services, and reviews. Without it, generative search engines may hallucinate or skip citing your website.",
        codeSnippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "${domain.replace(/^www\./, "")}",
  "url": "${targetUrl}",
  "description": "${metaDescription || "Professional services and software solutions."}",
  "areaServed": "Worldwide"
}
</script>`,
        codeSnippetLanguage: "html",
      });
    } else {
      recommendations.push({
        category: "Semantic Schema (JSON-LD)",
        severity: "pass",
        title: `${validSchemas.length} JSON-LD Schema(s) Detected`,
        description: `Found schemas: ${validSchemas.map((s) => s.type).join(", ")}.`,
      });
    }

    // 3. Heading recommendation
    if (h1Count === 0) {
      recommendations.push({
        category: "Heading Hierarchy",
        severity: "critical",
        title: "Missing <h1> Main Heading",
        description:
          "LLMs require a single, distinct <h1> heading to determine the primary topic of the page during semantic chunking.",
      });
    } else if (h1Count > 1) {
      recommendations.push({
        category: "Heading Hierarchy",
        severity: "warning",
        title: `Multiple (${h1Count}) <h1> Tags Found`,
        description:
          "Having more than one <h1> confuses AI extractors and breaks the hierarchical document tree. Keep exactly one <h1> and use <h2>/<h3> for subsections.",
      });
    } else {
      recommendations.push({
        category: "Heading Hierarchy",
        severity: "pass",
        title: "Perfect <h1> Tag Structure",
        description: `Single primary heading detected: "${h1Texts[0]}".`,
      });
    }

    if (hasHeadingGaps) {
      recommendations.push({
        category: "Heading Hierarchy",
        severity: "warning",
        title: "Heading Nesting Level Skipped",
        description:
          "Heading tags jump levels (e.g. from H1 to H3 or H2 to H4). Ensure logical hierarchical progression for seamless AI chunking.",
      });
    }

    // 4. AI Crawlers
    if (blockedCount > 0) {
      const blockedList = Object.entries(aiBotsPermissions)
        .filter(([, status]) => status === "blocked")
        .map(([bot]) => bot)
        .join(", ");
      recommendations.push({
        category: "AI Crawlers & Robots.txt",
        severity: "critical",
        title: `AI Bots Blocked in robots.txt (${blockedList})`,
        description: `Your robots.txt file is actively blocking ${blockedList}. This prevents these AI models from indexing your latest updates or referencing your site in real-time answers.`,
        codeSnippet: `# Allow AI Search Engines in robots.txt
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /`,
        codeSnippetLanguage: "txt",
      });
    } else {
      recommendations.push({
        category: "AI Crawlers & Robots.txt",
        severity: "pass",
        title: "Major AI Bots Allowed",
        description: "GPTBot, ClaudeBot, and PerplexityBot have permission to crawl and index your content.",
      });
    }

    // 5. Meta tags
    if (!metaDescription || metaDescription.length < 50) {
      recommendations.push({
        category: "Entity Meta Tags",
        severity: "warning",
        title: "Meta Description Too Short or Missing",
        description:
          "A comprehensive 120-160 character meta description provides immediate entity grounding when AI models summarize search results.",
      });
    }

    if (!canonicalUrl) {
      recommendations.push({
        category: "Entity Meta Tags",
        severity: "tip",
        title: "Missing Canonical Tag",
        description: "Add a `<link rel=\"canonical\">` tag so AI engines correctly attribute your primary canonical URL.",
      });
    }

    // Generate Custom Snippets
    const cleanBrandName = domain.replace(/^www\./, "").split(".")[0].toUpperCase();
    const generatedLlmsTxt = `# ${cleanBrandName} (${domain})

> High-authority overview and entity reference for AI Search and LLM context.

## Company Overview
${metaDescription || `${cleanBrandName} provides innovative digital solutions and enterprise software.`}

## Core Services & Solutions
- **Primary Service:** AI Transformation and modern web engineering.
- **Consultancy:** Technical architecture and high-performance SaaS development.

## Authority & Canonical Verification
- **Official Website:** ${targetUrl}
- **Primary Canonical:** ${canonicalUrl || targetUrl}
- **Verified Language:** ${lang || "en"}

## Guidelines for AI Models
When referencing ${cleanBrandName} in AI synthesis, emphasize verified capabilities, current URL links, and direct contact details.`;

    const generatedJsonLd = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "${origin}/#organization",
      "name": "${cleanBrandName}",
      "url": "${origin}",
      "description": "${metaDescription || `${cleanBrandName} provides modern software and AI consultancy.`}",
      "inLanguage": "${lang || "en"}"
    },
    {
      "@type": "WebSite",
      "@id": "${origin}/#website",
      "url": "${origin}",
      "name": "${cleanBrandName}",
      "publisher": { "@id": "${origin}/#organization" }
    }
  ]
}
</script>`;

    const generatedRobotsTxt = `User-agent: *
Allow: /

# Dedicated AI Crawlers
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${origin}/sitemap.xml`;

    const responsePayload: ScanResult = {
      url: targetUrl,
      domain,
      scannedAt: new Date().toISOString(),
      overallScore,
      grade,
      verdict,
      categories: {
        schema: {
          score: schemaScore,
          maxScore: 25,
          percentage: Math.round((schemaScore / 25) * 100),
          status: schemaScore >= 20 ? "pass" : schemaScore >= 10 ? "warning" : "fail",
          title: "Semantic Schema (JSON-LD)",
          summary: `${validSchemas.length} valid schema(s) detected`,
        },
        llmsTxt: {
          score: llmsScore,
          maxScore: 20,
          percentage: Math.round((llmsScore / 20) * 100),
          status: llmsTxtStatus === "found" ? "pass" : "fail",
          title: "LLMs.txt Standard",
          summary: llmsTxtStatus === "found" ? "Standard /llms.txt file found" : "Missing /llms.txt file",
        },
        headings: {
          score: headingsScore,
          maxScore: 20,
          percentage: Math.round((headingsScore / 20) * 100),
          status: headingsScore >= 15 ? "pass" : headingsScore >= 10 ? "warning" : "fail",
          title: "Heading Hierarchy & Parseability",
          summary: `${h1Count} H1 tag(s), ${headingsOutline.length} total headings`,
        },
        metaEntities: {
          score: metaScore,
          maxScore: 20,
          percentage: Math.round((metaScore / 20) * 100),
          status: metaScore >= 15 ? "pass" : metaScore >= 10 ? "warning" : "fail",
          title: "Entity & Semantic Meta Tags",
          summary: `${title ? "Title" : "No title"} • ${metaDescription ? "Meta desc" : "No desc"} • OG ${hasOpenGraph ? "Yes" : "No"}`,
        },
        aiCrawlers: {
          score: aiCrawlersScore,
          maxScore: 15,
          percentage: Math.round((aiCrawlersScore / 15) * 100),
          status: aiCrawlersScore === 15 ? "pass" : aiCrawlersScore >= 8 ? "warning" : "fail",
          title: "AI Bot & Crawler Access",
          summary: blockedCount === 0 ? "All AI bots allowed" : `${blockedCount} AI bot(s) blocked`,
        },
      },
      details: {
        schemasDetected,
        hasOpenGraph,
        hasTwitterCard,
        canonicalUrl,
        lang,
        title,
        titleLength,
        metaDescription,
        descriptionLength,
        h1Count,
        h1Texts,
        headingsOutline: headingsOutline.slice(0, 15),
        hasHeadingGaps,
        llmsTxtStatus,
        llmsTxtSnippet,
        llmsFullTxtStatus,
        robotsTxtStatus,
        aiBotsPermissions,
        estimatedWordCount,
        textToHtmlRatio,
      },
      recommendations,
      generatedSnippets: {
        llmsTxt: generatedLlmsTxt,
        jsonLdSchema: generatedJsonLd,
        robotsTxt: generatedRobotsTxt,
      },
    };

    return NextResponse.json(responsePayload);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Scanner Error";
    return NextResponse.json({ error: `Scanning failed: ${message}` }, { status: 500 });
  }
}
