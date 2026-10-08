import MarketingPage from "@/components/marketing/MarketingPage";

export default function FeaturesPage() {
  return (
    <MarketingPage
      eyebrow="Product"
      title="Everything you need to make links more useful."
      description="Shortly combines fast URL shortening with link management, analytics, QR sharing and practical controls in one focused product."
      stats={[
        { value: "1 place", label: "to create and manage links" },
        { value: "Real-time", label: "click visibility" },
        { value: "Built-in", label: "QR and sharing tools" },
      ]}
      sectionTitle="A complete link workflow without unnecessary complexity."
      sectionDescription="The product is designed around the actions you use most: create, customize, share, manage and understand."
      features={[
        {
          icon: "link",
          title: "URL shortening",
          description:
            "Turn long destinations into clean short URLs in seconds.",
        },
        {
          icon: "tags",
          title: "Custom aliases",
          description:
            "Choose memorable identifiers for campaigns, pages and shared content.",
        },
        {
          icon: "analytics",
          title: "Click analytics",
          description:
            "Track activity and understand how your links are performing.",
        },
        {
          icon: "qr",
          title: "QR codes",
          description:
            "Move seamlessly between digital and offline sharing.",
        },
        {
          icon: "shield",
          title: "Link controls",
          description:
            "Disable links, edit destinations and set expiration dates.",
        },
        {
          icon: "layers",
          title: "Central management",
          description:
            "Keep every link organized and accessible from one dashboard.",
        },
      ]}
      closingTitle="A simpler way to manage what you share."
      closingDescription="Start with one short link today and keep everything organized as your link library grows."
    />
  );
}
