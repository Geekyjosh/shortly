import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shortly Help Center",
  description: "Find help with creating short links, managing URLs, understanding click analytics and generating QR codes in Shortly.",
  alternates: {
    canonical: "/help",
  },
  openGraph: {
    type: "website",
    title: "Shortly Help Center | Shortly",
    description: "Find help with creating short links, managing URLs, understanding click analytics and generating QR codes in Shortly.",
    url: "/help",
    siteName: "Shortly",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CircleHelp,
  Link2,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

const topics = [
  {
    icon: Link2,
    title: "Creating links",
    description:
      "Learn how to shorten URLs, use aliases and understand guest limits.",
  },
  {
    icon: ShieldCheck,
    title: "Managing links",
    description:
      "Edit destinations, change status, delete links and set expiration dates.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Understand clicks, referrers, countries and performance data.",
  },
  {
    icon: QrCode,
    title: "QR codes and sharing",
    description:
      "Share short links through QR codes, social platforms and copy actions.",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      <main>
        <section className="border-b border-[var(--border)]">
          <div className="shortly-container py-20 sm:py-24 lg:py-28">
            <div className="max-w-3xl">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background: "var(--brand-soft)",
                  color: "var(--brand)",
                }}
              >
                <CircleHelp className="h-5 w-5" />
              </div>

              <p className="mt-7 shortly-eyebrow">Help center</p>

              <h1 className="mt-5 text-5xl font-semibold tracking-[-0.045em] sm:text-6xl">
                Get more out of Shortly.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 shortly-muted">
                Find quick guidance for the core workflows available in Shortly
                today.
              </p>
            </div>
          </div>
        </section>

        <section className="shortly-section">
          <div className="shortly-container">
            <div className="grid gap-5 md:grid-cols-2">
              {topics.map((topic) => {
                const Icon = topic.icon;

                return (
                  <div
                    key={topic.title}
                    className="shortly-card-flat p-7 sm:p-8"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{
                        background: "var(--brand-soft)",
                        color: "var(--brand)",
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <h2 className="mt-6 text-xl font-semibold">
                      {topic.title}
                    </h2>

                    <p className="mt-3 text-sm leading-7 shortly-muted">
                      {topic.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-7 sm:p-8">
              <h2 className="text-2xl font-semibold">
                Need to start somewhere?
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 shortly-muted">
                Create a short link first, then open your dashboard to manage
                it and view analytics after the link receives clicks.
              </p>

              <Link
                href="/#shorten"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-500"
              >
                Create your first link
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
