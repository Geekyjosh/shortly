import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing – Free Link Shortener",
  description: "Explore Shortly pricing. Create and manage short links with the features currently available on the free plan.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    type: "website",
    title: "Pricing – Free Link Shortener | Shortly",
    description: "Explore Shortly pricing. Create and manage short links with the features currently available on the free plan.",
    url: "/pricing",
    siteName: "Shortly",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import Link from "next/link";
import { Check } from "lucide-react";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

const included = [
  "Short URL creation",
  "Custom aliases",
  "Link management dashboard",
  "Click tracking",
  "QR codes",
  "Link expiration",
  "Active / inactive controls",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      <main>
        <section className="border-b border-[var(--border)]">
          <div className="shortly-container py-20 text-center sm:py-24 lg:py-28">
            <p className="shortly-eyebrow">Pricing</p>

            <h1 className="mx-auto mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl">
              Start simple. Pay nothing while Shortly is growing.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 shortly-muted">
              Shortly is currently available without a paid subscription while
              the product continues to grow. If pricing changes later, the
              product will make that clear before you are charged.
            </p>
          </div>
        </section>

        <section className="shortly-section">
          <div className="shortly-container">
            <div className="mx-auto max-w-2xl">
              <div
                className="rounded-[28px] border p-7 shadow-xl sm:p-9"
                style={{
                  borderColor: "rgba(59, 130, 246, 0.35)",
                  background: "var(--surface)",
                }}
              >
                <div className="flex flex-col gap-5 border-b border-[var(--border)] pb-7 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="shortly-eyebrow">Current plan</p>
                    <h2 className="mt-3 text-3xl font-semibold">Shortly Free</h2>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-4xl font-semibold tracking-[-0.04em]">
                      $0
                    </p>
                    <p className="mt-1 text-sm shortly-subtle">for now</p>
                  </div>
                </div>

                <div className="py-7">
                  <p className="text-sm font-semibold">Included today</p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {included.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <span
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                          style={{
                            background: "var(--brand-soft)",
                            color: "var(--brand)",
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </span>

                        <p className="text-sm shortly-muted">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Link href="/register" className="shortly-button-primary w-full">
                  Create your account
                </Link>
              </div>

              <p className="mt-6 text-center text-sm shortly-subtle">
                Guest users can also create a limited number of links without
                registering.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
