import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Shortener for Marketing Campaigns",
  description: "Create trackable campaign links, use memorable short URLs and measure clicks across your marketing channels with Shortly.",
  alternates: {
    canonical: "/solutions/marketing",
  },
  openGraph: {
    type: "website",
    title: "URL Shortener for Marketing Campaigns | Shortly",
    description: "Create trackable campaign links, use memorable short URLs and measure clicks across your marketing channels with Shortly.",
    url: "/solutions/marketing",
    siteName: "Shortly",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import MarketingPage from "@/components/marketing/MarketingPage";

export default function MarketingSolutionPage() {
  return (
    <MarketingPage
      eyebrow="For marketing"
      title="Campaign links that stay clean and measurable."
      description="Create memorable short URLs for launches, campaigns and channels, then keep an eye on which links are actually getting attention."
      sectionTitle="Made for campaign workflows."
      sectionDescription="Shortly helps marketers move quickly from idea to shareable link without losing visibility after publishing."
      features={[
        {
          icon: "link",
          title: "Campaign-friendly URLs",
          description:
            "Replace long tracking URLs with cleaner links that are easier to share.",
        },
        {
          icon: "tags",
          title: "Memorable aliases",
          description:
            "Use names that match the campaign, offer or destination.",
        },
        {
          icon: "analytics",
          title: "Performance visibility",
          description:
            "See which campaign links are attracting the most clicks.",
        },
        {
          icon: "globe",
          title: "Channel flexibility",
          description:
            "Use the same short link across email, social, ads and landing pages.",
        },
        {
          icon: "qr",
          title: "Offline campaign support",
          description:
            "Turn campaign links into QR codes for events and printed material.",
        },
        {
          icon: "shield",
          title: "Link control",
          description:
            "Disable or update links when a campaign ends or changes.",
        },
      ]}
      closingTitle="Make every campaign link easier to manage."
      closingDescription="Create cleaner campaign URLs and keep performance visible from one place."
    />
  );
}
