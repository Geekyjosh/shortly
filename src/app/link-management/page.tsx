import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Short Link Management Tool",
  description: "Create, edit, organize, disable and manage all your short URLs from one clear dashboard with Shortly.",
  alternates: {
    canonical: "/link-management",
  },
  openGraph: {
    type: "website",
    title: "Short Link Management Tool | Shortly",
    description: "Create, edit, organize, disable and manage all your short URLs from one clear dashboard with Shortly.",
    url: "/link-management",
    siteName: "Shortly",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import MarketingPage from "@/components/marketing/MarketingPage";

export default function LinkManagementPage() {
  return (
    <MarketingPage
      eyebrow="Link management"
      title="Keep every link under control."
      description="Create, edit, disable, search and manage short URLs from one dashboard built to stay clear as your link library grows."
      stats={[
        { value: "Edit", label: "destinations without starting over" },
        { value: "Pause", label: "links whenever you need" },
        { value: "Search", label: "your link library quickly" },
      ]}
      sectionTitle="The controls you need, where you expect them."
      sectionDescription="Shortly keeps everyday link actions easy to find so you spend less time managing the tool and more time using the links."
      features={[
        {
          icon: "layers",
          title: "One dashboard",
          description:
            "See your links, click totals, status and destinations from one place.",
        },
        {
          icon: "link",
          title: "Edit destinations",
          description:
            "Update where a short URL points without replacing the link itself.",
        },
        {
          icon: "shield",
          title: "Activate or disable",
          description:
            "Control whether a link should continue redirecting at any moment.",
        },
        {
          icon: "timer",
          title: "Expiration dates",
          description:
            "Set temporary links to stop working automatically when they should.",
        },
        {
          icon: "tags",
          title: "Custom aliases",
          description:
            "Give important links recognizable identifiers instead of random strings.",
        },
        {
          icon: "sparkles",
          title: "Fast actions",
          description:
            "Copy, share and open links directly from the management view.",
        },
      ]}
      closingTitle="Your links should be easy to manage."
      closingDescription="Create an account and keep every Shortly link accessible from one clean workspace."
    />
  );
}
