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

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://shortly.com";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),

  title: {
    default: "Shortly - Short Links, Better Insights",
    template: "%s | Shortly",
  },

  description: "Create, manage, share and analyze short links with Shortly.",

  keywords: [
    "URL shortener",
    "short links",
    "link management",
    "link analytics",
    "QR codes",
    "link tracking",
    "Shortly",
  ],

  applicationName: "Shortly",

  authors: [
    {
      name: "Nexvius Labs",
    },
  ],

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
    url: "/",
    siteName: "Shortly",
    title: "Shortly — Short Links, Better Insights",
    description:
      "Create, manage, share and understand your short links from one place.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Shortly — Short Links, Better Insights",
    description:
      "Create, manage, share and understand your short links from one place.",
  },

  robots: {
    index: true,
    follow: true,
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
      </body>
    </html>
  );
}
