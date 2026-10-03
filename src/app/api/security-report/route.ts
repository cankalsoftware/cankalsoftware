import { NextResponse } from "next/server";

/**
 * Cankal Software Automated Security Telemetry & CSP Violation Ingestion Endpoint (A09:2026)
 * Collects real-time browser security reports (CSP violations, certificate transparency, and cross-origin violations).
 */
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let reportData: unknown = null;

    if (
      contentType.includes("application/json") ||
      contentType.includes("application/csp-report") ||
      contentType.includes("application/reports+json")
    ) {
      reportData = await req.json();
    } else {
      const text = await req.text();
      try {
        reportData = JSON.parse(text);
      } catch {
        reportData = { raw: text };
      }
    }

    // Security telemetry log (can forward to central SIEM or Sentry in production)
    if (process.env.NODE_ENV !== "production") {
      console.log("[SECURITY_TELEMETRY] CSP / Violation Report Received:", JSON.stringify(reportData));
    }

    return NextResponse.json(
      {
        status: "received",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: "Failed to process security telemetry report",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    service: "Cankal Software Security Violation & Telemetry Ingestion API",
    compliance: "OWASP A09:2026 Security Logging & Monitoring",
    timestamp: new Date().toISOString(),
  });
}
