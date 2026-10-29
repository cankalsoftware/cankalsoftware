import { simpleParser, ParsedMail } from "mailparser";
import dns from "node:dns/promises";

// Safe import of @kenjiuno/msgreader
// eslint-disable-next-line @typescript-eslint/no-require-imports
const MSGReaderClass = require("@kenjiuno/msgreader").default || require("@kenjiuno/msgreader");

export interface HeaderForensics {
  from: {
    name: string;
    address: string;
    domain: string;
  };
  to: Array<{ name: string; address: string }>;
  replyTo?: { name: string; address: string; domain: string };
  returnPath?: { address: string; domain: string };
  subject: string;
  date?: string;
  messageId?: string;
  originatingMta?: {
    ip: string;
    hostname?: string;
    reverseDns?: string;
    isPrivateOrLocal?: boolean;
  };
  hops: Array<{
    hopNumber: number;
    by?: string;
    from?: string;
    ip?: string;
    withProtocol?: string;
    date?: string;
  }>;
  authentication: {
    spf: {
      status: "pass" | "fail" | "softfail" | "neutral" | "none";
      details: string;
      record?: string;
    };
    dkim: {
      status: "pass" | "fail" | "none";
      details: string;
      selector?: string;
      domain?: string;
    };
    dmarc: {
      status: "pass" | "fail" | "none";
      policy?: string;
      details: string;
      record?: string;
    };
  };
  alignmentFlags: {
    displayNameSpoofing: boolean;
    returnPathMismatch: boolean;
    replyToMismatch: boolean;
    originatingIpUnverified: boolean;
  };
}

export interface DomainMailboxIntelligence {
  senderDomain: string;
  mxRecords: Array<{ exchange: string; priority: number }>;
  mxStatus: "valid" | "missing" | "unresponsive";
  mailProvider: string;
  isCatchAll?: boolean;
  isDisposable: boolean;
  domainType: "corporate" | "free_webmail" | "disposable" | "unknown";
  isRoleAccount: boolean;
  roleType?: string;
}

export interface ContentAttachmentAudit {
  urgencyScore: number;
  urgencyKeywordsFound: string[];
  psychologicalTriggers: string[];
  homoglyphDetected: boolean;
  homoglyphDetails: string[];
  grammarSpellingNotes: string[];
  attachments: Array<{
    filename: string;
    contentType: string;
    sizeBytes: number;
    riskLevel: "safe" | "suspicious" | "critical";
    riskReason?: string;
  }>;
}

export interface ExtractedLink {
  id: string;
  originalUrl: string;
  defangedUrl: string;
  anchorText: string;
  isAnchorMismatch: boolean;
  isShortener: boolean;
  finalDestinationUrl: string;
  defangedFinalUrl: string;
  domain: string;
  threatLevel: "safe" | "caution" | "critical";
  threatCategory: "Phishing / Credential Theft" | "Malware / Exploit" | "Suspicious / Scam" | "Benign / Verified";
  threatReasons: string[];
}

export interface EmailAnalysisResult {
  fileName?: string;
  fileType: "msg" | "eml" | "raw";
  analyzedAt: string;
  overallScore: number; // 0 (Clean) to 100 (Critical Threat)
  verdict: "Clean / Low Risk" | "Suspicious / Proceed with Caution" | "Malicious Phishing Threat";
  verdictColor: "green" | "amber" | "red";
  verdictSummary: string;
  rawEmailContent: string;
  headerForensics: HeaderForensics;
  domainIntelligence: DomainMailboxIntelligence;
  contentAudit: ContentAttachmentAudit;
  links: ExtractedLink[];
  redFlagCount: number;
  amberFlagCount: number;
  greenFlagCount: number;
}

// Block private/local IP ranges for SSRF prevention
export function isPrivateHost(hostname: string): boolean {
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
  const parts = lower.split(".").map(Number);
  if (parts.length === 4 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
  }
  return false;
}

// Convert live URL to safe format (defanged)
export function defangUrl(urlStr: string): string {
  try {
    return urlStr
      .replace(/^https?:\/\//i, (match) => (match.toLowerCase().startsWith("https") ? "hxxps://" : "hxxp://"))
      .replace(/\./g, "[.]");
  } catch {
    return urlStr;
  }
}

// Known URL shortener services
const KNOWN_SHORTENERS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "cutt.ly",
  "rebrand.ly",
  "goo.gl",
  "bl.ink",
  "trib.al",
  "shorturl.at",
  "shorte.st",
]);

// Known free webmail services
const FREE_WEBMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "ymail.com",
  "rocketmail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "protonmail.com",
  "proton.me",
  "zoho.com",
  "mail.com",
  "gmx.com",
  "yandex.com",
  "fastmail.com",
]);

