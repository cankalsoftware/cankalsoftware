export interface ScanQuotaInfo {
  allowed: boolean;
  used: number;
  max: number;
  remaining: number;
  month: string;
}

export const MAX_FREE_SCANS_PER_MONTH = 10;

export const DEFAULT_SCAN_QUOTA: ScanQuotaInfo = {
  allowed: true,
  used: 0,
  max: MAX_FREE_SCANS_PER_MONTH,
  remaining: MAX_FREE_SCANS_PER_MONTH,
  month: "",
};

/**
 * Reads the current client monthly scan quota from localStorage/cookies.
 * Automatically resets when a new calendar month starts.
 */
export function getScanQuota(): ScanQuotaInfo {
  if (typeof window === "undefined") {
    return DEFAULT_SCAN_QUOTA;
  }

  const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-10"
  try {
    const raw = localStorage.getItem("cankal_monthly_scan_quota");
    if (!raw) {
      return {
        allowed: true,
        used: 0,
        max: MAX_FREE_SCANS_PER_MONTH,
        remaining: MAX_FREE_SCANS_PER_MONTH,
        month: currentMonth,
      };
    }

    const data = JSON.parse(raw);
    if (data.month !== currentMonth) {
      // New month: reset quota
      return {
        allowed: true,
        used: 0,
        max: MAX_FREE_SCANS_PER_MONTH,
        remaining: MAX_FREE_SCANS_PER_MONTH,
        month: currentMonth,
      };
    }

    const used = Number(data.used) || 0;
    return {
      allowed: used < MAX_FREE_SCANS_PER_MONTH,
      used,
      max: MAX_FREE_SCANS_PER_MONTH,
      remaining: Math.max(0, MAX_FREE_SCANS_PER_MONTH - used),
      month: currentMonth,
    };
  } catch {
    return {
      allowed: true,
      used: 0,
      max: MAX_FREE_SCANS_PER_MONTH,
      remaining: MAX_FREE_SCANS_PER_MONTH,
      month: currentMonth,
    };
  }
}

/**
 * Increments the monthly scan count upon a successful scan completion.
 */
export function recordScanUsage(domain?: string): ScanQuotaInfo {
  if (typeof window === "undefined") {
    return {
      allowed: true,
      used: 1,
      max: MAX_FREE_SCANS_PER_MONTH,
      remaining: MAX_FREE_SCANS_PER_MONTH - 1,
      month: "",
    };
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const current = getScanQuota();
  const nextUsed = (current.month === currentMonth ? current.used : 0) + 1;

  try {
    localStorage.setItem(
      "cankal_monthly_scan_quota",
      JSON.stringify({
        month: currentMonth,
        used: nextUsed,
        lastDomain: domain || "",
        lastUpdated: new Date().toISOString(),
      })
    );
  } catch {
    // Ignore storage quota issues gracefully
  }

  return {
    allowed: nextUsed <= MAX_FREE_SCANS_PER_MONTH,
    used: nextUsed,
    max: MAX_FREE_SCANS_PER_MONTH,
    remaining: Math.max(0, MAX_FREE_SCANS_PER_MONTH - nextUsed),
    month: currentMonth,
  };
}
