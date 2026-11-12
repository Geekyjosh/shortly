import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing – Free Link Shortener",
  description:
    "Explore Shortly pricing. Create and manage short links with the features currently available on the free plan.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    type: "website",
    title: "Pricing – Free Link Shortener | Shortly",
    description:
      "Explore Shortly pricing. Create and manage short links with the features currently available on the free plan.",
    url: "/pricing",
    siteName: "Shortly",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import Link from "next/link";
import { ArrowRight, Check, CircleHelp, Link2 } from "lucide-react";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

const included = [
  {
    title: "Short URL creation",
    description: "Turn long destinations into concise, shareable links.",
  },
  {
    title: "Custom aliases",
    description: "Choose a memorable ending for your short links.",
  },
  {
    title: "Link management dashboard",
    description: "Keep your links organised in one workspace.",
  },
  {
    title: "Click tracking",
    description: "See activity across the links you share.",
  },
  {
    title: "QR codes",
    description: "Make your short links available as QR codes.",
  },
  {
    title: "Link expiration",
    description: "Set links to expire when they are no longer needed.",
  },
  {
    title: "Active / inactive controls",
    description: "Control whether a link remains available.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      <main>
        <section className="border-b border-[var(--border)]">
          <div className="shortly-container py-14 sm:py-18 lg:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <p className="shortly-eyebrow">Straightforward pricing</p>
              <h1 className="mt-4 text-4xl font-semibold leading-[1.06] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                Everything available today.
                <span className="block text-[var(--brand)]">Nothing to pay.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 shortly-muted">
                Shortly is currently free to use. Create short links, manage
                them from your workspace and understand how people interact
                with them — without choosing a paid subscription.
              </p>
            </div>
          </div>
        </section>

        <section className="shortly-section">
          <div className="shortly-container">
            <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
              <aside
                className="rounded-2xl border p-6 sm:p-8"
                style={{
                  borderColor: "rgba(59, 130, 246, 0.35)",
                  background: "var(--surface)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      background: "var(--brand-soft)",
                      color: "var(--brand)",
                    }}
                  >
                    <Link2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold shortly-muted">
                      Current plan
                    </p>
                    <h2 className="text-xl font-semibold">Shortly Free</h2>
                  </div>
                </div>

                <div className="mt-8 border-b border-[var(--border)] pb-7">
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-semibold tracking-[-0.06em]">
                      $0
                    </span>
                    <span className="text-base shortly-subtle">currently</span>
                  </div>
                  <p className="mt-3 text-base leading-7 shortly-muted">
                    No paid subscription is required to use the features listed
                    here.
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  <p className="text-sm font-semibold">Get started</p>
                  <Link
                    href="/register"
                    className="shortly-button-primary flex w-full items-center justify-center gap-2"
                  >
                    Create your account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <p className="text-sm leading-6 shortly-subtle">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-semibold text-[var(--brand)] hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </aside>

              <div>
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="shortly-eyebrow">Included today</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                      The tools to manage your links
                    </h2>
                  </div>
                  <p className="text-sm shortly-subtle">
                    Available on the current free plan
                  </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                  {included.map((item, index) => (
                    <div
                      key={item.title}
                      className={`flex gap-4 px-5 py-4 sm:px-6 ${
                        index !== included.length - 1
                          ? "border-b border-[var(--border)]"
                          : ""
                      }`}
                    >
                      <span
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        style={{
                          background: "var(--brand-soft)",
                          color: "var(--brand)",
                        }}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <h3 className="text-base font-semibold">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 shortly-muted">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mx-auto mt-10 flex max-w-5xl flex-col gap-3 rounded-xl border border-[var(--border)] px-5 py-4 sm:flex-row sm:items-start sm:gap-4 sm:px-6">
              <CircleHelp className="mt-0.5 h-5 w-5 shrink-0 shortly-subtle" />
              <div>
                <h3 className="text-base font-semibold">
                  Prefer to try Shortly first?
                </h3>
                <p className="mt-1 text-sm leading-6 shortly-muted">
                  Guest users can create a limited number of links without
                  registering. Create an account when you want to manage your
                  links from a personal workspace.
                </p>
              </div>
            </div>

            <p className="mx-auto mt-7 max-w-3xl text-center text-sm leading-6 shortly-subtle">
              Shortly is currently available without a paid subscription. If
              pricing changes in the future, that will be made clear before
              you are charged.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