// Known disposable / burner email domains
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "10minutemail.com",
  "tempmail.com",
  "guerrillamail.com",
  "mailinator.com",
  "yopmail.com",
  "trashmail.com",
  "getairmail.com",
  "dispostable.com",
  "throwawaymail.com",
  "mytemp.email",
  "sharklasers.com",
  "grr.la",
  "nada.ltd",
  "mohmal.com",
  "emailondeck.com",
  "temp-mail.org",
  "fakeinbox.com",
]);

// Role-based accounts
const ROLE_ACCOUNTS: Record<string, string> = {
  admin: "Administrative",
  administrator: "Administrative",
  billing: "Financial / Accounting",
  finance: "Financial / Accounting",
  accounting: "Financial / Accounting",
  invoice: "Financial / Accounting",
  payments: "Financial / Accounting",
  remittance: "Financial / Accounting",
  support: "Customer Support",
  help: "Customer Support",
  helpdesk: "Customer Support",
  service: "Customer Support",
  security: "Security / Compliance",
  compliance: "Security / Compliance",
  privacy: "Security / Compliance",
  abuse: "Security / Compliance",
  info: "General Corporate Inquiries",
  contact: "General Corporate Inquiries",
  hello: "General Corporate Inquiries",
  sales: "Sales / Business Development",
  hr: "Human Resources",
  careers: "Human Resources",
  legal: "Legal / Compliance",
  ceo: "Executive Leadership",
  cfo: "Executive Leadership",
  coo: "Executive Leadership",
  director: "Executive Leadership",
};

// Urgency keywords & social engineering triggers
const URGENCY_PATTERNS = [
  { term: "immediate action required", trigger: "Urgent Action Demanded" },
  { term: "account suspended", trigger: "Account Suspension Threat" },
  { term: "account will be suspended", trigger: "Account Suspension Threat" },
  { term: "within 24 hours", trigger: "Artificial Time Limit" },
  { term: "within 12 hours", trigger: "Artificial Time Limit" },
  { term: "within 48 hours", trigger: "Artificial Time Limit" },
  { term: "unauthorized access detected", trigger: "False Security Alarm" },
  { term: "suspicious sign-in", trigger: "False Security Alarm" },
  { term: "wire transfer", trigger: "Financial Transaction" },
  { term: "bank transfer", trigger: "Financial Transaction" },
  { term: "gift card", trigger: "Gift Card Scams" },
  { term: "cryptocurrency", trigger: "Cryptocurrency Lure" },
  { term: "bitcoin", trigger: "Cryptocurrency Lure" },
  { term: "overdue invoice", trigger: "Invoice / Billing Fraud" },
  { term: "invoice attached", trigger: "Invoice / Billing Fraud" },
  { term: "payment overdue", trigger: "Invoice / Billing Fraud" },
  { term: "remittance advice", trigger: "Invoice / Billing Fraud" },
  { term: "tax refund", trigger: "Government / Tax Lure" },
  { term: "hmrc refund", trigger: "Government / Tax Lure" },
  { term: "irs notification", trigger: "Government / Tax Lure" },
  { term: "verify your identity", trigger: "Credential Harvesting Hook" },
  { term: "confirm your password", trigger: "Credential Harvesting Hook" },
  { term: "update your payment details", trigger: "Payment / Credential Theft" },
  { term: "shared a document with you", trigger: "Phishing Document Lure" },
];

// Dangerous attachment extensions
const DANGEROUS_EXTENSIONS: Record<string, { level: "critical" | "suspicious"; reason: string }> = {
  exe: { level: "critical", reason: "Direct Windows Executable binary - high risk of malware execution" },
  scr: { level: "critical", reason: "Screensaver executable format commonly used in ransomware delivery" },
  bat: { level: "critical", reason: "Windows Batch script capable of arbitrary command execution" },
  cmd: { level: "critical", reason: "Windows Command script capable of arbitrary execution" },
  vbs: { level: "critical", reason: "VBScript file commonly used to download secondary malware stages" },
  js: { level: "critical", reason: "JavaScript script executable directly on Windows via WScript" },
  ps1: { level: "critical", reason: "PowerShell script capable of deep system modification" },
  iso: { level: "critical", reason: "Disk image container often used to bypass Mark-of-the-Web (MOTW)" },
  img: { level: "critical", reason: "Disk image container used in archive evasion" },
  vhd: { level: "critical", reason: "Virtual hard disk image used to smuggle executables" },
  docm: { level: "suspicious", reason: "Macro-enabled Microsoft Word document - high macro payload risk" },
  xlsm: { level: "suspicious", reason: "Macro-enabled Microsoft Excel sheet - high macro payload risk" },
  pptm: { level: "suspicious", reason: "Macro-enabled Microsoft PowerPoint presentation" },
  html: { level: "suspicious", reason: "Standalone HTML file - potential HTML smuggling or fake login offline form" },
  htm: { level: "suspicious", reason: "Standalone HTM file - potential HTML smuggling" },
  svg: { level: "suspicious", reason: "SVG file containing potential embedded JavaScript or phishing forms" },
};

