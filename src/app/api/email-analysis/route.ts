import { NextRequest, NextResponse } from "next/server";
import { analyzeEmailBuffer, EmailAnalysisResult } from "@/lib/email-analysis";
import { verifyRecaptchaToken } from "@/lib/recaptcha";

export const maxDuration = 60; // 60 seconds timeout for DNS/redirect lookups

// Sample realistic phishing email for one-click testing
const SAMPLE_PHISHING_EMAIL = `Received: from mail-relay99.suspicious-net.ru (mail-relay99.suspicious-net.ru [185.220.101.5])
    by mx.google.com with ESMTPS id abc123xyz
    for <victim.employee@cankalsoftware.com>;
    Wed, 15 Oct 2026 14:22:10 +0000
Authentication-Results: mx.google.com;
    spf=fail (google.com: domain of support@microsoft-verify-portal.ru does not designate 185.220.101.5 as permitted sender) smtp.mailfrom=support@microsoft-verify-portal.ru;
    dkim=fail header.i=@microsoft-verify-portal.ru;
    dmarc=fail (p=REJECT) header.from=microsoft.com
From: "Microsoft 365 Security Team" <support@microsoft-verify-portal.ru>
Reply-To: "IT Support Recovery" <harvest-mailbox-99@tempmail.com>
Return-Path: <bounces@mailer-spammer.top>
To: victim.employee@cankalsoftware.com
Subject: URGENT: Your Microsoft 365 Account Will Be Suspended Within 24 Hours
Date: Wed, 15 Oct 2026 14:20:00 +0000
Message-ID: <20261015142000.PHISH9911@microsoft-verify-portal.ru>
Content-Type: text/html; charset=UTF-8

<!DOCTYPE html>
<html>
<head><title>Account Alert</title></head>
<body>
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #d9534f;">Immediate Action Required: Account Suspension Warning</h2>
  <p>Dear Valued Customer,</p>
  <p>Unauthorized access was detected from an unrecognized IP address on your corporate mailbox. To prevent unauthorized data exfiltration, your account will be suspended within 24 hours.</p>
  <p>Please confirm your password and verify your identity immediately by visiting our secure portal:</p>
  <p style="margin: 30px 0;">
    <a href="http://bit.ly/fake-m365-login" style="background-color: #0078d4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">
      https://login.microsoftonline.com/verify-identity
    </a>
  </p>
  <p>Failure to complete verification will result in immediate termination of all corporate email access and cloud drives.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
  <p style="font-size: 11px; color: #777;">Microsoft Corporation, One Microsoft Way, Redmond, WA 98052 USA.</p>
</div>
</body>
</html>
`;

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let buffer: Buffer;
    let fileName = "pasted_email.eml";
    let fileHint: "msg" | "eml" | "raw" = "eml";
    let recaptchaToken: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      recaptchaToken = (formData.get("recaptchaToken") as string) || undefined;

      if (!file) {
        return NextResponse.json(
          { error: "No email file uploaded. Please upload a .msg, .eml, or raw text file." },
          { status: 400 }
        );
      }

      // Max 10MB size limit
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File size exceeds the 10MB limit. Please upload a smaller email message." },
          { status: 400 }
        );
      }

      fileName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);

      if (fileName.toLowerCase().endsWith(".msg")) {
        fileHint = "msg";
      } else if (fileName.toLowerCase().endsWith(".eml")) {
        fileHint = "eml";
      } else {
        fileHint = "raw";
      }
    } else {
      // JSON body
      const body = await req.json();
      recaptchaToken = body.recaptchaToken;

      if (body.sample === "phishing") {
        buffer = Buffer.from(SAMPLE_PHISHING_EMAIL, "utf-8");
        fileName = "sample_credential_phishing.eml";
        fileHint = "eml";
      } else if (body.rawContent && typeof body.rawContent === "string") {
        buffer = Buffer.from(body.rawContent, "utf-8");
        fileName = body.fileName || "raw_pasted_headers.eml";
        fileHint = "raw";
      } else {
        return NextResponse.json(
          { error: "Invalid request. Provide rawContent or upload a .msg / .eml file." },
          { status: 400 }
        );
      }
    }

    // Optional reCAPTCHA verification (graceful fallback in dev)
    if (recaptchaToken) {
      const recaptchaResult = await verifyRecaptchaToken(recaptchaToken, "email_analysis");
      if (!recaptchaResult.success) {
        return NextResponse.json(
          { error: "Bot verification failed. Please try again." },
          { status: 403 }
        );
      }
    }

    // Run deep analysis
    const result: EmailAnalysisResult = await analyzeEmailBuffer(buffer, fileName, fileHint);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to analyze email";
    return NextResponse.json(
      { error: `Email analysis error: ${message}` },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Support quick GET with ?sample=phishing for instant browser / curl tests
  const { searchParams } = new URL(req.url);
  if (searchParams.get("sample") === "phishing") {
    const buffer = Buffer.from(SAMPLE_PHISHING_EMAIL, "utf-8");
    const result = await analyzeEmailBuffer(buffer, "sample_credential_phishing.eml", "eml");
    return NextResponse.json(result);
  }

  return NextResponse.json({
    status: "active",
    tool: "Cankal Software Email Phishing Analysis Engine",
    supportedFormats: [".msg (Outlook OLE)", ".eml (MIME RFC 822)", "raw headers text"],
  });
}
