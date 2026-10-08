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
      closingTitle="Make link decisions with better context."
      closingDescription="Create links, share them, then come back to see which ones are actually getting attention."
    />
  );
}
