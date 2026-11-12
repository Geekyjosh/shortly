import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Link2, QrCode, SlidersHorizontal } from "lucide-react";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "About Shortly – A Nexvius Labs Product",
  description: "Meet Shortly, a link management product from Nexvius Labs built to make creating, managing and measuring short links straightforward.",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    title: "About Shortly – A Nexvius Labs Product | Shortly",
    description: "A focused link management product for creating, managing and measuring short links.",
    url: "/about",
    siteName: "Shortly",
  },
  robots: { index: true, follow: true },
};

const capabilities = [
  { icon: Link2, title: "Create with control", description: "Turn long URLs into concise links, choose a custom alias and set an expiration option when you create one." },
  { icon: SlidersHorizontal, title: "Manage in one place", description: "Keep your links organised in a workspace where you can find them, update details and control their status." },
  { icon: BarChart3, title: "Understand activity", description: "See click activity and available performance breakdowns instead of treating every shortened URL as a one-off task." },
  { icon: QrCode, title: "Make sharing easier", description: "Use QR codes and campaign tagging tools alongside short links to support the way you share and distribute URLs." },
];

const principles = [
  { number: "01", title: "Clarity over clutter", description: "Common link tasks should be easy to find and straightforward to complete. The interface should help you work, not compete for your attention." },
  { number: "02", title: "Useful control", description: "A short link is more than a shorter address. You should be able to manage its destination, status and lifespan from your workspace." },
  { number: "03", title: "Insight that matters", description: "Link activity is useful when it helps you understand what is being opened and how your shared URLs are performing." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />
      <main>
        <section className="border-b border-[var(--border)]">
          <div className="shortly-container py-16 sm:py-20 lg:py-24">
            <p className="shortly-eyebrow">About Shortly</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              Links are easy to share.<br className="hidden sm:block" /> Managing them should be too.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 shortly-muted">
              Shortly brings link creation, management and performance information together in one practical workspace. No unnecessary complexity. Just the tools you need to work with your links.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="shortly-button-primary">Get started <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/features" className="shortly-button-secondary">Explore features</Link>
            </div>
          </div>
        </section>

        <section className="shortly-section">
          <div className="shortly-container">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div>
                <p className="shortly-eyebrow">The product</p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">More than a shorter URL.</h2>
              </div>
              <div className="space-y-5 text-base leading-8 shortly-muted">
                <p>A shortened link often keeps working long after the moment it was created. It gets shared in messages, placed in campaigns, printed on materials and passed between people. Being able to manage that link matters.</p>
                <p>Shortly is built around that longer life. Create a link, keep it organised, control its availability and review the activity it receives from your workspace.</p>
                <p>The product is being developed with a straightforward principle: make everyday link management dependable and accessible without turning simple jobs into complicated processes.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--border)] bg-[var(--surface-muted)]">
          <div className="shortly-container py-14 sm:py-16">
            <div className="mb-8 max-w-2xl">
              <p className="shortly-eyebrow">What you can do</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">The essential link workflow.</h2>
              <p className="mt-4 text-base leading-7 shortly-muted">The core tools are designed to work together, from the first shortened URL to the activity that follows.</p>
            </div>
            <div className="grid gap-x-10 md:grid-cols-2">
              {capabilities.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="flex gap-4 border-t border-[var(--border)] py-6">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold tabular-nums shortly-subtle">0{index + 1}</p>
                      <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
                      <p className="mt-2 text-base leading-7 shortly-muted">{item.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="shortly-section">
          <div className="shortly-container">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div>
                <p className="shortly-eyebrow">How we think</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Built around useful work.</h2>
              </div>
              <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
                {principles.map((item) => (
                  <article key={item.number} className="grid gap-2 py-5 sm:grid-cols-[48px_1fr] sm:gap-4">
                    <span className="text-sm font-semibold tabular-nums shortly-subtle">{item.number}</span>
                    <div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="mt-2 text-base leading-7 shortly-muted">{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--border)]">
          <div className="shortly-container py-14 sm:py-16">
            <div className="flex flex-col gap-6 rounded-2xl border border-[var(--border)] p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
              <div>
                <p className="shortly-eyebrow">Made by Nexvius Labs</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">A product built with a long-term view.</h2>
                <p className="mt-3 max-w-2xl text-base leading-7 shortly-muted">Shortly is part of the Nexvius Labs product portfolio. We are continuing to improve the experience as the product grows.</p>
                <a href="https://nexviuslabs.com" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)]">
                  Visit Nexvius Labs <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <Link href="/dashboard" className="shortly-button-primary shrink-0">Open Shortly <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
