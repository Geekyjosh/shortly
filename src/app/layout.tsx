import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import InstallPrompt from "@/components/InstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = "https://shortly.nexviuslabs.com";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),

  title: {
    default: "Free URL Shortener & Link Management Tool | Shortly",
    template: "%s | Shortly",
  },

  description:
    "Use Shortly as a free URL shortener to create custom short links, track clicks and generate QR codes from one simple link management dashboard.",

  keywords: [
    "free URL shortener",
    "URL shortener",
    "link shortener",
    "short link generator",
    "custom short links",
    "link management",
    "URL tracking",
    "link analytics",
    "click tracking",
    "QR code generator",
    "Shortly",
  ],

  applicationName: "Shortly",

  authors: [{ name: "Nexvius Labs", url: "https://nexviuslabs.com" }],
  creator: "Nexvius Labs",
  publisher: "Nexvius Labs",

  alternates: {
    canonical: "/",
  },

  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },

  openGraph: {
    type: "website",
    url: appUrl,
    siteName: "Shortly",
    title: "Free URL Shortener & Link Management Tool | Shortly",
    description:
      "Shorten long URLs for free, create custom short links, track clicks and generate QR codes from one simple link management dashboard.",
    locale: "en_US",
  },

  twitter: {
    card: "summary",
    title: "Free URL Shortener & Link Management Tool | Shortly",
    description:
      "Use Shortly as a free URL shortener to create custom short links, track clicks and generate QR codes.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#ffffff",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#020617",
    },
  ],
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Nexvius Labs",
  url: "https://nexviuslabs.com",
  logo: "https://shortly.nexviuslabs.com/logo.png",
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Shortly",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: appUrl,
  description:
    "A URL shortener and link management platform for creating custom short links, tracking clicks and generating QR codes.",
  publisher: {
    "@type": "Organization",
    name: "Nexvius Labs",
    url: "https://nexviuslabs.com",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <ThemeProvider>
          {children}
          <InstallPrompt />
        </ThemeProvider>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationSchema, softwareSchema]).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
