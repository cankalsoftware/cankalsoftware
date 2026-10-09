"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export function RecaptchaProvider({
  children,
  nonce,
}: {
  children: React.ReactNode;
  nonce?: string;
}) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

  if (!siteKey) {
    // If no site key is configured (e.g. initial dev environment), render children directly
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
        nonce: nonce,
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}

export default RecaptchaProvider;
