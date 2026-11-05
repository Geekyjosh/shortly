"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Copy,
  Globe2,
  Link2,
  MousePointerClick,
  QrCode,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { FormEvent, useEffect, useState, useSyncExternalStore } from "react";
import ShareModal from "@/components/ShareModal";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { useTheme } from "@/components/ThemeProvider";

function subscribeToHost() {
  return () => {};
}

function getHostSnapshot() {
  return window.location.host;
}

function getServerHostSnapshot() {
  return "shortly.app";
}

export default function Home() {
  const { darkMode } = useTheme();

  const host = useSyncExternalStore(
    subscribeToHost,
    getHostSnapshot,
    getServerHostSnapshot,
  );

  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toast, setToast] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!cancelled) {
          setLoggedIn(data.authenticated === true);
        }
      } catch {
        if (!cancelled) {
          setLoggedIn(false);
        }
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setShortUrl("");
    setShowAccountPrompt(false);
    setCopied(false);
    setLoading(true);

    try {
      const response = await fetch("/api/urls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          alias: alias || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data.error || "Something went wrong.";

        setError(message);
        setToast(message);
        return;
      }

      setShortUrl(`${window.location.origin}/${data.shortCode}`);
      setUrl("");
      setAlias("");

      if (!loggedIn && data.guest) {
        setShowAccountPrompt(true);
      }

      setToast("Short link created successfully.");
    } catch {
      setError("Something went wrong. Please try again.");
      setToast("Unable to create short link.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!shortUrl) return;

    try {
      await navigator.clipboard.writeText(shortUrl);

      setCopied(true);
      setToast("Link copied to clipboard.");

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setToast("Unable to copy link.");
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="shortly-rise fixed right-4 top-20 z-[80] flex max-w-sm items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
          }}
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full"
            style={{
              background: "var(--brand-soft)",
              color: "var(--brand)",
            }}
          >
            <Check className="h-3.5 w-3.5" />
          </span>

          {toast}
        </div>
      )}

      <ShareModal
        url={shortUrl}
        open={showShareModal && Boolean(shortUrl)}
        onClose={() => setShowShareModal(false)}
      />

      <main>
        <section className="relative overflow-hidden border-b border-[var(--border)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

            <div className="absolute left-1/2 top-[-320px] h-[620px] w-[920px] -translate-x-1/2 rounded-full bg-blue-500/[0.08] blur-[120px]" />
          </div>

          <div className="shortly-container relative">
            <div className="grid items-center gap-10 pt-6 pb-12 sm:py-12 lg:min-h-[620px] lg:grid-cols-[1.05fr_.95fr] lg:gap-14 lg:py-16">
              <div className="shortly-rise">
                <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-[72px]">
                  Short links that tell you more.
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 shortly-muted">
                  Create cleaner URLs, share them anywhere, and understand what
                  happens after every click.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a href="#shorten" className="shortly-button-primary">
                    Shorten a link
                    <ArrowRight className="h-4 w-4" />
                  </a>

                  <Link href="/features" className="shortly-button-secondary">
                    Explore product
                  </Link>
                </div>

                <div className="mt-10 grid max-w-lg grid-cols-3 gap-5 border-t border-[var(--border)] pt-6">
                  <MiniProof title="Fast" text="Create in seconds" />

                  <MiniProof title="Trackable" text="Know what clicks" />

                  <MiniProof title="Flexible" text="Customize every link" />
                </div>
              </div>

              <div id="shorten" className="relative scroll-mt-28 shortly-rise">
                <div
                  className="rounded-[28px] border p-5 shadow-2xl sm:p-6"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface)",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  <div className="flex items-start justify-between gap-6 border-b border-[var(--border)] pb-5">
                    <div>
                      <p className="text-sm font-semibold">
                        Create a short link
                      </p>

                      <p className="mt-1 text-sm shortly-muted">
                        Paste a destination and optionally choose your own
                        alias.
                      </p>
                    </div>

                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: "var(--brand-soft)",
                        color: "var(--brand)",
                      }}
                    >
                      <Link2 className="h-5 w-5" />
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <div>
                      <label
                        htmlFor="home-url"
                        className="mb-2 block text-sm font-medium"
                      >
                        Destination URL
                      </label>

                      <input
                        id="home-url"
                        type="url"
                        value={url}
                        onChange={(event) => setUrl(event.target.value)}
                        placeholder="https://example.com/your-long-url"
                        autoComplete="url"
                        className="shortly-input"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="home-alias"
                        className="mb-2 block text-sm font-medium"
                      >
                        Custom alias
                        <span className="ml-2 font-normal shortly-subtle">
                          Optional
                        </span>
                      </label>

                      <div
                        className="flex min-h-[46px] overflow-hidden rounded-[var(--radius-sm)] border transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10"
                        style={{
                          borderColor: "var(--border)",
                          background: "var(--surface)",
                        }}
                      >
                        <span className="flex items-center border-r border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm shortly-subtle">
                          {host}/
                        </span>

                        <input
                          id="home-alias"
                          type="text"
                          value={alias}
                          onChange={(event) => setAlias(event.target.value)}
                          placeholder="campaign"
                          autoComplete="off"
                          className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-[var(--subtle)]"
                        />
                      </div>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <button
                      type="submit"
                      disabled={loading}
                      className="shortly-button-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? "Creating link..." : "Create short link"}
                    </button>
                  </form>

                  <p className="mt-4 text-center text-xs shortly-subtle">
                    No account required to get started.
                  </p>
                </div>

                {shortUrl && (
                  <div
                    className="mt-4 rounded-2xl border p-4 shortly-rise"
                    style={{
                      borderColor: "rgba(59, 130, 246, 0.35)",
                      background: "var(--brand-soft)",
                    }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-500">
                      Your short link
                    </p>

                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <a
                        href={shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-0 flex-1 truncate font-semibold text-blue-500 hover:text-blue-400"
                      >
                        {shortUrl}
                      </a>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleCopy}
                          className="shortly-button-secondary"
                        >
                          <Copy className="h-4 w-4" />

                          {copied ? "Copied" : "Copy"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowShareModal(true)}
                          className="shortly-button-primary"
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </button>
                      </div>
                    </div>

                    {showAccountPrompt && !loggedIn && (
                      <div className="mt-4 flex flex-col gap-3 border-t border-blue-500/20 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm shortly-muted">
                          Create an account to keep and manage your links.
                        </p>

                        <Link
                          href="/register"
                          className="text-sm font-semibold text-blue-500 hover:text-blue-400"
                        >
                          Create account →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[var(--border)]">
          <div className="shortly-container">
            <div className="grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
              <TrustItem
                icon={Link2}
                title="Clean links"
                description="Easy to share and remember"
              />

              <TrustItem
                icon={BarChart3}
                title="Useful analytics"
                description="See what happens after the click"
              />

              <TrustItem
                icon={QrCode}
                title="QR ready"
                description="Share online and offline"
              />

              <TrustItem
                icon={ShieldCheck}
                title="Built with control"
                description="Manage status and expiration"
              />
            </div>
          </div>
        </section>

        <section className="shortly-section">
          <div className="shortly-container">
            <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
              <div>
                <p className="shortly-eyebrow">One place for every link</p>

                <h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                  Link management that stays out of your way.
                </h2>

                <p className="mt-5 max-w-xl text-base leading-7 shortly-muted">
                  Create, organize, edit, disable, share and understand your
                  links without turning a simple workflow into a complicated
                  dashboard.
                </p>

                <Link
                  href="/link-management"
                  className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-blue-500 hover:text-blue-400"
                >
                  Explore link management
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <DashboardPreview />
            </div>
          </div>
        </section>

        <section
          className="border-y border-[var(--border)]"
          style={{
            background: "var(--surface-muted)",
          }}
        >
          <div className="shortly-container shortly-section">
            <div className="max-w-2xl">
              <p className="shortly-eyebrow">Built around the click</p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                Shorten once. Learn every time it is opened.
              </h2>

              <p className="mt-5 text-base leading-7 shortly-muted">
                A short URL should do more than redirect. Shortly gives every
                link a useful layer of context so you can see what is working.
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] md:grid-cols-3">
              <Capability
                icon={MousePointerClick}
                number="01"
                title="Track clicks"
                description="Understand how often each link is being opened."
              />

              <Capability
                icon={Globe2}
                number="02"
                title="See geography"
                description="Know which countries are generating traffic."
              />

              <Capability
                icon={TrendingUp}
                number="03"
                title="Spot momentum"
                description="Compare link performance and find your strongest URLs."
              />
            </div>
          </div>
        </section>

        <section className="shortly-section">
          <div className="shortly-container">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <AnalyticsPreview />

              <div className="lg:pl-8">
                <p className="shortly-eyebrow">Analytics without noise</p>

                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                  Know which links deserve your attention.
                </h2>

                <p className="mt-5 max-w-xl text-base leading-7 shortly-muted">
                  See click activity, top-performing URLs, traffic sources and
                  geographic patterns without digging through a complicated
                  reporting suite.
                </p>

                <div className="mt-8 space-y-4">
                  <FeatureLine text="Per-link click counts and activity" />

                  <FeatureLine text="Country and referrer visibility" />

                  <FeatureLine text="A dashboard designed for quick decisions" />
                </div>

                <Link
                  href="/link-analytics"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-blue-500 hover:text-blue-400"
                >
                  Explore analytics
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          className="border-y border-[var(--border)]"
          style={{
            background: "var(--surface-muted)",
          }}
        >
          <div className="shortly-container shortly-section">
            <div className="text-center">
              <p className="shortly-eyebrow">Made for real workflows</p>

              <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                Useful whether you share one link or hundreds.
              </h2>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              <UseCase
                label="Marketing"
                title="Campaign links that are easier to share and measure."
                description="Create memorable URLs for campaigns, channels and launches while keeping performance visible."
                href="/solutions/marketing"
              />

              <UseCase
                label="Creators"
                title="Clean links for bios, posts and communities."
                description="Give your audience simple links without losing visibility into what gets attention."
                href="/solutions/creators"
              />

              <UseCase
                label="Developers"
                title="A link layer that fits modern products."
                description="Manage redirects and link behavior without building the whole system yourself."
                href="/solutions/developers"
              />
            </div>
          </div>
        </section>

        <section className="shortly-section">
          <div className="shortly-container">
            <div
              className="relative overflow-hidden rounded-[30px] border px-6 py-14 text-center sm:px-12 sm:py-16"
              style={{
                borderColor: "rgba(59, 130, 246, 0.3)",
                background: darkMode
                  ? "linear-gradient(135deg, #0f172a 0%, #0b1736 55%, #102554 100%)"
                  : "linear-gradient(135deg, #eff6ff 0%, #ffffff 60%, #dbeafe 100%)",
              }}
            >
              <div className="pointer-events-none absolute right-[-120px] top-[-180px] h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]" />

              <div className="relative mx-auto max-w-2xl">
                <div
                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    background: "var(--brand-soft)",
                    color: "var(--brand)",
                  }}
                >
                  <Sparkles className="h-5 w-5" />
                </div>

                <h2 className="mt-6 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                  A better home for your links.
                </h2>

                <p className="mx-auto mt-5 max-w-xl text-base leading-7 shortly-muted">
                  Create your first short link now, or open an account to manage
                  everything from one place.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <a href="#shorten" className="shortly-button-primary">
                    Create a short link
                  </a>

                  <Link href="/register" className="shortly-button-secondary">
                    Create an account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function MiniProof({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>

      <p className="mt-1 text-xs shortly-subtle">{text}</p>
    </div>
  );
}

function TrustItem({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Link2;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{
          background: "var(--brand-soft)",
          color: "var(--brand)",
        }}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <p className="text-sm font-semibold">{title}</p>

        <p className="mt-1 text-xs shortly-subtle">{description}</p>
      </div>
    </div>
  );
}

function DashboardPreview() {
  const links = [
    ["shortly.app/launch", "nexviuslabs.com/product-launch", "1,842"],
    ["shortly.app/portfolio", "nexviuslabs.com/work", "926"],
    ["shortly.app/newsletter", "newsletter.example.com/october", "641"],
  ];

  return (
    <div
      className="overflow-hidden rounded-2xl border shadow-xl shortly-hover-lift"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
      }}
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
        <div>
          <p className="text-sm font-semibold">Your links</p>

          <p className="mt-0.5 text-xs shortly-subtle">Recent links</p>
        </div>

        <span className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white">
          + New link
        </span>
      </div>

      <div className="grid grid-cols-3 gap-px border-b border-[var(--border)] bg-[var(--border)]">
        {[
          ["Links", "24"],
          ["Clicks", "4.8k"],
          ["Active", "22"],
        ].map(([label, value]) => (
          <div key={label} className="bg-[var(--surface)] px-4 py-4">
            <p className="text-xs shortly-subtle">{label}</p>

            <p className="mt-1 text-lg font-semibold">{value}</p>
          </div>
        ))}
      </div>

      {links.map(([short, destination, clicks], index) => (
        <div
          key={short}
          className={`grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center ${
            index !== links.length - 1 ? "border-b border-[var(--border)]" : ""
          }`}
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-blue-500">
              {short}
            </p>

            <p className="mt-1 truncate text-xs shortly-subtle">
              {destination}
            </p>
          </div>

          <p className="text-xs font-medium shortly-muted">{clicks} clicks</p>

          <span className="w-fit rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-500">
            Active
          </span>
        </div>
      ))}
    </div>
  );
}

