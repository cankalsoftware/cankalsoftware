import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";

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
  title: {
    default: "Cankal Software & IT Consultancy Ltd. | AI & Web Development",
    template: "%s | Cankal Software",
  },
  description: "Premium SaaS and AI-driven Web Development Solutions. Cankal Software specializes in Machine Learning, Computer Vision, and high-end web applications based in the UK.",
  keywords: ["Software Development", "AI", "Machine Learning", "SaaS", "Web Development", "IT Consultancy", "Next.js", "Cankal Software", "UK IT Company", "Evacuation App", "Firevision"],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://cankalsoftware.com",
    title: "Cankal Software & IT Consultancy Ltd.",
    description: "Premium SaaS and AI-driven Web Development Solutions.",
    siteName: "Cankal Software",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cankal Software & IT Consultancy Ltd.",
    description: "Premium SaaS and AI-driven Web Development Solutions.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Cankal Software and IT Consultancy Ltd.",
  "url": "https://cankalsoftware.com",
  "logo": "https://cankalsoftware.com/icon.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "info@cankalsoftware.com",
    "contactType": "customer service"
  },
  "sameAs": [
    "https://linkedin.com/company/cankalsoftware"
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-full flex flex-col relative">
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
          <main className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
      </body>
    </html>
  );
}
