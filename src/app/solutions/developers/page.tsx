import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Shortening for Developers",
  description: "Use Shortly for short URL redirects, link lifecycle controls and click visibility in modern product workflows.",
  alternates: { canonical: "/solutions/developers" },
  openGraph: {
    type: "website",
    title: "URL Shortening for Developers | Shortly",
    description: "Use Shortly for short URL redirects, link lifecycle controls and click visibility in modern product workflows.",
    url: "/solutions/developers",
    siteName: "Shortly",
  },
  robots: { index: true, follow: true },
};

import MarketingPage from "@/components/marketing/MarketingPage";

export default function DeveloperSolutionPage() {
  return (
    <MarketingPage
      eyebrow="For developers"
      title="A practical link layer for modern products."
      description="Use Shortly to handle redirects, link lifecycle and click visibility without rebuilding the full system every time."
      sectionTitle="Useful foundations for product workflows."
      sectionDescription="Shortly already handles the core mechanics around short URLs so you can focus on the product experience around them."
      features={[
        {
          icon: "link",
          title: "Reliable redirects",
          description:
            "Short URLs resolve through a dedicated redirect route with status handling.",
        },
        {
          icon: "shield",
          title: "Ownership checks",
          description:
            "Authenticated link operations are scoped to the correct user.",
        },
        {
          icon: "timer",
          title: "Expiration support",
          description:
            "Links can stop resolving automatically after a configured time.",
        },
        {
          icon: "analytics",
          title: "Click records",
          description:
            "Capture useful click context for analytics and product insight.",
        },
        {
          icon: "layers",
          title: "Central management",
          description:
            "Manage link state and destinations through the dashboard.",
        },
        {
          icon: "sparkles",
          title: "API-ready direction",
          description:
            "The product architecture is already moving toward API-first workflows.",
        },
      ]}
      closingTitle="Build on top of a working link foundation."
      closingDescription="Use Shortly today, then expand into API workflows as the product grows."
    />
  );
}
