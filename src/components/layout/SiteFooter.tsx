"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const footerGroups = [
  {
    title: "Product",
    links: [
      { label: "URL Shortener", href: "/features" },
      { label: "Link Management", href: "/link-management" },
      { label: "Link Analytics", href: "/link-analytics" },
      { label: "QR Code Generator", href: "/qr-code-generator" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Solutions", href: "/solutions" },
      { label: "Help centre", href: "/help" },
      { label: "Pricing", href: "/pricing" },
      { label: "Developers", href: "/solutions/developers" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Shortly", href: "/about" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
    ],
  },
];

export default function SiteFooter() {
  const { darkMode } = useTheme();

  return (
    <footer
      className="border-t"
      style={{
        borderColor: "var(--border)",
        background: darkMode ? "#071326" : "#f3f6fb",
      }}
    >
      <div className="shortly-container">
        <div className="grid gap-9 py-10 sm:py-12 lg:grid-cols-[1.05fr_2fr] lg:gap-16 lg:py-14">
          <div className="flex flex-col items-start">
            <Link href="/" className="inline-flex transition-opacity hover:opacity-75" aria-label="Shortly home">
              <Image src="/logo.svg" alt="Shortly" width={118} height={38} className="h-9 w-auto" />
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 shortly-muted">
              Short links built for people who care what happens after the click.
            </p>

            <Link
              href="/#shorten"
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Create a short link <ArrowRight className="h-4 w-4" />
            </Link>

            <p className="mt-6 text-xs shortly-subtle">A link workflow that stays clear from creation to click.</p>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 sm:gap-8">
            {footerGroups.map((group) => (
              <div key={group.title} className="min-w-0">
                <h3 className="text-xs font-bold uppercase tracking-[0.12em]">{group.title}</h3>
                <div className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group flex w-fit max-w-full items-center gap-1 text-sm shortly-muted transition hover:text-blue-500"
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight className="h-3 w-3 shrink-0 opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t py-5 text-xs shortly-subtle sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "var(--border)" }}>
          <p>© {new Date().getFullYear()} Shortly. A Nexvius Labs product.</p>
          <p>Built for clearer links and better decisions.</p>
        </div>
      </div>
    </footer>
  );
}
