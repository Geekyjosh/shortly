import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Link Shortener for Content Creators",
  description: "Create clean, memorable short links for social bios, posts, newsletters and communities, then track link engagement with Shortly.",
  alternates: {
    canonical: "/solutions/creators",
  },
  openGraph: {
    type: "website",
    title: "Link Shortener for Content Creators | Shortly",
    description: "Create clean, memorable short links for social bios, posts, newsletters and communities, then track link engagement with Shortly.",
    url: "/solutions/creators",
    siteName: "Shortly",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import MarketingPage from "@/components/marketing/MarketingPage";

export default function CreatorSolutionPage() {
  return (
    <MarketingPage
      eyebrow="For creators"
      title="Cleaner links for everywhere your audience finds you."
      description="Use short, memorable URLs across bios, posts, newsletters and communities while keeping a simple view of what gets clicked."
      sectionTitle="Built for sharing often."
      sectionDescription="Creators need links that look clean, work everywhere and stay easy to manage without adding another complicated tool."
      features={[
        {
          icon: "link",
          title: "Cleaner sharing",
          description:
            "Turn long destinations into short URLs that fit naturally in posts and bios.",
        },
        {
          icon: "tags",
          title: "Easy-to-remember aliases",
          description:
            "Create recognizable links for projects, drops and collaborations.",
        },
        {
          icon: "analytics",
          title: "Audience signals",
          description:
            "See which shared links are getting attention from your audience.",
        },
        {
          icon: "qr",
          title: "QR support",
          description:
            "Connect physical materials, events and presentations to your content.",
        },
        {
          icon: "layers",
          title: "One place to manage everything",
          description:
            "Keep your active short links organized inside a single dashboard.",
        },
        {
          icon: "sparkles",
          title: "Fast copy and share",
          description:
            "Create a link and get it in front of your audience quickly.",
        },
      ]}
      closingTitle="Spend less time managing links."
      closingDescription="Create short URLs that look better wherever you share them."
    />
  );
}
