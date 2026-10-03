export interface RecaptchaVerificationResult {
  success: boolean;
  score?: number;
  action?: string;
  error?: string;
}

/**
 * Server-side helper to verify Google reCAPTCHA v3 tokens.
 * Gracefully falls back in local/dev environments where RECAPTCHA_SECRET_KEY is not configured.
 */
export async function verifyRecaptchaToken(
  token: string | undefined | null,
  expectedAction?: string,
  minScore = 0.5
): Promise<RecaptchaVerificationResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  // In development environments without a configured secret key, allow the request to proceed
  if (!secretKey) {
    return { success: true, score: 1.0 };
  }

  if (!token) {
    return { success: false, error: "Missing reCAPTCHA verification token." };
  }

  try {
    const params = new URLSearchParams({
      secret: secretKey,
      response: token,
    });

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: "reCAPTCHA verification rejected by Google API.",
      };
    }

    if (typeof data.score === "number" && data.score < minScore) {
      return {
        success: false,
        score: data.score,
        error: `reCAPTCHA security score (${data.score.toFixed(2)}) is below the required threshold.`,
      };
    }

    if (expectedAction && data.action && data.action !== expectedAction) {
      return {
        success: false,
        score: data.score,
        action: data.action,
        error: `reCAPTCHA action mismatch: expected '${expectedAction}', received '${data.action}'.`,
      };
    }

    return {
      success: true,
      score: data.score,
      action: data.action,
    };
  } catch (err) {
    console.error("reCAPTCHA siteverify error:", err);
    return { success: false, error: "Could not reach Google reCAPTCHA verification servers." };
  }
}
