import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL & Link Click Analytics",
  description: "Track short link clicks, see geographic activity and understand traffic sources with Shortly link analytics.",
  alternates: {
    canonical: "/link-analytics",
  },
  openGraph: {
    type: "website",
    title: "URL & Link Click Analytics | Shortly",
    description: "Track short link clicks, see geographic activity and understand traffic sources with Shortly link analytics.",
    url: "/link-analytics",
    siteName: "Shortly",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import MarketingPage from "@/components/marketing/MarketingPage";

export default function LinkAnalyticsPage() {
  return (
    <MarketingPage
      eyebrow="Analytics"
      title="Understand what happens after the click."
      description="See how your short links perform with clear click activity, geographic data, referrers and link-level performance."
      stats={[
        { value: "Clicks", label: "tracked across your links" },
        { value: "Countries", label: "visible from recorded traffic" },
        { value: "Sources", label: "to understand where visits begin" },
      ]}
      sectionTitle="Useful analytics, not an overwhelming reporting suite."
      sectionDescription="Shortly focuses on the signals that help you understand whether a link is getting attention and where that attention comes from."
      features={[
        {
          icon: "click",
          title: "Click activity",
          description:
            "See how much activity each short URL is generating.",
        },
        {
          icon: "globe",
          title: "Geographic insight",
          description:
            "Understand which countries are contributing to your traffic.",
        },
        {
          icon: "analytics",
          title: "Top links",
          description:
            "Quickly identify the URLs performing best across your account.",
        },
        {
          icon: "layers",
          title: "Traffic sources",
          description:
            "See referrer information when browsers provide it.",
        },
        {
          icon: "sparkles",
          title: "Browser context",
          description:
            "Use stored visitor context to understand how links are being opened.",
        },
        {
          icon: "shield",
          title: "Owned data",
          description:
            "Analytics are scoped to links that belong to your account.",
        },
      ]}
      faqs={[
        {
          question: "What can I see in Shortly link analytics?",
          answer: "Shortly provides link click activity, geographic information and referrer data where the visitor's browser makes it available.",
        },
        {
          question: "Can I compare the performance of different short links?",
          answer: "Yes. Your dashboard helps you review link activity and identify which of your links are receiving more clicks.",
        },
        {
          question: "Does link analytics identify individual visitors?",
          answer: "No. Analytics are intended to show aggregate activity and available visit context, not reveal the personal identity of each person who clicks.",
        },
      ]}
      closingTitle="Make link decisions with better context."
      closingDescription="Create links, share them, then come back to see which ones are actually getting attention."
    />
  );
}
