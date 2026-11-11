import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Code Generator for Short Links",
  description: "Generate QR codes from Shortly short links and share destinations across print, events, packaging and digital channels.",
  alternates: {
    canonical: "/qr-code-generator",
  },
  openGraph: {
    type: "website",
    title: "QR Code Generator for Short Links | Shortly",
    description: "Generate QR codes from Shortly short links and share destinations across print, events, packaging and digital channels.",
    url: "/qr-code-generator",
    siteName: "Shortly",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import MarketingPage from "@/components/marketing/MarketingPage";

export default function QrCodeGeneratorPage() {
  return (
    <MarketingPage
      eyebrow="QR codes"
      title="Take your short links beyond the screen."
      description="Turn Shortly URLs into scannable QR codes for print, events, packaging, presentations and anywhere typing a link would be inconvenient."
      stats={[
        { value: "Scan", label: "instead of typing a long URL" },
        { value: "Share", label: "across digital and physical media" },
        { value: "Track", label: "clicks behind the short destination" },
      ]}
      sectionTitle="One link, more ways to reach it."
      sectionDescription="QR codes extend the same short-link workflow into offline and visual experiences without creating a separate destination to manage."
      features={[
        {
          icon: "qr",
          title: "Instant QR generation",
          description:
            "Generate a scannable code directly from a Shortly link.",
        },
        {
          icon: "link",
          title: "Short destination",
          description:
            "Keep the QR destination simple and easier to manage.",
        },
        {
          icon: "analytics",
          title: "Trackable traffic",
          description:
            "QR visits still flow through the same click tracking system.",
        },
        {
          icon: "globe",
          title: "Offline sharing",
          description:
            "Use links on posters, cards, presentations and printed material.",
        },
        {
          icon: "shield",
          title: "Destination control",
          description:
            "Update or disable the link behind the QR code from your account.",
        },
        {
          icon: "sparkles",
          title: "Fast sharing",
          description:
            "Move from a created short link to a QR-ready workflow quickly.",
        },
      ]}
      closingTitle="Make every short link easier to access."
      closingDescription="Create a Shortly URL and turn it into a QR code whenever the context calls for scanning instead of typing."
    />
  );
}
