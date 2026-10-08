"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

const footerGroups = [
  {
    title: "Product",
    links: [
      {
        label: "URL Shortener",
        href: "/features",
      },
      {
        label: "Link Management",
        href: "/link-management",
      },
      {
        label: "Analytics",
        href: "/link-analytics",
      },
      {
        label: "QR Codes",
        href: "/qr-code-generator",
      },
    ],
  },
  {
    title: "Resources",
    links: [
      {
        label: "Help",
        href: "/help",
      },
      {
        label: "Pricing",
        href: "/pricing",
      },
      {
        label: "Developers",
        href: "/solutions/developers",
      },
    ],
  },
  {
    title: "Company",
    links: [
      {
        label: "About",
        href: "/about",
      },
      {
        label: "Privacy",
        href: "/privacy",
      },
      {
        label: "Terms",
        href: "/terms",
      },
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
        background: darkMode ? "#020617" : "#ffffff",
      }}
    >
      <div className="shortly-container">
        <div className="grid gap-12 py-14 md:grid-cols-[1.4fr_2fr] lg:py-16">
          <div>
            <Link
              href="/"
              className="inline-flex transition-opacity hover:opacity-80"
            >
              <Image
                src="/logo.svg"
                alt="Shortly"
                width={118}
                height={38}
                className="h-9 w-auto"
              />
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 shortly-muted">
              Short links built for people who care what happens after the
              click.
            </p>

            <p className="mt-5 max-w-sm text-sm leading-6 shortly-subtle">
              Create, manage, share and understand your links from one place.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold">{group.title}</h3>

                <div className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="block text-sm shortly-muted transition hover:text-[var(--foreground)]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="flex flex-col gap-3 border-t py-6 text-xs shortly-subtle sm:flex-row sm:items-center sm:justify-between"
          style={{
            borderColor: "var(--border)",
          }}
        >
          <p>© {new Date().getFullYear()} Shortly. A Nexvius Labs product.</p>

          <p>Built for clearer links and better decisions.</p>
        </div>
      </div>
    </footer>
  );
}
