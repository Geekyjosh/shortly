"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Check,
  Clock3,
  Copy,
  Link2,
  Plus,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { FormEvent, useEffect, useState, useSyncExternalStore } from "react";
import ShareModal from "@/components/ShareModal";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

function subscribeToLocation() {
  return () => {};
}

function getHostSnapshot() {
  return window.location.host;
}

function getServerHostSnapshot() {
  return "shortly.app";
}

function getOriginSnapshot() {
  return window.location.origin;
}

function getServerOriginSnapshot() {
  return "https://shortly.app";
}

export default function CreateLinkPage() {
  const host = useSyncExternalStore(
    subscribeToLocation,
    getHostSnapshot,
    getServerHostSnapshot,
  );

  const origin = useSyncExternalStore(
    subscribeToLocation,
    getOriginSnapshot,
    getServerOriginSnapshot,
  );

  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shortUrl = shortCode ? `${origin}/${shortCode}` : "";

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
    setShortCode("");
    setShareOpen(false);
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
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data.error || "Unable to create short link.";

        setError(message);
        setToast(message);
        return;
      }

      setShortCode(data.shortCode);
      setUrl("");
      setAlias("");
      setExpiresAt("");
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
          className="shortly-rise fixed right-4 top-20 z-[90] flex max-w-sm items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl"
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
        open={shareOpen && Boolean(shortUrl)}
        onClose={() => setShareOpen(false)}
      />

      <main>
        <section className="border-b border-[var(--border)]">
          <div className="shortly-container py-10 sm:py-12">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium shortly-muted transition hover:text-[var(--foreground)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to links
            </Link>

            <div className="mt-7 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="shortly-eyebrow">Workspace</p>

                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                  Create a new link
                </h1>

                <p className="mt-3 max-w-2xl text-base shortly-muted">
                  Add a destination, choose an optional custom alias, and decide
                  whether the link should expire.
                </p>
              </div>

              <Link
                href="/analytics"
                className="shortly-button-secondary w-fit"
              >
                <BarChart3 className="h-4 w-4" />
                View analytics
              </Link>
            </div>

            <nav className="mt-9 flex gap-1 overflow-x-auto border-b border-[var(--border)]">
              <Link
                href="/dashboard"
                className="whitespace-nowrap px-4 pb-3 pt-2 text-sm font-medium shortly-muted hover:text-[var(--foreground)]"
              >
                Links
              </Link>
              <Link
                href="/dashboard/bulk"
                className="whitespace-nowrap px-4 pb-3 pt-2 text-sm font-medium shortly-muted hover:text-[var(--foreground)]"
              >
                Bulk
              </Link>
              <Link
                href="/dashboard/utm"
                className="whitespace-nowrap px-4 pb-3 pt-2 text-sm font-medium shortly-muted hover:text-[var(--foreground)]"
              >
                UTM Builder
              </Link>
              <Link
                href="/analytics"
                className="whitespace-nowrap px-4 pb-3 pt-2 text-sm font-medium shortly-muted hover:text-[var(--foreground)]"
              >
                Analytics
              </Link>

              <Link
                href="/dashboard/create"
                className="relative whitespace-nowrap px-4 pb-3 pt-2 text-sm font-semibold"
              >
                Create
                <span className="absolute inset-x-4 bottom-[-1px] h-0.5 bg-blue-500" />
              </Link>
            </nav>
          </div>
        </section>

        <section className="shortly-container py-8 sm:py-10">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
            <section
              className="overflow-hidden rounded-2xl border"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
              }}
            >
              <div className="border-b border-[var(--border)] p-5 sm:p-6">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <h2 className="text-lg font-semibold">Link details</h2>

                    <p className="mt-1 text-sm shortly-muted">
                      Only the destination URL is required.
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
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
                <div>
                  <label
                    htmlFor="url"
                    className="mb-2 block text-sm font-medium"
                  >
                    Destination URL
                  </label>

                  <input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://example.com/your-long-url"
                    autoComplete="url"
                    className="shortly-input"
                    required
                  />

                  <p className="mt-2 text-xs shortly-subtle">
                    This is where visitors will be redirected.
                  </p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label htmlFor="alias" className="text-sm font-medium">
                      Custom alias
                    </label>

                    <span className="text-xs shortly-subtle">Optional</span>
                  </div>

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
                      id="alias"
                      type="text"
                      value={alias}
                      onChange={(event) => setAlias(event.target.value)}
                      placeholder="launch"
                      autoComplete="off"
                      className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-[var(--subtle)]"
                    />
                  </div>

                  <p className="mt-2 text-xs shortly-subtle">
                    Use letters, numbers, hyphens or underscores.
                  </p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label htmlFor="expiresAt" className="text-sm font-medium">
                      Expiration
                    </label>

                    <span className="text-xs shortly-subtle">Optional</span>
                  </div>

                  <input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(event) => setExpiresAt(event.target.value)}
                    className="shortly-input"
                  />

                  <p className="mt-2 text-xs shortly-subtle">
                    Leave this empty if the link should remain active
                    indefinitely.
                  </p>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                    {error}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">
                  <Link href="/dashboard" className="shortly-button-secondary">
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={loading}
                    className="shortly-button-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />

                    {loading ? "Creating..." : "Create short link"}
                  </button>
                </div>
              </form>
            </section>

            <aside className="space-y-5">
              {shortUrl ? (
                <div
                  className="shortly-rise rounded-2xl border p-5 sm:p-6"
                  style={{
                    borderColor: "rgba(59, 130, 246, 0.35)",
                    background: "var(--surface)",
                  }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background: "var(--brand-soft)",
                      color: "var(--brand)",
                    }}
                  >
                    <Check className="h-5 w-5" />
                  </div>

                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-blue-500">
                    Link created
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    Your short link is ready.
                  </h2>

                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block break-all text-sm font-semibold text-blue-500 hover:text-blue-400"
                  >
                    {shortUrl}
                  </a>

                  <div className="mt-6 grid gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="shortly-button-primary w-full"
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? "Copied" : "Copy link"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShareOpen(true)}
                      className="shortly-button-secondary w-full"
                    >
                      <Share2 className="h-4 w-4" />
                      Share link
                    </button>

                    <Link
                      href="/dashboard"
                      className="shortly-button-secondary w-full"
                    >
                      View all links
                    </Link>
                  </div>
                </div>
              ) : (
                <div
                  className="rounded-2xl border p-5 sm:p-6"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface)",
                  }}
                >
                  <p className="text-sm font-semibold">Before you create</p>

                  <div className="mt-5 space-y-5">
                    <InfoItem
                      icon={Link2}
                      title="Destination"
                      description="Paste the full page you want visitors to reach."
                    />

                    <InfoItem
                      icon={Sparkles}
                      title="Alias"
                      description="Use a memorable name when the link will be shared publicly."
                    />

                    <InfoItem
                      icon={Clock3}
                      title="Expiration"
                      description="Useful for temporary campaigns, events or time-sensitive links."
                    />

                    <InfoItem
                      icon={ShieldCheck}
                      title="Control"
                      description="You can edit, disable or delete the link later from your dashboard."
                    />
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
                <p className="text-sm font-semibold">Need a simple link?</p>

                <p className="mt-2 text-sm leading-6 shortly-muted">
                  Leave the alias and expiration empty. Shortly will generate
                  the short code automatically and keep the link active.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function InfoItem({
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
        <p className="text-sm font-medium">{title}</p>

        <p className="mt-1 text-xs leading-5 shortly-subtle">{description}</p>
      </div>
    </div>
  );
}
