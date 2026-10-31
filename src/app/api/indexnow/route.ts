import { NextRequest, NextResponse } from "next/server";

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "c4f82a938c1a4e21a8b92d7e4b953a71";
const HOST = "cankalsoftware.com";
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

export const SITE_URLS = [
  `https://${HOST}`,
  `https://${HOST}/about`,
  `https://${HOST}/contact`,
  `https://${HOST}/aeo-scanner`,
  `https://${HOST}/health-check`,
  `https://${HOST}/vulnerability-check`,
  `https://${HOST}/cve-tracker`,
  `https://${HOST}/owasp-check`,
  `https://${HOST}/email-analysis`,
  `https://${HOST}/privacy-policy`,
  `https://${HOST}/terms-of-service`,
  `https://${HOST}/cookie-policy`,
  `https://${HOST}/acceptable-use`,
  `https://${HOST}/service-level-agreement`,
];

export async function submitToIndexNow(urls = SITE_URLS) {
  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
  ];

  const results = await Promise.allSettled(
    endpoints.map(async (endpoint) => {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      return {
        endpoint,
        status: res.status,
        statusText: res.statusText,
        ok: res.ok || res.status === 200 || res.status === 202,
      };
    })
  );

  return results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { endpoint: endpoints[i], ok: false, error: (r.reason as Error)?.message || "Failed" }
  );
}

export async function GET() {
  return NextResponse.json({
    status: "ready",
    host: HOST,
    keyLocation: KEY_LOCATION,
    totalUrls: SITE_URLS.length,
    urls: SITE_URLS,
  });
}

export async function POST(req: NextRequest) {
  try {
    let customUrls: string[] | undefined;
    try {
      const body = await req.json();
      if (Array.isArray(body?.urls) && body.urls.length > 0) {
        customUrls = body.urls;
      }
    } catch {
      // If no JSON body, submit all site URLs
    }

    const targetUrls = customUrls || SITE_URLS;
    const submissionResults = await submitToIndexNow(targetUrls);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      submittedCount: targetUrls.length,
      urls: targetUrls,
      results: submissionResults,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "IndexNow submission failed",
      },
      { status: 500 }
    );
  }
}