function Capability({
  icon: Icon,
  number,
  title,
  description,
}: {
  icon: typeof MousePointerClick;
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[var(--surface)] p-7 sm:p-8">
      <div className="flex items-center justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            background: "var(--brand-soft)",
            color: "var(--brand)",
          }}
        >
          <Icon className="h-5 w-5" />
        </div>

        <span className="font-mono text-xs shortly-subtle">{number}</span>
      </div>

      <h3 className="mt-8 text-lg font-semibold">{title}</h3>

      <p className="mt-3 text-sm leading-6 shortly-muted">{description}</p>
    </div>
  );
}

function AnalyticsPreview() {
  const bars = [26, 38, 30, 55, 46, 67, 51, 79, 62, 88, 72, 96];

  return (
    <div
      className="rounded-2xl border p-5 shadow-xl shortly-hover-lift sm:p-6"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">Click activity</p>

          <p className="mt-1 text-xs shortly-subtle">Last 30 days</p>
        </div>

        <span className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs shortly-muted">
          30 days
        </span>
      </div>

      <div className="mt-6 flex items-end gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 pb-4 pt-8">
        {bars.map((height, index) => (
          <div
            key={`${height}-${index}`}
            className="flex h-40 flex-1 items-end"
          >
            <div
              className="w-full rounded-t-sm bg-blue-500/80"
              style={{
                height: `${height}%`,
              }}
            />
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          ["Clicks", "4,821"],
          ["Countries", "18"],
          ["Top source", "Direct"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-[var(--border)] p-3"
          >
            <p className="text-[11px] shortly-subtle">{label}</p>

            <p className="mt-1 text-sm font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{
          background: "var(--brand-soft)",
          color: "var(--brand)",
        }}
      >
        <Check className="h-3 w-3" />
      </span>

      <p className="text-sm shortly-muted">{text}</p>
    </div>
  );
}

function UseCase({
  label,
  title,
  description,
  href,
}: {
  label: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group shortly-card-flat p-7 shortly-hover-lift sm:p-8"
    >
      <p className="shortly-eyebrow">{label}</p>

      <h3 className="mt-7 text-2xl font-semibold tracking-[-0.025em]">
        {title}
      </h3>

      <p className="mt-4 text-sm leading-7 shortly-muted">{description}</p>

      <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-blue-500">
        Learn more
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
