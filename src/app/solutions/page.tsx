import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Shortening Solutions for Teams & Creators",
  description: "Explore how marketers, creators and developers use Shortly to create clean short links and understand link performance.",
  alternates: {
    canonical: "/solutions",
  },
  openGraph: {
    type: "website",
    title: "URL Shortening Solutions for Teams & Creators | Shortly",
    description: "Explore how marketers, creators and developers use Shortly to create clean short links and understand link performance.",
    url: "/solutions",
    siteName: "Shortly",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import Link from "next/link";
import { ArrowRight, Code2, Megaphone, UserRound } from "lucide-react";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

const solutions = [
  {
    icon: Megaphone,
    label: "Marketing",
    title: "Cleaner campaign links with performance visibility.",
    description:
      "Create memorable campaign URLs, share them across channels and understand which links are attracting attention.",
    href: "/solutions/marketing",
  },
  {
    icon: UserRound,
    label: "Creators",
    title: "Short links that fit the places you already share.",
    description:
      "Use cleaner links across bios, posts, newsletters and communities without losing visibility after you publish.",
    href: "/solutions/creators",
  },
  {
    icon: Code2,
    label: "Developers",
    title: "A practical link layer for modern products.",
    description:
      "Use Shortly as the foundation for redirects and link workflows while keeping analytics and management in one place.",
    href: "/solutions/developers",
  },
];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      <main>
        <section className="border-b border-[var(--border)]">
          <div className="shortly-container py-20 sm:py-24 lg:py-28">
            <p className="shortly-eyebrow">Solutions</p>

            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[68px]">
              Short links for the way you actually work.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 shortly-muted">
              Shortly gives different teams and individuals the same simple
              foundation: clean links, useful controls and visibility after the
              click.
            </p>
          </div>
        </section>

        <section className="shortly-section">
          <div className="shortly-container">
            <div className="grid gap-5 lg:grid-cols-3">
              {solutions.map((solution) => {
                const Icon = solution.icon;

                return (
                  <Link
                    key={solution.label}
                    href={solution.href}
                    className="group shortly-card-flat p-7 shortly-hover-lift sm:p-8"
                  >
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{
                        background: "var(--brand-soft)",
                        color: "var(--brand)",
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <p className="mt-8 shortly-eyebrow">{solution.label}</p>

                    <h2 className="mt-4 text-2xl font-semibold tracking-[-0.025em]">
                      {solution.title}
                    </h2>

                    <p className="mt-4 text-sm leading-7 shortly-muted">
                      {solution.description}
                    </p>

                    <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-blue-500">
                      Explore solution
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
