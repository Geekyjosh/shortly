"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Globe2,
  Layers3,
  Link2,
  MousePointerClick,
  QrCode,
  ShieldCheck,
  Sparkles,
  Tags,
  TimerReset,
  type LucideIcon,
} from "lucide-react";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

export type MarketingIcon =
  | "link"
  | "analytics"
  | "qr"
  | "shield"
  | "globe"
  | "click"
  | "layers"
  | "tags"
  | "timer"
  | "sparkles";

export type MarketingFeature = {
  icon: MarketingIcon;
  title: string;
  description: string;
};

export type MarketingStat = {
  value: string;
  label: string;
};

export type MarketingFaq = {
  question: string;
  answer: string;
};

type MarketingPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  stats?: MarketingStat[];
  features: MarketingFeature[];
  faqs?: MarketingFaq[];
  sectionEyebrow?: string;
  sectionTitle: string;
  sectionDescription: string;
  closingTitle: string;
  closingDescription: string;
};

const iconMap: Record<MarketingIcon, LucideIcon> = {
  link: Link2,
  analytics: BarChart3,
  qr: QrCode,
  shield: ShieldCheck,
  globe: Globe2,
  click: MousePointerClick,
  layers: Layers3,
  tags: Tags,
  timer: TimerReset,
  sparkles: Sparkles,
};

export default function MarketingPage({
  eyebrow,
  title,
  description,
  primaryCta = {
    label: "Create a short link",
    href: "/#shorten",
  },
  secondaryCta = {
    label: "Create account",
    href: "/register",
  },
  stats = [],
  features,
  faqs = [],
  sectionEyebrow = "What you get",
  sectionTitle,
  sectionDescription,
  closingTitle,
  closingDescription,
}: MarketingPageProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden border-b border-[var(--border)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

          <div className="shortly-container py-20 sm:py-24 lg:py-28">
            <div className="max-w-4xl shortly-rise">
              <p className="shortly-eyebrow">{eyebrow}</p>

              <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[68px]">
                {title}
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 shortly-muted">
                {description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={primaryCta.href} className="shortly-button-primary">
                  {primaryCta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href={secondaryCta.href}
                  className="shortly-button-secondary"
                >
                  {secondaryCta.label}
                </Link>
              </div>
            </div>

            {stats.length > 0 && (
              <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-[var(--surface)] px-6 py-6"
                  >
                    <p className="text-3xl font-semibold tracking-[-0.035em]">
                      {stat.value}
                    </p>

                    <p className="mt-2 text-sm shortly-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="shortly-section">
          <div className="shortly-container">
            <div className="max-w-2xl">
              <p className="shortly-eyebrow">{sectionEyebrow}</p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                {sectionTitle}
              </h2>

              <p className="mt-5 text-base leading-7 shortly-muted">
                {sectionDescription}
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = iconMap[feature.icon];

                return (
                  <div
                    key={feature.title}
                    className="bg-[var(--surface)] p-7 sm:p-8"
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

                    <h3 className="mt-7 text-lg font-semibold">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 shortly-muted">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section
          className="border-y border-[var(--border)]"
          style={{
            background: "var(--surface-muted)",
          }}
        >
          <div className="shortly-container py-16 sm:py-20">
            <div className="grid gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center">
              <div>
                <p className="shortly-eyebrow">Designed to stay simple</p>

                <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.035em]">
                  Useful controls without a complicated workflow.
                </h2>

                <p className="mt-5 max-w-2xl text-base leading-7 shortly-muted">
                  Shortly keeps the important actions visible and predictable,
                  so creating, sharing and managing links feels fast whether you
                  are working with one URL or many.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  "Clear defaults with optional advanced controls",
                  "Consistent link management across the product",
                  "Responsive layouts designed for desktop and mobile",
                  "Focused analytics without unnecessary reporting noise",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                  >
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
          </div>
        </section>

        {faqs.length > 0 && (
          <section className="border-y border-[var(--border)]">
            <div className="shortly-container shortly-section">
              <div className="max-w-2xl">
                <p className="shortly-eyebrow">Frequently asked questions</p>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                  Common questions
                </h2>
              </div>

              <div className="mt-8 grid gap-x-12 md:grid-cols-2">
                {faqs.map((faq) => (
                  <article
                    key={faq.question}
                    className="border-b border-[var(--border)] py-6"
                  >
                    <h3 className="text-lg font-semibold tracking-[-0.02em]">
                      {faq.question}
                    </h3>
                    <p className="mt-3 text-sm leading-7 shortly-muted">
                      {faq.answer}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="shortly-section">
          <div className="shortly-container">
            <div
              className="rounded-[30px] border px-6 py-14 text-center sm:px-12 sm:py-16"
              style={{
                borderColor: "rgba(59, 130, 246, 0.3)",
                background: "var(--surface)",
              }}
            >
              <h2 className="mx-auto max-w-2xl text-4xl font-semibold tracking-[-0.035em]">
                {closingTitle}
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-base leading-7 shortly-muted">
                {closingDescription}
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/#shorten" className="shortly-button-primary">
                  Create a short link
                </Link>

                <Link href="/register" className="shortly-button-secondary">
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
