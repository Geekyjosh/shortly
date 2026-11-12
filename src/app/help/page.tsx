import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CircleHelp,
  Link2,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Shortly Help Center",
  description:
    "Find practical guidance for creating short links, managing URLs, understanding click analytics and sharing links with Shortly.",
  alternates: { canonical: "/help" },
  openGraph: {
    type: "website",
    title: "Shortly Help Center | Shortly",
    description:
      "Practical guidance for creating, managing and understanding your short links.",
    url: "/help",
    siteName: "Shortly",
  },
  robots: { index: true, follow: true },
};

const topics = [
  {
    number: "01",
    icon: Link2,
    title: "Create a short link",
    description:
      "Turn a long destination URL into a shorter, shareable link. Add a custom alias when you want a more recognisable address.",
    action: "Open link creator",
    href: "/dashboard/create",
  },
  {
    number: "02",
    icon: ShieldCheck,
    title: "Manage your links",
    description:
      "Find links in your workspace, update their details, control whether they are active and manage expiration settings.",
    action: "Go to your links",
    href: "/dashboard",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Read your analytics",
    description:
      "Review click activity and available breakdowns to understand how your links are performing over time.",
    action: "View analytics",
    href: "/analytics",
  },
  {
    number: "04",
    icon: QrCode,
    title: "Share and organise",
    description:
      "Use the available sharing tools and UTM builder to prepare links for the channels and campaigns you manage.",
    action: "Open UTM builder",
    href: "/dashboard/utm",
  },
];

const quickAnswers = [
  {
    question: "Do I need an account to shorten a URL?",
    answer:
      "You can create a limited number of links as a guest. Create an account to use your personal workspace and manage your links in one place.",
  },
  {
    question: "Can I choose my own short link?",
    answer:
      "Yes. When creating a link, you can provide a custom alias if the address you want is available.",
  },
  {
    question: "Can I stop a short link from working?",
    answer:
      "Links in your workspace include active and inactive controls. Open your links dashboard to manage a link's status.",
  },
  {
    question: "Where can I see how many clicks a link receives?",
    answer:
      "Open Analytics to review click activity, choose a reporting period and explore the available link and audience breakdowns.",
  },
  {
    question: "Can a link expire?",
    answer:
      "Yes. Link creation includes expiration options. You can choose a duration or create a link without an expiration date.",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      <main>
        <section className="border-b border-[var(--border)]">
          <div className="shortly-container py-16 sm:py-20 lg:py-24">
            <div className="max-w-3xl">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
              >
                <CircleHelp className="h-5 w-5" />
              </div>
              <p className="mt-6 shortly-eyebrow">Shortly support</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                Help when you need it.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 shortly-muted">
                Straightforward answers and shortcuts to the tools you use to
                create, manage and understand your links.
              </p>
            </div>
          </div>
        </section>

        <section className="shortly-section">
          <div className="shortly-container">
            <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="shortly-eyebrow">Browse by task</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  What are you trying to do?
                </h2>
              </div>
              <p className="text-base shortly-muted">
                Choose a workflow to open the relevant tool.
              </p>
            </div>

            <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {topics.map((topic) => {
                const Icon = topic.icon;
                return (
                  <article
                    key={topic.number}
                    className="grid gap-4 py-6 sm:grid-cols-[52px_1fr_auto] sm:items-center sm:gap-6"
                  >
                    <div className="flex items-center gap-3 sm:block">
                      <span className="text-xs font-semibold tabular-nums shortly-subtle">
                        {topic.number}
                      </span>
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{
                          background: "var(--brand-soft)",
                          color: "var(--brand)",
                        }}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{topic.title}</h3>
                      <p className="mt-1.5 max-w-2xl text-base leading-7 shortly-muted">
                        {topic.description}
                      </p>
                    </div>
                    <Link
                      href={topic.href}
                      className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[var(--brand)] transition hover:gap-3"
                    >
                      {topic.action}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--border)] bg-[var(--surface-muted)]">
          <div className="shortly-container py-14 sm:py-16">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
              <div>
                <p className="shortly-eyebrow">Quick answers</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
                  Common questions.
                </h2>
                <p className="mt-4 text-base leading-7 shortly-muted">
                  A few useful details about how Shortly works today.
                </p>
                <Link
                  href="/register"
                  className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)]"
                >
                  Create an account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
                {quickAnswers.map((item, index) => (
                  <details key={item.question} className="group py-5" open={index === 0}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold marker:hidden">
                      <span>{item.question}</span>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-lg font-normal text-[var(--brand)] transition group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="max-w-2xl pt-3 pr-10 text-base leading-7 shortly-muted">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="shortly-section">
          <div className="shortly-container">
            <div className="flex flex-col gap-6 rounded-2xl border border-[var(--border)] p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
                >
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    Ready to put it into practice?
                  </h2>
                  <p className="mt-2 max-w-xl text-base leading-7 shortly-muted">
                    Head to your workspace to create a link or review the ones
                    you have already shared.
                  </p>
                </div>
              </div>
              <Link href="/dashboard" className="shortly-button-primary shrink-0">
                Open workspace
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
