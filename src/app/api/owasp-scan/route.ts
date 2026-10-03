import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptchaToken } from "@/lib/recaptcha";

export interface OwaspItem {
  id: string; // e.g. "A01:2026", "A02:2026"
  categoryCode: "A01" | "A02" | "A03" | "A04" | "A05" | "A06" | "A07" | "A08" | "A09" | "A10";
  name: string;
  status: "pass" | "warning" | "fail";
  score: number;
  maxScore: number;
  title: string;
  summary: string;
  explanation: string;
  cvssScore?: number;
  cwe?: string;
  impact?: string;
  remediation: string;
  codeSnippet?: string;
  references: Array<{ name: string; url: string }>;
}

export interface OwaspScanResult {
  url: string;
  domain: string;
  scannedAt: string;
  overallScore: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  riskLevel: "Low Risk (Hardened)" | "Moderate Risk" | "High Risk" | "Critical Risk";
  verdict: string;
  passedCount: number;
  warningCount: number;
  failedCount: number;
  checklist: OwaspItem[];
  detectedTech: Array<{
    name: string;
    version?: string;
    category: string;
  }>;
  remediationSnippets: {
    nginxConfig: string;
    apacheHtaccess: string;
    nextjsConfig: string;
  };
}

// Block private/local IP ranges and dangerous hosts for SSRF prevention
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl = (body.url || "").trim();
    const recaptchaToken = body.recaptchaToken;

    if (!rawUrl) {
      return NextResponse.json({ error: "Please enter a valid website URL or domain." }, { status: 400 });
    }

    // Optional reCAPTCHA v3 verification
    if (recaptchaToken) {
      try {
        const recaptchaResult = await verifyRecaptchaToken(recaptchaToken, "owasp_scan", 0.4);
        if (!recaptchaResult.success) {
          return NextResponse.json(
            { error: "Automated bot verification failed. Please refresh and try again." },
            { status: 400 }
          );
        }
      } catch {
        // Continue gracefully if reCAPTCHA verification is unavailable
      }
    }

    // Normalise URL
    let formattedUrl = rawUrl;
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

    // Helper fetch with strict timeouts and browser user-agent
    const fetchWithTimeout = async (target: string, maxBytes = 350000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7500);

      try {
        const res = await fetch(target, {
          signal: controller.signal,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 (CankalSoftware-OWASP-Audit/2026; +https://cankalsoftware.com)",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
          },
          redirect: "follow",
        });
        clearTimeout(timeoutId);

        const headers = res.headers;
        const text = (await res.text()).slice(0, maxBytes);
        return { ok: res.ok, status: res.status, headers, text, finalUrl: res.url };
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        const msg = err instanceof Error ? err.message : String(err);
        return { ok: false, status: 0, headers: new Headers(), text: "", finalUrl: target, error: msg };
      }
    };

    // Parallel passive probes
    const [targetRes, securityTxtRes, wellKnownSecurityRes, gitRes, envRes] = await Promise.all([
      fetchWithTimeout(formattedUrl),
      fetchWithTimeout(`${origin}/security.txt`, 4000),
      fetchWithTimeout(`${origin}/.well-known/security.txt`, 4000),
      fetchWithTimeout(`${origin}/.git/HEAD`, 1000),
      fetchWithTimeout(`${origin}/.env`, 1000),
    ]);

    if (!targetRes.ok && targetRes.status === 0) {
      return NextResponse.json(
        {
          error: `Could not connect to ${domain}. Please check that the server is online and reachable over HTTPS/HTTP.`,
        },
        { status: 502 }
      );
    }

    const html = targetRes.text;
    const headers = targetRes.headers;
    const isHttps = targetRes.finalUrl.startsWith("https://");

    // ------------------------------------------------------------------------
    // Extraction of Headers, Cookies & Page Attributes
    // ------------------------------------------------------------------------
    const csp = headers.get("content-security-policy");
    const hsts = headers.get("strict-transport-security");
    const xFrame = headers.get("x-frame-options");
    const xContentType = headers.get("x-content-type-options");
    const referrerPolicy = headers.get("referrer-policy");
    const permissionsPolicy = headers.get("permissions-policy") || headers.get("feature-policy");
    const coop = headers.get("cross-origin-opener-policy");
    const corp = headers.get("cross-origin-resource-policy");
    const serverHeader = headers.get("server");
    const poweredBy = headers.get("x-powered-by");
    const setCookie = headers.get("set-cookie") || "";
    const corsOrigin = headers.get("access-control-allow-origin");
    const reportTo = headers.get("report-to") || headers.get("reporting-endpoints") || headers.get("nel");

    const hasSecurityTxt =
      (securityTxtRes.ok && securityTxtRes.text.includes("Contact:")) ||
      (wellKnownSecurityRes.ok && wellKnownSecurityRes.text.includes("Contact:"));

    // Tech stack fingerprinting
    const detectedTech: OwaspScanResult["detectedTech"] = [];
    if (serverHeader) {
      detectedTech.push({ name: serverHeader, category: "Web Server" });
    }
    if (poweredBy) {
      detectedTech.push({ name: poweredBy, category: "Runtime / Framework" });
    }
    if (html.includes("__NEXT_DATA__") || html.includes("/_next/static/")) {
      detectedTech.push({ name: "Next.js (React)", category: "Framework" });
    }
    if (html.includes("/wp-content/") || html.includes("/wp-includes/")) {
      detectedTech.push({ name: "WordPress", category: "CMS" });
    }
    const jqueryMatch = html.match(/jquery[-.]([\d.]+)(?:\.min)?\.js/i);
    if (jqueryMatch) {
      detectedTech.push({ name: "jQuery", version: jqueryMatch[1], category: "JS Library" });
    }

    // ------------------------------------------------------------------------
    // 2026 OWASP Top 10 Evaluation Engine
    // ------------------------------------------------------------------------
    const checklist: OwaspItem[] = [];

    // ------------------------------------------------------------------------
    // A01:2026 - Broken Access Control
    // ------------------------------------------------------------------------
    let a01Score = 10;
    let a01Status: OwaspItem["status"] = "pass";
    let a01Summary = "CORS policies and UI framing controls are securely restricted.";
    let a01Explanation =
      "Cross-Origin Resource Sharing (CORS) is restricted to explicit origins or same-origin. X-Frame-Options or CSP frame-ancestors prevents Clickjacking framing.";

    if (corsOrigin === "*") {
      a01Score -= 5;
      a01Status = "warning";
      a01Summary = "Wildcard CORS ('*') detected on responses.";
      a01Explanation =
        "The server returns 'Access-Control-Allow-Origin: *', which allows any third-party domain to read cross-origin responses. If this endpoint returns user data, it can lead to data leakage.";
    }

    if (!xFrame && (!csp || !csp.includes("frame-ancestors"))) {
      a01Score -= 4;
      a01Status = a01Status === "pass" ? "warning" : "fail";
      a01Summary = "Missing Clickjacking protection (X-Frame-Options / frame-ancestors).";
      a01Explanation +=
        " Pages lack X-Frame-Options (DENY/SAMEORIGIN), allowing malicious sites to load your application inside invisible iframes to hijack user clicks.";
    }

    checklist.push({
      id: "A01:2026",
      categoryCode: "A01",
      name: "Broken Access Control",
      status: a01Status,
      score: Math.max(0, a01Score),
      maxScore: 10,
      title: a01Status === "pass" ? "Access Control & Framing Defences Active" : "Access Control & Framing Weaknesses Detected",
      summary: a01Summary,
      explanation: a01Explanation,
      cvssScore: a01Status === "pass" ? undefined : 6.5,
      cwe: "CWE-942 (Permissive CORS) • CWE-1021 (Clickjacking)",
      impact: "Unauthorized cross-origin API querying and UI redress/clickjacking attacks against logged-in users.",
      remediation: "Set 'X-Frame-Options: SAMEORIGIN' and restrict 'Access-Control-Allow-Origin' to trusted, explicit domains.",
      codeSnippet: "add_header X-Frame-Options \"SAMEORIGIN\" always;\nadd_header Access-Control-Allow-Origin \"https://app.yourdomain.com\";",
      references: [
        { name: "OWASP Top 10 - A01 Broken Access Control", url: "https://owasp.org/Top10/A01_2021-Broken_Access_Control/" },
        { name: "PortSwigger CORS Vulnerabilities", url: "https://portswigger.net/web-security/cors" },
      ],
    });

    // ------------------------------------------------------------------------
    // A02:2026 - Cryptographic Failures
    // ------------------------------------------------------------------------
    let a02Score = 10;
    let a02Status: OwaspItem["status"] = "pass";
    let a02Summary = "HTTPS and HSTS transport encryption are properly enforced.";
    let a02Explanation =
      "The application enforces HTTPS and serves Strict-Transport-Security (HSTS), preventing SSL-stripping and downgrade attacks.";

    if (!isHttps) {
      a02Score = 0;
      a02Status = "fail";
      a02Summary = "Insecure Plaintext HTTP: HTTPS is not active.";
      a02Explanation =
        "The website serves content over unencrypted HTTP. All passwords, session tokens, and data packets can be intercepted in transit.";
    } else if (!hsts) {
      a02Score -= 4;
      a02Status = "warning";
      a02Summary = "Missing HTTP Strict Transport Security (HSTS).";
      a02Explanation =
        "While HTTPS is active, the HSTS header is missing. Browsers connecting via public Wi-Fi or compromised routers are susceptible to SSL-stripping MitM attacks.";
    }

    checklist.push({
      id: "A02:2026",
      categoryCode: "A02",
      name: "Cryptographic Failures",
      status: a02Status,
      score: Math.max(0, a02Score),
      maxScore: 10,
      title: a02Status === "pass" ? "Strong Transport Layer Encryption (TLS & HSTS)" : "Cryptographic & Transport Vulnerabilities",
      summary: a02Summary,
      explanation: a02Explanation,
      cvssScore: a02Status === "pass" ? undefined : a02Status === "fail" ? 8.2 : 5.9,
      cwe: "CWE-319 (Cleartext Transmission) • CWE-326 (Weak Encryption)",
      impact: "Man-in-the-Middle (MitM) eavesdropping and session credential interception on public networks.",
      remediation: "Enforce HTTPS redirect and add 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload'.",
      codeSnippet: "add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains; preload\" always;",
      references: [
        { name: "OWASP Top 10 - A02 Cryptographic Failures", url: "https://owasp.org/Top10/A02_2021-Cryptographic_Failures/" },
        { name: "NCSC UK TLS Configuration", url: "https://www.ncsc.gov.uk/collection/device-security-guidance" },
      ],
    });

    // ------------------------------------------------------------------------
    // A03:2026 - Injection & Cross-Site Scripting (XSS)
    // ------------------------------------------------------------------------
    let a03Score = 10;
    let a03Status: OwaspItem["status"] = "pass";
    let a03Summary = "Robust Content-Security-Policy (CSP) and MIME-type defences active.";
    let a03Explanation =
      "A strict Content-Security-Policy and 'X-Content-Type-Options: nosniff' header are configured, mitigating XSS and script injection.";

    if (!csp) {
      a03Score -= 6;
      a03Status = "fail";
      a03Summary = "Missing Content-Security-Policy (CSP) Header.";
      a03Explanation =
        "The website lacks a Content-Security-Policy header. Browsers will execute any inline or externally loaded JavaScript payload if reflected or stored XSS is triggered.";
    }

    if (!xContentType || !xContentType.toLowerCase().includes("nosniff")) {
      a03Score -= 3;
      a03Status = a03Status === "pass" ? "warning" : a03Status;
      a03Explanation += " Missing 'X-Content-Type-Options: nosniff' permits MIME-sniffing exploits.";
    }

    checklist.push({
      id: "A03:2026",
      categoryCode: "A03",
      name: "Injection & XSS",
      status: a03Status,
      score: Math.max(0, a03Score),
      maxScore: 10,
      title: a03Status === "pass" ? "Content Security Policy (CSP) & XSS Defences Active" : "High Injection & Cross-Site Scripting (XSS) Exposure",
      summary: a03Summary,
      explanation: a03Explanation,
      cvssScore: a03Status === "pass" ? undefined : 7.5,
      cwe: "CWE-79 (Cross-site Scripting) • CWE-430 (MIME Confusion)",
      impact: "Stored/reflected XSS, session cookie harvesting, keylogging, and rogue third-party script execution in visitor browsers.",
      remediation: "Deploy a Content-Security-Policy header restricting script sources and enforce 'X-Content-Type-Options: nosniff'.",
      codeSnippet: "add_header Content-Security-Policy \"default-src 'self'; script-src 'self' 'unsafe-inline' https:;\" always;\nadd_header X-Content-Type-Options \"nosniff\" always;",
      references: [
        { name: "OWASP Top 10 - A03 Injection", url: "https://owasp.org/Top10/A03_2021-Injection/" },
        { name: "OWASP CSP Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html" },
      ],
    });

    // ------------------------------------------------------------------------
    // A04:2026 - Insecure Design & Bot Resilience
    // ------------------------------------------------------------------------
    let a04Score = 10;
    let a04Status: OwaspItem["status"] = "pass";
    let a04Summary = "RFC 9116 security.txt contact and responsible disclosure channel active.";
    let a04Explanation =
      "The domain publishes an RFC 9116 security.txt file, providing ethical security researchers with a verified vulnerability reporting channel.";

    if (!hasSecurityTxt) {
      a04Score -= 3;
      a04Status = "warning";
      a04Summary = "Missing RFC 9116 security.txt Contact File.";
      a04Explanation =
        "No security.txt file was found at /.well-known/security.txt or /security.txt. NCSC UK recommends this file to ensure vulnerability reports reach security teams promptly.";
    }

    checklist.push({
      id: "A04:2026",
      categoryCode: "A04",
      name: "Insecure Design & Bot Resilience",
      status: a04Status,
      score: Math.max(0, a04Score),
      maxScore: 10,
      title: a04Status === "pass" ? "Responsible Disclosure & Security Governance Present" : "Missing Security Disclosure & Vulnerability Contact Policy",
      summary: a04Summary,
      explanation: a04Explanation,
      cvssScore: a04Status === "pass" ? undefined : 3.8,
      cwe: "CWE-1059 (Incomplete Documentation / Missing Security Channel)",
      impact: "Security researchers who discover critical zero-days cannot reach your engineering team before public disclosure.",
      remediation: "Create a '/.well-known/security.txt' file with Contact, Expires, and Preferred-Languages fields.",
      codeSnippet: "Contact: mailto:security@yourcompany.com\nExpires: 2027-12-31T23:59:59.000Z\nPreferred-Languages: en",
      references: [
        { name: "OWASP Top 10 - A04 Insecure Design", url: "https://owasp.org/Top10/A04_2021-Insecure_Design/" },
        { name: "RFC 9116 security.txt Standard", url: "https://www.rfc-editor.org/rfc/rfc9116.html" },
      ],
    });

    // ------------------------------------------------------------------------
    // A05:2026 - Security Misconfiguration
    // ------------------------------------------------------------------------
    let a05Score = 10;
    let a05Status: OwaspItem["status"] = "pass";
    let a05Summary = "Zero server banner leakage; security headers and error boundaries hardened.";
    let a05Explanation =
      "Web server headers (Server, X-Powered-By) are masked or stripped, preventing automated bot reconnaissance.";

    const leaksServer = serverHeader && /\d+\.\d+/.test(serverHeader);
    const leaksPowered = Boolean(poweredBy);

    if (leaksServer || leaksPowered) {
      a05Score -= 4;
      a05Status = "warning";
      a05Summary = `Server Version / Runtime Disclosed (${[serverHeader, poweredBy].filter(Boolean).join(", ")}).`;
      a05Explanation =
        `The web server discloses runtime details (${[serverHeader ? `Server: ${serverHeader}` : "", poweredBy ? `X-Powered-By: ${poweredBy}` : ""].filter(Boolean).join(", ")}). Attackers use these version numbers to search for targeted CVE exploits.`;
    }

    if (!referrerPolicy) {
      a05Score -= 2;
      if (a05Status === "pass") a05Status = "warning";
      a05Explanation += " Missing 'Referrer-Policy' header may leak sensitive URL parameters to external sites.";
    }

    checklist.push({
      id: "A05:2026",
      categoryCode: "A05",
      name: "Security Misconfiguration",
      status: a05Status,
      score: Math.max(0, a05Score),
      maxScore: 10,
      title: a05Status === "pass" ? "Hardened Server Configuration & Banner Masking" : "Server Banner & Information Disclosure Misconfiguration",
      summary: a05Summary,
      explanation: a05Explanation,
      cvssScore: a05Status === "pass" ? undefined : 4.3,
      cwe: "CWE-200 (Information Exposure) • CWE-16 (Configuration)",
      impact: "Provides automated exploit bots with exact version numbers and architectural intelligence for targeted exploitation.",
      remediation: "Disable server banners (e.g. 'server_tokens off;' in Nginx, 'expose_php = Off' in PHP, 'poweredByHeader: false' in Next.js).",
      codeSnippet: "server_tokens off;\nproxy_hide_header X-Powered-By;\nadd_header Referrer-Policy \"strict-origin-when-cross-origin\" always;",
      references: [
        { name: "OWASP Top 10 - A05 Security Misconfiguration", url: "https://owasp.org/Top10/A05_2021-Security_Misconfiguration/" },
        { name: "CIS Web Server Benchmarks", url: "https://www.cisecurity.org/benchmark/" },
      ],
    });

    // ------------------------------------------------------------------------
    // A06:2026 - Vulnerable and Outdated Components
    // ------------------------------------------------------------------------
    let a06Score = 10;
    let a06Status: OwaspItem["status"] = "pass";
    let a06Summary = "No legacy or vulnerable component versions identified in client scripts.";
    let a06Explanation =
      "Frontend JavaScript libraries, frameworks, and CMS engines appear modern and free from known high-severity CVEs.";

    if (jqueryMatch && jqueryMatch[1]) {
      const jVer = jqueryMatch[1];
      if (jVer.startsWith("1.") || jVer.startsWith("2.") || (jVer.startsWith("3.") && parseFloat(jVer.slice(2)) < 5)) {
        a06Score -= 5;
        a06Status = "warning";
        a06Summary = `Legacy jQuery v${jVer} Detected (Vulnerable to XSS / Prototype Pollution).`;
        a06Explanation =
          `jQuery v${jVer} contains known vulnerabilities (CVE-2020-11022, CVE-2020-11023) allowing XSS via HTML manipulation. Update to jQuery 3.7+ or modern vanilla JS.`;
      }
    }

    if (html.includes("/wp-content/") && /wp-includes/i.test(html)) {
      const wpVerMatch = html.match(/ver=([3-6]\.\d+(?:\.\d+)?)/i);
      if (wpVerMatch && (wpVerMatch[1].startsWith("5.") || wpVerMatch[1].startsWith("4."))) {
        a06Score -= 6;
        a06Status = "fail";
        a06Summary = `Outdated WordPress Core v${wpVerMatch[1]} Detected.`;
        a06Explanation = `WordPress v${wpVerMatch[1]} contains critical known CVE vulnerabilities. Immediate patching is required.`;
      }
    }

    checklist.push({
      id: "A06:2026",
      categoryCode: "A06",
      name: "Vulnerable and Outdated Components",
      status: a06Status,
      score: Math.max(0, a06Score),
      maxScore: 10,
      title: a06Status === "pass" ? "Modern & Maintained Software Stack" : "Known Vulnerabilities in Outdated Components",
      summary: a06Summary,
      explanation: a06Explanation,
      cvssScore: a06Status === "pass" ? undefined : 6.8,
      cwe: "CWE-1104 (Use of Unmaintained Third-Party Components)",
      impact: "Attackers can exploit publicly published proof-of-concept (PoC) exploits against unpatched libraries.",
      remediation: "Audit and upgrade all JavaScript dependencies, plugins, and server software to latest LTS releases.",
      codeSnippet: "npm audit fix\n# or update CDN script tags to latest verified releases",
      references: [
        { name: "OWASP Top 10 - A06 Vulnerable Components", url: "https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/" },
        { name: "NIST NVD Catalogue", url: "https://nvd.nist.gov" },
      ],
    });

    // ------------------------------------------------------------------------
    // A07:2026 - Identification & Authentication Failures
    // ------------------------------------------------------------------------
    let a07Score = 10;
    let a07Status: OwaspItem["status"] = "pass";
    let a07Summary = "Session cookies configured with HttpOnly, Secure, and SameSite protection.";
    let a07Explanation =
      "Cookies issued by the application are protected against JavaScript access (HttpOnly) and CSRF attacks (SameSite).";

    if (setCookie) {
      const cookieLower = setCookie.toLowerCase();
      if (!cookieLower.includes("httponly")) {
        a07Score -= 4;
        a07Status = "warning";
        a07Summary = "Cookies Missing 'HttpOnly' Attribute.";
        a07Explanation =
          "Cookies set by the server lack the 'HttpOnly' flag. If XSS occurs on the domain, JavaScript can extract session tokens.";
      }
      if (!cookieLower.includes("secure") && isHttps) {
        a07Score -= 3;
        a07Status = "warning";
        a07Explanation += " Cookies missing 'Secure' flag may transmit credentials over unencrypted channels.";
      }
      if (!cookieLower.includes("samesite")) {
        a07Score -= 3;
        a07Status = "warning";
        a07Explanation += " Cookies missing 'SameSite' attribute lack Cross-Site Request Forgery (CSRF) protection.";
      }
    }

    checklist.push({
      id: "A07:2026",
      categoryCode: "A07",
      name: "Identification & Auth Failures",
      status: a07Status,
      score: Math.max(0, a07Score),
      maxScore: 10,
      title: a07Status === "pass" ? "Hardened Session Cookie Hygiene (HttpOnly / Secure / SameSite)" : "Insecure Session Cookie & Authentication Transport",
      summary: a07Summary,
      explanation: a07Explanation,
      cvssScore: a07Status === "pass" ? undefined : 5.4,
      cwe: "CWE-1004 (Missing HttpOnly) • CWE-614 (Missing Secure Flag) • CWE-352 (CSRF)",
      impact: "Session hijacking via DOM script access and Cross-Site Request Forgery (CSRF) impersonation.",
      remediation: "Ensure all authentication cookies set '; HttpOnly; Secure; SameSite=Lax' flags.",
      codeSnippet: "Set-Cookie: session_id=xyz; Path=/; Secure; HttpOnly; SameSite=Lax",
      references: [
        { name: "OWASP Top 10 - A07 Auth Failures", url: "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/" },
        { name: "OWASP Session Management Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html" },
      ],
    });

    // ------------------------------------------------------------------------
    // A08:2026 - Software and Data Integrity Failures
    // ------------------------------------------------------------------------
    let a08Score = 10;
    let a08Status: OwaspItem["status"] = "pass";
    let a08Summary = "Subresource Integrity (SRI) and script origin controls enforced.";
    let a08Explanation =
      "External scripts and stylesheets maintain strict provenance and avoid unverified third-party code injection.";

    const cdnScripts = (html.match(/<script[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*>/gi) || []);
    const unhashedCdn = cdnScripts.filter((s) => !s.includes("integrity="));

    if (cdnScripts.length > 0 && unhashedCdn.length > 2) {
      a08Score -= 4;
      a08Status = "warning";
      a08Summary = `${unhashedCdn.length} External CDN Scripts Loaded Without Subresource Integrity (SRI).`;
      a08Explanation =
        `Detected ${unhashedCdn.length} external third-party script tags without an 'integrity' hash. If a CDN provider is compromised or malicious code is injected at source, your visitors' browsers will execute it blindly.`;
    }

    checklist.push({
      id: "A08:2026",
      categoryCode: "A08",
      name: "Software & Data Integrity",
      status: a08Status,
      score: Math.max(0, a08Score),
      maxScore: 10,
      title: a08Status === "pass" ? "Script Integrity & Provenance Validated" : "Missing Subresource Integrity (SRI) on External CDN Scripts",
      summary: a08Summary,
      explanation: a08Explanation,
      cvssScore: a08Status === "pass" ? undefined : 5.0,
      cwe: "CWE-353 (Missing Support for Integrity Check)",
      impact: "Supply-chain attacks (Magecart style) where compromised CDN servers deliver malicious JavaScript.",
      remediation: "Add cryptographic 'integrity=\"sha384-...\"' and 'crossorigin=\"anonymous\"' attributes to all CDN script tags.",
      codeSnippet: "<script src=\"https://cdn.example.com/lib.js\"\n  integrity=\"sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC\"\n  crossorigin=\"anonymous\"></script>",
      references: [
        { name: "OWASP Top 10 - A08 Integrity Failures", url: "https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/" },
        { name: "MDN Subresource Integrity", url: "https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity" },
      ],
    });

    // ------------------------------------------------------------------------
    // A09:2026 - Security Logging & Monitoring Failures
    // ------------------------------------------------------------------------
    let a09Score = 10;
    let a09Status: OwaspItem["status"] = "pass";
    let a09Summary = "Security reporting endpoints and violation logging active.";
    let a09Explanation =
      "Browser security headers include reporting directives (Report-To, Reporting-Endpoints, or CSP report-uri) to detect attack telemetry in real time.";

    if (!reportTo && (!csp || (!csp.includes("report-uri") && !csp.includes("report-to")))) {
      a09Score -= 3;
      a09Status = "warning";
      a09Summary = "Missing Automated Browser Security Violation Reporting Endpoints.";
      a09Explanation =
        "The application does not define a 'Report-To' or CSP 'report-uri' endpoint. When CSP violations or TLS certificate tampering occurs, the security team receives zero real-time telemetry.";
    }

    checklist.push({
      id: "A09:2026",
      categoryCode: "A09",
      name: "Security Logging & Monitoring",
      status: a09Status,
      score: Math.max(0, a09Score),
      maxScore: 10,
      title: a09Status === "pass" ? "Real-time Attack Telemetry & Reporting Active" : "Missing Automated Security Telemetry & Violation Reporting",
      summary: a09Summary,
      explanation: a09Explanation,
      cvssScore: a09Status === "pass" ? undefined : 3.5,
      cwe: "CWE-778 (Insufficient Logging)",
      impact: "Delayed breach detection and inability to identify active script injection or brute-force campaigns.",
      remediation: "Configure a 'Reporting-Endpoints' or CSP 'report-uri' header to capture real-time security alerts.",
      codeSnippet: "add_header Reporting-Endpoints \"csp-endpoint='https://your-monitoring.com/csp-reports'\";\nadd_header Content-Security-Policy \"... report-to csp-endpoint;\";",
      references: [
        { name: "OWASP Top 10 - A09 Logging & Monitoring", url: "https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/" },
        { name: "W3C Reporting API", url: "https://w3c.github.io/reporting/" },
      ],
    });

    // ------------------------------------------------------------------------
    // A10:2026 - Server-Side Request Forgery (SSRF) & Sensitive Exposure
    // ------------------------------------------------------------------------
    let a10Score = 10;
    let a10Status: OwaspItem["status"] = "pass";
    let a10Summary = "Zero sensitive dotfiles or environment secrets exposed at web root.";
    let a10Explanation =
      "Probing for root configuration secrets (.env, .git/HEAD) confirmed proper web server access restriction.";

    if (gitRes.ok && gitRes.text.includes("ref: refs/")) {
      a10Score = 0;
      a10Status = "fail";
      a10Summary = "CRITICAL: Exposed Git Repository (.git/HEAD).";
      a10Explanation =
        "The web server exposes the '.git' directory publicly. Anyone can download your entire source code repository, commit history, and hidden API keys.";
    } else if (envRes.ok && (envRes.text.includes("DB_") || envRes.text.includes("SECRET") || envRes.text.includes("KEY"))) {
      a10Score = 0;
      a10Status = "fail";
      a10Summary = "CRITICAL: Publicly Accessible .env Environment File.";
      a10Explanation =
        "A plaintext '.env' file containing database credentials or secret keys was detected at the root URL. Immediate removal is required.";
    }

    checklist.push({
      id: "A10:2026",
      categoryCode: "A10",
      name: "SSRF & Sensitive Exposure",
      status: a10Status,
      score: Math.max(0, a10Score),
      maxScore: 10,
      title: a10Status === "pass" ? "Environment & Secret Isolation Protected" : "Critical Sensitive File & Dotfile Exposure",
      summary: a10Summary,
      explanation: a10Explanation,
      cvssScore: a10Status === "pass" ? undefined : 9.8,
      cwe: "CWE-538 (File Information Exposure) • CWE-918 (SSRF)",
      impact: "Complete source code theft, database credential compromise, and cloud infrastructure takeover.",
      remediation: "Block all access to hidden dotfiles and '.git' directories in your web server configuration.",
      codeSnippet: "# Nginx Rule to block dotfiles\nlocation ~ /\\.(?!well-known).* {\n    deny all;\n    return 404;\n}",
      references: [
        { name: "OWASP Top 10 - A10 SSRF", url: "https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/" },
        { name: "OWASP Source Code Exposure", url: "https://owasp.org" },
      ],
    });

    // ------------------------------------------------------------------------
    // Overall Score Calculation & Letter Grade
    // ------------------------------------------------------------------------
    const totalScore = checklist.reduce((sum, item) => sum + item.score, 0);
    const overallScore = Math.max(0, Math.min(100, Math.round(totalScore)));

    let grade: OwaspScanResult["grade"] = "F";
    let riskLevel: OwaspScanResult["riskLevel"] = "Critical Risk";

    if (overallScore >= 90) {
      grade = "A+";
      riskLevel = "Low Risk (Hardened)";
    } else if (overallScore >= 80) {
      grade = "A";
      riskLevel = "Low Risk (Hardened)";
    } else if (overallScore >= 70) {
      grade = "B";
      riskLevel = "Moderate Risk";
    } else if (overallScore >= 55) {
      grade = "C";
      riskLevel = "Moderate Risk";
    } else if (overallScore >= 40) {
      grade = "D";
      riskLevel = "High Risk";
    } else {
      grade = "F";
      riskLevel = "Critical Risk";
    }

    const passedCount = checklist.filter((item) => item.status === "pass").length;
    const warningCount = checklist.filter((item) => item.status === "warning").length;
    const failedCount = checklist.filter((item) => item.status === "fail").length;

    let verdict = "";
    if (grade === "A+" || grade === "A") {
      verdict = `Outstanding OWASP Security Posture (${passedCount}/10 Passed). ${domain} implements robust modern defences against the 2026 OWASP Top 10 threat landscape.`;
    } else if (grade === "B" || grade === "C") {
      verdict = `Moderate OWASP Exposure (${passedCount}/10 Passed, ${warningCount + failedCount} Areas for Improvement). Several security headers, cookie flags, or disclosure settings require remediation.`;
    } else {
      verdict = `High Vulnerability Risk (${failedCount} Critical/High Flaws Detected). ${domain} lacks fundamental OWASP defences such as CSP, HSTS, or secret isolation, leaving it vulnerable to automated exploits.`;
    }

    // Comprehensive Remediation Blueprints
    const remediationSnippets: OwaspScanResult["remediationSnippets"] = {
      nginxConfig: `# =========================================================================
# Cankal Software - 2026 OWASP Top 10 Hardening Configuration (Nginx)
# =========================================================================

# 1. Block access to hidden files (.env, .git, .svn)
location ~ /\\.(?!well-known).* {
    deny all;
    access_log off;
    log_not_found off;
    return 404;
}

# 2. Hide Server Version Banners (A05)
server_tokens off;
proxy_hide_header X-Powered-By;

# 3. HTTP Security Headers (A01, A02, A03, A05, A07)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
add_header Cross-Origin-Opener-Policy "same-origin" always;
add_header Cross-Origin-Resource-Policy "same-origin" always;

# 4. Content Security Policy (A03)
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'self'; form-action 'self'; upgrade-insecure-requests;" always;`,

      apacheHtaccess: `# =========================================================================
# Cankal Software - 2026 OWASP Top 10 Hardening (.htaccess / Apache)
# =========================================================================

<IfModule mod_headers.c>
    # 1. Transport Security (A02)
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    
    # 2. Clickjacking & MIME Sniffing (A01, A03)
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()"
    
    # 3. Content Security Policy (A03)
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; upgrade-insecure-requests;"
    
    # 4. Remove Banner Headers (A05)
    Header unset X-Powered-By
    Header always unset X-Powered-By
</IfModule>

# Block access to hidden dotfiles (.env, .git)
<FilesMatch "^\\.(?!well-known)">
    Order allow,deny
    Deny from all
</FilesMatch>`,

      nextjsConfig: `// =========================================================================
// Cankal Software - 2026 OWASP Top 10 Hardening (next.config.ts)
// =========================================================================
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  {
    key: "Content-Security-Policy",
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' blob: data: https:; connect-src 'self' https:; frame-ancestors 'self'; upgrade-insecure-requests;",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false, // Disables X-Powered-By: Next.js (A05)
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;`,
    };

    const result: OwaspScanResult = {
      url: formattedUrl,
      domain,
      scannedAt: new Date().toISOString(),
      overallScore,
      grade,
      riskLevel,
      verdict,
      passedCount,
      warningCount,
      failedCount,
      checklist,
      detectedTech,
      remediationSnippets,
    };

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("OWASP scan error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while executing the OWASP security audit." },
      { status: 500 }
    );
  }
}
