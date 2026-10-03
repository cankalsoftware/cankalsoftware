import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { MetaPixel } from "@/components/MetaPixel";
import { GoogleAnalytics } from "@next/third-parties/google";
import { RecaptchaProvider } from "@/components/RecaptchaProvider";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cankalsoftware.com"),
  alternates: {
    canonical: "https://cankalsoftware.com",
  },
  title: {
    default: "Cankal Software & IT Consultancy Ltd. | AI & Web Development",
    template: "%s | Cankal Software",
  },
  description:
    "Premium SaaS and AI-driven Web Development Solutions. Cankal Software specializes in Machine Learning, Computer Vision, and high-end web applications based in the UK.",
  keywords: [
    "Software Development",
    "AI Transformation",
    "Artificial Intelligence",
    "Machine Learning",
    "Computer Vision",
    "SaaS Development",
    "Web Development",
    "IT Consultancy",
    "Next.js",
    "Cankal Software",
    "Ali Cankal",
    "UK IT Company",
    "Firevision",
    "Evacuation App",
  ],
  authors: [{ name: "Ali Cankal", url: "https://alicankal.com" }],
  creator: "Ali Cankal",
  publisher: "Cankal Software and IT Consultancy Ltd.",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://cankalsoftware.com",
    title: "Cankal Software & IT Consultancy Ltd. | AI & Web Development",
    description:
      "Transform your business with custom AI solutions, automated workflows, and high-performance SaaS web applications.",
    siteName: "Cankal Software",
    images: [
      {
        url: "/cankalsoftware-neon-logo.png",
        width: 1200,
        height: 630,
        alt: "Cankal Software - AI & Web Development",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cankal Software & IT Consultancy Ltd. | AI & Web Development",
    description:
      "Transform your business with custom AI solutions, automated workflows, and high-performance SaaS web applications.",
    images: ["/cankalsoftware-neon-logo.png"],
    creator: "@alicankal",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "GB",
    "geo.placename": "United Kingdom",
    "geo.position": "55.3781;-3.4360",
    ICBM: "55.3781, -3.4360",
    "format-detection": "telephone=no",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": "https://cankalsoftware.com/#organization",
      name: "Cankal Software and IT Consultancy Ltd.",
      url: "https://cankalsoftware.com",
      logo: "https://cankalsoftware.com/icon.png",
      image: "https://cankalsoftware.com/cankalsoftware-neon-logo.png",
      description:
        "UK-based technology consultancy specializing in AI, Machine Learning, Computer Vision, and full-stack web applications.",
      founder: {
        "@type": "Person",
        "@id": "https://alicankal.com/#person",
        name: "Ali Cankal",
        url: "https://alicankal.com",
        jobTitle: "Founder & Principal AI Architect",
        sameAs: [
          "https://alicankal.com",
          "https://linkedin.com/company/cankal_software",
        ],
      },
      address: {
        "@type": "PostalAddress",
        addressCountry: "GB",
        addressRegion: "United Kingdom",
      },
      areaServed: [
        { "@type": "Country", name: "United Kingdom" },
        { "@type": "AdministrativeArea", name: "Worldwide" },
      ],
      knowsAbout: [
        "Artificial Intelligence",
        "Machine Learning",
        "Computer Vision",
        "Next.js Development",
        "SaaS Product Engineering",
        "AI Automation Workflows",
        "IT Consultancy",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        email: "info@cankalsoftware.com",
        contactType: "customer service",
      },
      sameAs: [
        "https://linkedin.com/company/cankal_software",
        "https://alicankal.com",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://cankalsoftware.com/#website",
      url: "https://cankalsoftware.com",
      name: "Cankal Software",
      publisher: { "@id": "https://cankalsoftware.com/#organization" },
      inLanguage: "en-GB",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'wait_for_update': 500
              });
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col relative">
        <RecaptchaProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {/* Background glowing orbs */}
            <div className="bg-glow"></div>
            <div className="bg-glow-2"></div>

            <Navbar />
            <main className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-2 sm:mt-4 relative z-10">
              {children}
            </main>
            <Footer />
            <ScrollToTop />
            <CookieConsentBanner />
          </ThemeProvider>
        </RecaptchaProvider>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        <MetaPixel pixelId={process.env.NEXT_PUBLIC_FB_PIXEL_ID || "1643699187349283"} />
      </body>
    </html>
  );
}