// Check for homoglyphs (Cyrillic lookalikes)
function detectHomoglyphs(text: string): { found: boolean; details: string[] } {
  const cyrillicLookalikes: Record<string, string> = {
    "\u0430": "Cyrillic 'а' (looks like Latin 'a')",
    "\u0435": "Cyrillic 'е' (looks like Latin 'e')",
    "\u043E": "Cyrillic 'о' (looks like Latin 'o')",
    "\u0440": "Cyrillic 'р' (looks like Latin 'p')",
    "\u0441": "Cyrillic 'с' (looks like Latin 'c')",
    "\u0443": "Cyrillic 'у' (looks like Latin 'y')",
    "\u0456": "Cyrillic 'і' (looks like Latin 'i')",
  };

  const details: string[] = [];
  for (const [char, desc] of Object.entries(cyrillicLookalikes)) {
    if (text.includes(char)) {
      details.push(desc);
    }
  }

  return {
    found: details.length > 0,
    details,
  };
}

// Unmask redirects safely on the server side
async function traceRedirectTarget(initialUrl: string): Promise<string> {
  try {
    const urlObj = new URL(initialUrl);
    if (isPrivateHost(urlObj.hostname)) {
      return initialUrl;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(initialUrl, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    clearTimeout(timeoutId);
    return res.url || initialUrl;
  } catch {
    return initialUrl;
  }
}

// Safely convert complex mailparser header values to string
function extractHeaderString(headerVal: unknown): string {
  if (!headerVal) return "";
  if (typeof headerVal === "string") return headerVal;
  if (Array.isArray(headerVal)) return headerVal.map(extractHeaderString).join(" ");
  if (typeof headerVal === "object") {
    if ("text" in headerVal && typeof (headerVal as { text: unknown }).text === "string") {
      return (headerVal as { text: string }).text;
    }
    if ("value" in headerVal) {
      const val = (headerVal as { value: unknown }).value;
      if (typeof val === "string") return val;
      if (Array.isArray(val)) {
        return val
          .map((v) =>
            typeof v === "object" && v && "address" in v
              ? (v as { address: string }).address
              : String(v)
          )
          .join(" ");
      }
    }
  }
  return String(headerVal);
}

// Extract URLs from text and HTML
function extractUrlsWithAnchors(htmlContent: string, textContent: string): Array<{ url: string; anchor: string }> {
  const list: Array<{ url: string; anchor: string }> = [];
  const seenUrls = new Set<string>();

  // 1. Extract from HTML <a> tags
  if (htmlContent) {
    const anchorRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = anchorRegex.exec(htmlContent)) !== null) {
      const rawHref = match[1]?.trim();
      const rawText = match[2]?.replace(/<[^>]+>/g, "").trim() || "";
      if (rawHref && (rawHref.startsWith("http://") || rawHref.startsWith("https://"))) {
        if (!seenUrls.has(rawHref)) {
          seenUrls.add(rawHref);
          list.push({ url: rawHref, anchor: rawText });
        }
      }
    }
  }

  // 2. Extract from plain text
  if (textContent) {
    const plainRegex = /(https?:\/\/[^\s<>"'{}|\\^`]+)/gi;
    let match;
    while ((match = plainRegex.exec(textContent)) !== null) {
      const rawUrl = match[1]?.trim();
      if (rawUrl && !seenUrls.has(rawUrl)) {
        seenUrls.add(rawUrl);
        list.push({ url: rawUrl, anchor: "" });
      }
    }
  }

  return list;
}

// Main Email Analysis Processor
export async function analyzeEmailBuffer(
  buffer: Buffer,
  fileName = "unknown_email",
  fileHint?: "msg" | "eml" | "raw"
): Promise<EmailAnalysisResult> {
  const isMsg =
    fileHint === "msg" ||
    fileName.toLowerCase().endsWith(".msg") ||
    (buffer.length >= 8 &&
      buffer[0] === 0xd0 &&
      buffer[1] === 0xcf &&
      buffer[2] === 0x11 &&
      buffer[3] === 0xe0);

  let rawEmailText = "";
  let subject = "No Subject";
  let fromName = "";
  let fromAddress = "";
  let toList: Array<{ name: string; address: string }> = [];
  let replyToObj: { name: string; address: string } | undefined;
  let returnPathStr = "";
  let dateStr = "";
  let messageIdStr = "";
  let bodyText = "";
  let bodyHtml = "";
  let rawHeadersMap: Record<string, string | string[]> = {};
  let attachmentsList: Array<{ filename: string; contentType: string; sizeBytes: number }> = [];

  if (isMsg) {
    try {
      const msgReader = new MSGReaderClass(buffer);
      const fileData = msgReader.getFileData();

      subject = fileData.subject || "No Subject";
      fromName = fileData.senderName || "";
      fromAddress = fileData.senderEmail || "";
      bodyText = fileData.body || "";
      bodyHtml = fileData.bodyHtml || "";

      if (Array.isArray(fileData.recipients)) {
        toList = fileData.recipients.map((r: { name?: string; email?: string }) => ({
          name: r.name || "",
          address: r.email || "",
        }));
      }

      if (Array.isArray(fileData.attachments)) {
        attachmentsList = fileData.attachments.map((att: { fileName?: string; name?: string; attachSize?: number }) => ({
          filename: att.fileName || att.name || "attachment",
          contentType: "application/octet-stream",
          sizeBytes: att.attachSize || 0,
        }));
      }

      // Outlook stores transport headers in transportMessageHeaders
      const transportHeaders = fileData.transportMessageHeaders || "";
      rawEmailText = transportHeaders
        ? `${transportHeaders}\r\n\r\n${bodyText}`
        : `From: ${fromName} <${fromAddress}>\r\nSubject: ${subject}\r\n\r\n${bodyText}`;

      // Parse headers from transport string if available
      if (transportHeaders) {
        const lines = transportHeaders.split(/\r?\n/);
        let currentKey = "";
        for (const line of lines) {
          if (/^\s/.test(line) && currentKey) {
            const prev = rawHeadersMap[currentKey];
            if (typeof prev === "string") {
              rawHeadersMap[currentKey] = prev + " " + line.trim();
            }
          } else {
            const colonIndex = line.indexOf(":");
            if (colonIndex > 0) {
              currentKey = line.substring(0, colonIndex).trim().toLowerCase();
              const val = line.substring(colonIndex + 1).trim();
              if (rawHeadersMap[currentKey]) {
                if (Array.isArray(rawHeadersMap[currentKey])) {
                  (rawHeadersMap[currentKey] as string[]).push(val);
                } else {
                  rawHeadersMap[currentKey] = [rawHeadersMap[currentKey] as string, val];
                }
              } else {
                rawHeadersMap[currentKey] = val;
              }
            }
          }
        }
      }
    } catch {
      // Fallback if MSGReader encounters malformed binary
      rawEmailText = buffer.toString("utf-8");
    }
  } else {
    // Standard MIME / EML parsing via mailparser
    try {
      const parsed: ParsedMail = await simpleParser(buffer);
      subject = parsed.subject || "No Subject";
      fromName = parsed.from?.value?.[0]?.name || "";
      fromAddress = parsed.from?.value?.[0]?.address || "";
      if (parsed.to) {
        if (Array.isArray(parsed.to)) {
          toList = parsed.to.flatMap((addrObj) =>
            Array.isArray(addrObj.value)
              ? addrObj.value.map((t) => ({ name: t.name || "", address: t.address || "" }))
              : []
          );
        } else if ("value" in parsed.to && Array.isArray(parsed.to.value)) {
          toList = parsed.to.value.map((t) => ({
            name: t.name || "",
            address: t.address || "",
          }));
        }
      }
      if (parsed.replyTo?.value?.[0]) {
        replyToObj = {
          name: parsed.replyTo.value[0].name || "",
          address: parsed.replyTo.value[0].address || "",
        };
      }
      returnPathStr = extractHeaderString(parsed.headers.get("return-path"));
      dateStr = parsed.date ? parsed.date.toISOString() : extractHeaderString(parsed.headers.get("date"));
      messageIdStr = parsed.messageId || extractHeaderString(parsed.headers.get("message-id"));
      bodyText = parsed.text || "";
      bodyHtml = (parsed.html as string) || "";

      if (parsed.attachments && Array.isArray(parsed.attachments)) {
        attachmentsList = parsed.attachments.map((a) => ({
          filename: a.filename || "unnamed_attachment",
          contentType: a.contentType || "application/octet-stream",
          sizeBytes: a.size || 0,
        }));
      }

      rawEmailText = buffer.toString("utf-8");

      // Extract raw headers into map
      parsed.headers.forEach((val, key) => {
        if (typeof val === "string") {
          rawHeadersMap[key.toLowerCase()] = val;
        } else if (Array.isArray(val)) {
          rawHeadersMap[key.toLowerCase()] = val.map(String);
        } else if (val && typeof val === "object" && "text" in val) {
          rawHeadersMap[key.toLowerCase()] = (val as { text: string }).text;
        }
      });
    } catch {
      rawEmailText = buffer.toString("utf-8");
    }
  }

  // Sender domain parsing
  const senderDomain = fromAddress.includes("@")
    ? fromAddress.split("@")[1].toLowerCase().trim()
    : "";

  const replyToDomain = replyToObj?.address?.includes("@")
    ? replyToObj.address.split("@")[1].toLowerCase().trim()
    : "";

  const returnPathDomain = returnPathStr.includes("@")
    ? returnPathStr.replace(/[<>]/g, "").split("@")[1]?.toLowerCase().trim() || ""
    : "";

  // Hop extraction from Received headers
  const hops: Array<{
    hopNumber: number;
    by?: string;
    from?: string;
    ip?: string;
    withProtocol?: string;
    date?: string;
  }> = [];

  let originatingIp = "";
  const receivedRaw = rawHeadersMap["received"];
  const receivedList: string[] = Array.isArray(receivedRaw)
    ? receivedRaw
    : typeof receivedRaw === "string"
    ? [receivedRaw]
    : [];

  // Parse Received hops (first hop in physical chronological arrival is usually last in the header stack)
  const ipRegex = /\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]/;
  const fromRegex = /from\s+([^\s;]+)/i;
  const byRegex = /by\s+([^\s;]+)/i;
  const withRegex = /with\s+([^\s;]+)/i;

  let hopIdx = 1;
  for (let i = receivedList.length - 1; i >= 0; i--) {
    const hopLine = receivedList[i];
    const ipMatch = hopLine.match(ipRegex);
    const fromMatch = hopLine.match(fromRegex);
    const byMatch = hopLine.match(byRegex);
    const withMatch = hopLine.match(withRegex);

    const foundIp = ipMatch ? ipMatch[1] : undefined;
    if (foundIp && !originatingIp && !isPrivateHost(foundIp)) {
      originatingIp = foundIp;
    }

    hops.push({
      hopNumber: hopIdx++,
      from: fromMatch ? fromMatch[1] : undefined,
      by: byMatch ? byMatch[1] : undefined,
      ip: foundIp,
      withProtocol: withMatch ? withMatch[1] : undefined,
    });
  }

  // Reverse DNS (PTR) lookup for Originating MTA IP
  let reverseDnsHost = "";
  if (originatingIp && !isPrivateHost(originatingIp)) {
    try {
      const ptrs = await dns.reverse(originatingIp);
      if (ptrs && ptrs.length > 0) {
        reverseDnsHost = ptrs[0];
      }
    } catch {
      reverseDnsHost = "No Reverse PTR record found";
    }
  }

  // Live DNS Checks for Sender Domain (MX, SPF, DMARC)
  let mxRecords: Array<{ exchange: string; priority: number }> = [];
  let mxStatus: "valid" | "missing" | "unresponsive" = "missing";
  let mailProvider = "Unknown / Custom MTA";
  let spfRecord = "";
  let dmarcRecord = "";
  let dmarcPolicy = "none";

  if (senderDomain) {
    // 1. MX lookup
    try {
      const records = await dns.resolveMx(senderDomain);
      if (records && records.length > 0) {
        mxRecords = records.sort((a, b) => a.priority - b.priority);
        mxStatus = "valid";

        // Provider Fingerprinting
        const mxHosts = mxRecords.map((m) => m.exchange.toLowerCase()).join(" ");
        if (mxHosts.includes("google") || mxHosts.includes("aspmx")) {
          mailProvider = "Google Workspace";
        } else if (mxHosts.includes("outlook") || mxHosts.includes("protection.outlook.com")) {
          mailProvider = "Microsoft 365 / Exchange Online";
        } else if (mxHosts.includes("pphosted") || mxHosts.includes("proofpoint")) {
          mailProvider = "Proofpoint Enterprise Gateway";
        } else if (mxHosts.includes("mimecast")) {
          mailProvider = "Mimecast Secure Email Gateway";
        } else if (mxHosts.includes("sendgrid")) {
          mailProvider = "Twilio SendGrid";
        } else if (mxHosts.includes("amazonses")) {
          mailProvider = "Amazon SES";
        } else if (mxHosts.includes("protonmail") || mxHosts.includes("proton.ch")) {
          mailProvider = "Proton Mail";
        }
      }
    } catch {
      mxStatus = "missing";
    }

    // 2. SPF lookup (TXT on root domain)
    try {
      const txtRecords = await dns.resolveTxt(senderDomain);
      for (const group of txtRecords) {
        const fullTxt = group.join("");
        if (fullTxt.startsWith("v=spf1")) {
          spfRecord = fullTxt;
          break;
        }
      }
    } catch {
      spfRecord = "";
    }

    // 3. DMARC lookup (TXT on _dmarc.domain)
    try {
      const dmarcTxts = await dns.resolveTxt(`_dmarc.${senderDomain}`);
      for (const group of dmarcTxts) {
        const fullTxt = group.join("");
        if (fullTxt.startsWith("v=DMARC1")) {
          dmarcRecord = fullTxt;
          const pMatch = fullTxt.match(/p=([a-z]+)/i);
          if (pMatch) {
            dmarcPolicy = pMatch[1].toLowerCase();
          }
          break;
        }
      }
    } catch {
      dmarcRecord = "";
    }
  }

  // Evaluate Authentication Results
  const authResultsRaw =
    (rawHeadersMap["authentication-results"] as string) ||
    (rawHeadersMap["received-spf"] as string) ||
    "";

  // SPF Status evaluation
  let spfStatus: "pass" | "fail" | "softfail" | "neutral" | "none" = "none";
  let spfDetails = "No SPF evaluation found";
  if (authResultsRaw.includes("spf=pass")) {
    spfStatus = "pass";
    spfDetails = "Authorized in sender domain SPF policy";
  } else if (authResultsRaw.includes("spf=fail")) {
    spfStatus = "fail";
    spfDetails = "Originating IP is unauthorized in sender domain SPF policy (-all)";
  } else if (authResultsRaw.includes("spf=softfail")) {
    spfStatus = "softfail";
    spfDetails = "IP not explicitly authorized (~all softfail policy)";
  } else if (spfRecord) {
    spfStatus = "neutral";
    spfDetails = `Domain has published SPF record: ${spfRecord.substring(0, 45)}...`;
  }

  // DKIM Status evaluation
  let dkimStatus: "pass" | "fail" | "none" = "none";
  let dkimDetails = "No DKIM signature found on email message";
  if (authResultsRaw.includes("dkim=pass")) {
    dkimStatus = "pass";
    dkimDetails = "Cryptographic DKIM signature verified untampered";
  } else if (authResultsRaw.includes("dkim=fail")) {
    dkimStatus = "fail";
    dkimDetails = "DKIM cryptographic signature verification failed";
  } else if (rawHeadersMap["dkim-signature"]) {
    dkimStatus = "pass";
    dkimDetails = "DKIM signature present in transport headers";
  }

  // DMARC Status evaluation
  let dmarcStatus: "pass" | "fail" | "none" = "none";
  let dmarcDetails = "No DMARC policy found for sender domain";
  if (authResultsRaw.includes("dmarc=pass")) {
    dmarcStatus = "pass";
    dmarcDetails = `DMARC passed with enforced policy p=${dmarcPolicy}`;
  } else if (authResultsRaw.includes("dmarc=fail")) {
    dmarcStatus = "fail";
    dmarcDetails = "DMARC alignment failed";
  } else if (dmarcRecord) {
    dmarcStatus = dmarcPolicy === "reject" || dmarcPolicy === "quarantine" ? "pass" : "none";
    dmarcDetails = `Domain enforces DMARC policy: p=${dmarcPolicy}`;
  }

  // Alignment Checks
  const returnPathMismatch = Boolean(returnPathDomain && senderDomain && returnPathDomain !== senderDomain);
  const replyToMismatch = Boolean(replyToDomain && senderDomain && replyToDomain !== senderDomain);

  // Display Name Spoofing Check
  let displayNameSpoofing = false;
  const brandKeywords = ["paypal", "microsoft", "office 365", "apple", "google", "amazon", "hmrc", "dhl", "fedex", "netflix", "bank", "stripe"];
  const lowerFromName = fromName.toLowerCase();
  for (const b of brandKeywords) {
    if (lowerFromName.includes(b) && !senderDomain.includes(b.replace(/\s+/g, ""))) {
      displayNameSpoofing = true;
      break;
    }
  }

  // Domain & Mailbox Classification
  const isDisposable = DISPOSABLE_EMAIL_DOMAINS.has(senderDomain);
  const isFreeWebmail = FREE_WEBMAIL_DOMAINS.has(senderDomain);
  const domainType = isDisposable
    ? "disposable"
    : isFreeWebmail
    ? "free_webmail"
    : senderDomain
    ? "corporate"
    : "unknown";

  // Role account check
  const senderUser = fromAddress.includes("@") ? fromAddress.split("@")[0].toLowerCase().trim() : "";
  const isRoleAccount = Boolean(ROLE_ACCOUNTS[senderUser]);
  const roleType = ROLE_ACCOUNTS[senderUser];

  // Content & Linguistic Heuristics
  const fullContentToScan = `${subject} ${bodyText}`.toLowerCase();
  const urgencyKeywordsFound: string[] = [];
  const psychologicalTriggers: string[] = [];

  for (const item of URGENCY_PATTERNS) {
    if (fullContentToScan.includes(item.term)) {
      urgencyKeywordsFound.push(item.term);
      if (!psychologicalTriggers.includes(item.trigger)) {
        psychologicalTriggers.push(item.trigger);
      }
    }
  }

  const homoglyphCheck = detectHomoglyphs(`${fromName} ${subject} ${bodyText}`);

  // Attachment Risk Scanner
  const auditedAttachments = attachmentsList.map((att) => {
    const ext = att.filename.includes(".")
      ? att.filename.split(".").pop()?.toLowerCase() || ""
      : "";
    const danger = DANGEROUS_EXTENSIONS[ext];
    if (danger) {
      return {
        filename: att.filename,
        contentType: att.contentType,
        sizeBytes: att.sizeBytes,
        riskLevel: danger.level,
        riskReason: danger.reason,
      };
    }
    return {
      filename: att.filename,
      contentType: att.contentType,
      sizeBytes: att.sizeBytes,
      riskLevel: "safe" as const,
      riskReason: "Standard benign document extension",
    };
  });

  // Safe Link Extraction & Detonation
  const extractedRawLinks = extractUrlsWithAnchors(bodyHtml, bodyText);
  const links: ExtractedLink[] = [];

  for (let idx = 0; idx < extractedRawLinks.length; idx++) {
    const item = extractedRawLinks[idx];
    const defanged = defangUrl(item.url);
    let domainStr = "";
    let isShortener = false;

    try {
      const uObj = new URL(item.url);
      domainStr = uObj.hostname.toLowerCase();
      isShortener = KNOWN_SHORTENERS.has(domainStr);
    } catch {
      domainStr = "invalid-url";
    }

    // Anchor mismatch check
    let isAnchorMismatch = false;
    if (item.anchor && (item.anchor.includes("http://") || item.anchor.includes("https://") || item.anchor.includes("www."))) {
      try {
        const anchorDomain = new URL(item.anchor.startsWith("http") ? item.anchor : `https://${item.anchor}`).hostname.toLowerCase();
        if (domainStr && anchorDomain && domainStr !== anchorDomain) {
          isAnchorMismatch = true;
        }
      } catch {
        // ignore parsing error
      }
    }

    // Trace redirect if it's a shortener or suspicious
    let finalUrl = item.url;
    if (isShortener || isAnchorMismatch) {
      finalUrl = await traceRedirectTarget(item.url);
    }
    const defangedFinal = defangUrl(finalUrl);

    // Threat determination for this link
    const threatReasons: string[] = [];
    let threatLevel: "safe" | "caution" | "critical" = "safe";
    let threatCategory: ExtractedLink["threatCategory"] = "Benign / Verified";

    if (isAnchorMismatch) {
      threatLevel = "critical";
      threatCategory = "Phishing / Credential Theft";
      threatReasons.push(`Anchor text displays '${item.anchor}' but underlying target is '${domainStr}'`);
    }

    if (isShortener) {
      if (threatLevel !== "critical") threatLevel = "caution";
      threatReasons.push("Uses URL shortening service to obscure actual destination");
    }

    const lowerFinal = finalUrl.toLowerCase();
    for (const b of brandKeywords) {
      if (lowerFinal.includes(b) && !lowerFinal.includes(`${b.replace(/\s+/g, "")}.com`)) {
        threatLevel = "critical";
        threatCategory = "Phishing / Credential Theft";
        threatReasons.push(`Suspicious brand targeting detected: '${b}' appears in URL path or subdomain`);
      }
    }

    if (lowerFinal.includes(".xyz") || lowerFinal.includes(".top") || lowerFinal.includes(".ru") || lowerFinal.includes(".work")) {
      if (threatLevel !== "critical") threatLevel = "caution";
      threatReasons.push("High-abuse Top Level Domain (TLD) commonly used in phishing kits");
    }

    links.push({
      id: `link-${idx + 1}`,
      originalUrl: item.url,
      defangedUrl: defanged,
      anchorText: item.anchor || item.url,
      isAnchorMismatch,
      isShortener,
      finalDestinationUrl: finalUrl,
      defangedFinalUrl: defangedFinal,
      domain: domainStr,
      threatLevel,
      threatCategory,
      threatReasons: threatReasons.length > 0 ? threatReasons : ["No suspicious traits detected on link"],
    });
  }

  // Count Flags & Compute Score
  let redFlagCount = 0;
  let amberFlagCount = 0;
  let greenFlagCount = 0;

  // Header flags
  if (displayNameSpoofing) redFlagCount++;
  if (spfStatus === "fail") redFlagCount++;
  if (dkimStatus === "fail") redFlagCount++;
  if (dmarcStatus === "fail") redFlagCount++;
  if (isDisposable) redFlagCount++;
  if (returnPathMismatch) amberFlagCount++;
  if (replyToMismatch) amberFlagCount++;
  if (isFreeWebmail && isRoleAccount) amberFlagCount++;
  if (spfStatus === "softfail" || spfStatus === "neutral") amberFlagCount++;

  if (spfStatus === "pass") greenFlagCount++;
  if (dkimStatus === "pass") greenFlagCount++;
  if (dmarcStatus === "pass") greenFlagCount++;
  if (mxStatus === "valid") greenFlagCount++;
  if (!returnPathMismatch && senderDomain) greenFlagCount++;

  // Content flags
  if (homoglyphCheck.found) redFlagCount++;
  if (psychologicalTriggers.length >= 2) redFlagCount++;
  else if (psychologicalTriggers.length === 1) amberFlagCount++;

  // Attachment flags
  for (const att of auditedAttachments) {
    if (att.riskLevel === "critical") redFlagCount++;
    if (att.riskLevel === "suspicious") amberFlagCount++;
  }

  // Link flags
  for (const lk of links) {
    if (lk.threatLevel === "critical") redFlagCount++;
    if (lk.threatLevel === "caution") amberFlagCount++;
  }

  // Overall Score Calculation (0 = Clean, 100 = Critical Danger)
  let overallScore = 0;
  overallScore += redFlagCount * 25;
  overallScore += amberFlagCount * 10;
  if (greenFlagCount >= 4 && redFlagCount === 0) {
    overallScore = Math.max(0, overallScore - 15);
  }
  overallScore = Math.min(100, Math.max(0, overallScore));

  let verdict: EmailAnalysisResult["verdict"] = "Clean / Low Risk";
  let verdictColor: EmailAnalysisResult["verdictColor"] = "green";
  let verdictSummary = "Email authentication parameters, sender alignment, and links appear legitimate.";

  if (overallScore >= 50 || redFlagCount >= 1) {
    verdict = "Malicious Phishing Threat";
    verdictColor = "red";
    verdictSummary = "High probability of phishing, credential harvesting, or spoofing. Do NOT click links or open attachments.";
  } else if (overallScore >= 20 || amberFlagCount >= 1) {
    verdict = "Suspicious / Proceed with Caution";
    verdictColor = "amber";
    verdictSummary = "Suspicious indicators detected (unaligned reply addresses, free webmail, or urgency triggers). Verify with sender out-of-band.";
  }

  return {
    fileName,
    fileType: isMsg ? "msg" : fileHint || "eml",
    analyzedAt: new Date().toISOString(),
    overallScore,
    verdict,
    verdictColor,
    verdictSummary,
    rawEmailContent: rawEmailText,
    headerForensics: {
      from: {
        name: fromName || "Unknown",
        address: fromAddress || "Unknown",
        domain: senderDomain || "Unknown",
      },
      to: toList,
      replyTo: replyToObj
        ? {
            name: replyToObj.name,
            address: replyToObj.address,
            domain: replyToDomain,
          }
        : undefined,
      returnPath: returnPathStr
        ? {
            address: returnPathStr,
            domain: returnPathDomain,
          }
        : undefined,
      subject,
      date: dateStr,
      messageId: messageIdStr,
      originatingMta: originatingIp
        ? {
            ip: originatingIp,
            reverseDns: reverseDnsHost,
            isPrivateOrLocal: isPrivateHost(originatingIp),
          }
        : undefined,
      hops,
      authentication: {
        spf: {
          status: spfStatus,
          details: spfDetails,
          record: spfRecord || undefined,
        },
        dkim: {
          status: dkimStatus,
          details: dkimDetails,
        },
        dmarc: {
          status: dmarcStatus,
          policy: dmarcPolicy,
          details: dmarcDetails,
          record: dmarcRecord || undefined,
        },
      },
      alignmentFlags: {
        displayNameSpoofing,
        returnPathMismatch,
        replyToMismatch,
        originatingIpUnverified: !originatingIp || reverseDnsHost.includes("No Reverse PTR"),
      },
    },
    domainIntelligence: {
      senderDomain,
      mxRecords,
      mxStatus,
      mailProvider,
      isDisposable,
      domainType,
      isRoleAccount,
      roleType,
    },
    contentAudit: {
      urgencyScore: Math.min(100, psychologicalTriggers.length * 35),
      urgencyKeywordsFound,
      psychologicalTriggers,
      homoglyphDetected: homoglyphCheck.found,
      homoglyphDetails: homoglyphCheck.details,
      grammarSpellingNotes: [],
      attachments: auditedAttachments,
    },
    links,
    redFlagCount,
    amberFlagCount,
    greenFlagCount,
  };
}
