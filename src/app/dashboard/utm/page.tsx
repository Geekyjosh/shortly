"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Copy,
  Link2,
  Plus,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { FormEvent, useMemo, useState, useSyncExternalStore } from "react";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

function subscribeToLocation() {
  return () => {};
}

function getOriginSnapshot() {
  return window.location.origin;
}

function getServerOriginSnapshot() {
  return "https://shortly.app";
}

export default function UtmBuilderPage() {
  const origin = useSyncExternalStore(
    subscribeToLocation,
    getOriginSnapshot,
    getServerOriginSnapshot,
  );

  const [destination, setDestination] = useState("");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [term, setTerm] = useState("");
  const [content, setContent] = useState("");

  const [shortUrl, setShortUrl] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState<"utm" | "short" | "">("");
  const [loading, setLoading] = useState(false);

  const generatedUrl = useMemo(() => {
    if (!destination.trim()) {
      return "";
    }

    try {
      const url = new URL(destination.trim());

      if (source.trim()) {
        url.searchParams.set("utm_source", source.trim());
      }

      if (medium.trim()) {
        url.searchParams.set("utm_medium", medium.trim());
      }

      if (campaign.trim()) {
        url.searchParams.set("utm_campaign", campaign.trim());
      }

      if (term.trim()) {
        url.searchParams.set("utm_term", term.trim());
      }

      if (content.trim()) {
        url.searchParams.set("utm_content", content.trim());
      }

      return url.toString();
    } catch {
      return "";
    }
  }, [destination, source, medium, campaign, term, content]);

  function isValidDestination() {
    try {
      const url = new URL(destination.trim());

      return ["http:", "https:"].includes(url.protocol);
    } catch {
      return false;
    }
  }

  async function copyText(value: string, type: "utm" | "short") {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);

      setCopied(type);

      window.setTimeout(() => {
        setCopied("");
      }, 1800);
    } catch {
      setMessage("Unable to copy link.");
    }
  }

  async function shortenTrackedUrl(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setShortUrl("");

    if (!destination.trim()) {
      setMessage("Destination URL is required.");
      return;
    }

    if (!isValidDestination()) {
      setMessage("Please enter a valid HTTP or HTTPS URL.");
      return;
    }

    if (!source.trim()) {
      setMessage("Campaign source is required.");
      return;
    }

    if (!medium.trim()) {
      setMessage("Campaign medium is required.");
      return;
    }

    if (!campaign.trim()) {
      setMessage("Campaign name is required.");
      return;
    }

    if (!generatedUrl) {
      setMessage("Unable to generate the tracking URL.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/urls", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          url: generatedUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to shorten the tracking URL.");
      }

      setShortUrl(`${origin}/${data.shortCode}`);

      setMessage("Tracking URL created and shortened successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to shorten the tracking URL.",
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setDestination("");
    setSource("");
    setMedium("");
    setCampaign("");
    setTerm("");
    setContent("");
    setShortUrl("");
    setMessage("");
    setCopied("");
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      <main>
        <section className="border-b border-[var(--border)]">
          <div className="shortly-container py-10 sm:py-12">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="shortly-eyebrow">Workspace</p>

                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                  UTM builder
                </h1>

                <p className="mt-3 max-w-2xl text-base shortly-muted">
                  Build campaign tracking URLs and turn them into clean Shortly
                  links.
                </p>
              </div>

              <Link
                href="/dashboard/create"
                className="shortly-button-secondary w-fit"
              >
                <Plus className="h-4 w-4" />
                Create link
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
                href="/analytics"
                className="whitespace-nowrap px-4 pb-3 pt-2 text-sm font-medium shortly-muted hover:text-[var(--foreground)]"
              >
                Analytics
              </Link>

              <Link
                href="/dashboard/create"
                className="whitespace-nowrap px-4 pb-3 pt-2 text-sm font-medium shortly-muted hover:text-[var(--foreground)]"
              >
                Create
              </Link>

              <Link
                href="/dashboard/bulk"
                className="whitespace-nowrap px-4 pb-3 pt-2 text-sm font-medium shortly-muted hover:text-[var(--foreground)]"
              >
                Bulk
              </Link>

              <Link
                href="/dashboard/utm"
                className="relative whitespace-nowrap px-4 pb-3 pt-2 text-sm font-semibold"
              >
                UTM Builder
                <span className="absolute inset-x-4 bottom-[-1px] h-0.5 bg-blue-500" />
              </Link>
            </nav>
          </div>
        </section>

        <section className="shortly-container py-8 sm:py-10">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
            <form
              onSubmit={shortenTrackedUrl}
              className="overflow-hidden rounded-2xl border"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
              }}
            >
              <div className="border-b border-[var(--border)] p-5 sm:p-6">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <h2 className="text-lg font-semibold">Campaign details</h2>

                    <p className="mt-1 text-sm shortly-muted">
                      Add UTM parameters to understand where campaign traffic
                      comes from.
                    </p>
                  </div>

                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: "var(--brand-soft)",
                      color: "var(--brand)",
                    }}
                  >
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-5 sm:p-6">
                <Field
                  label="Destination URL"
                  required
                  helper="The page you want visitors to reach."
                >
                  <input
                    type="url"
                    value={destination}
                    onChange={(event) => {
                      setDestination(event.target.value);
                      setShortUrl("");
                    }}
                    placeholder="https://example.com/product"
                    className="shortly-input"
                  />
                </Field>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Campaign source"
                    required
                    helper="Where the traffic comes from."
                  >
                    <input
                      type="text"
                      value={source}
                      onChange={(event) => {
                        setSource(event.target.value);
                        setShortUrl("");
                      }}
                      placeholder="linkedin"
                      className="shortly-input"
                    />
                  </Field>

                  <Field
                    label="Campaign medium"
                    required
                    helper="The marketing channel."
                  >
                    <input
                      type="text"
                      value={medium}
                      onChange={(event) => {
                        setMedium(event.target.value);
                        setShortUrl("");
                      }}
                      placeholder="social"
                      className="shortly-input"
                    />
                  </Field>
                </div>

                <Field
                  label="Campaign name"
                  required
                  helper="A clear name for this campaign."
                >
                  <input
                    type="text"
                    value={campaign}
                    onChange={(event) => {
                      setCampaign(event.target.value);
                      setShortUrl("");
                    }}
                    placeholder="october_launch"
                    className="shortly-input"
                  />
                </Field>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Campaign term"
                    helper="Optional keyword or audience identifier."
                  >
                    <input
                      type="text"
                      value={term}
                      onChange={(event) => {
                        setTerm(event.target.value);
                        setShortUrl("");
                      }}
                      placeholder="developers"
                      className="shortly-input"
                    />
                  </Field>

                  <Field
                    label="Campaign content"
                    helper="Optional creative or variant identifier."
                  >
                    <input
                      type="text"
                      value={content}
                      onChange={(event) => {
                        setContent(event.target.value);
                        setShortUrl("");
                      }}
                      placeholder="carousel_a"
                      className="shortly-input"
                    />
                  </Field>
                </div>

                {message && (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm shortly-muted">
                    {message}
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] p-5 sm:flex-row sm:justify-end sm:p-6">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className="shortly-button-secondary"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear
                </button>

                <button
                  type="submit"
                  disabled={loading || !generatedUrl}
                  className="shortly-button-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Link2 className="h-4 w-4" />

                  {loading ? "Shortening..." : "Build & shorten"}
                </button>
              </div>
            </form>

            <aside className="space-y-5 xl:sticky xl:top-24">
              <div
                className="rounded-2xl border p-5 sm:p-6"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                }}
              >
                <p className="text-sm font-semibold">Tracking URL</p>

                <p className="mt-1 text-xs leading-5 shortly-subtle">
                  Your generated URL updates as you fill in the campaign
                  details.
                </p>

                <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                  {generatedUrl ? (
                    <p className="break-all text-sm leading-6 shortly-muted">
                      {generatedUrl}
                    </p>
                  ) : (
                    <p className="text-sm shortly-subtle">
                      Enter a destination URL to begin.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!generatedUrl}
                  onClick={() => copyText(generatedUrl, "utm")}
                  className="shortly-button-secondary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {copied === "utm" ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy tracking URL
                    </>
                  )}
                </button>
              </div>

              {shortUrl && (
                <div
                  className="rounded-2xl border p-5 sm:p-6"
                  style={{
                    borderColor: "rgba(59,130,246,.3)",
                    background: "var(--surface)",
                  }}
                >
                  <p className="shortly-eyebrow">Shortly link</p>

                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block break-all text-lg font-semibold text-blue-500"
                  >
                    {shortUrl}
                  </a>

                  <p className="mt-2 text-xs shortly-subtle">
                    This short link redirects to the tracked campaign URL above.
                  </p>

                  <button
                    type="button"
                    onClick={() => copyText(shortUrl, "short")}
                    className="shortly-button-primary mt-5 w-full"
                  >
                    {copied === "short" ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy short link
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
                <p className="text-sm font-semibold">Example</p>

                <div className="mt-4 space-y-3 text-sm">
                  <ExampleRow label="Source" value="linkedin" />

                  <ExampleRow label="Medium" value="social" />

                  <ExampleRow label="Campaign" value="product_launch" />
                </div>

                <div className="mt-5 flex items-center gap-2 text-xs shortly-subtle">
                  <ArrowRight className="h-3.5 w-3.5" />
                  Appears in your analytics as campaign traffic.
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className="shortly-button-secondary">
              <Link2 className="h-4 w-4" />
              View links
            </Link>

            <Link href="/analytics" className="shortly-button-secondary">
              <BarChart3 className="h-4 w-4" />
              View analytics
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  helper,
  required = false,
  children,
}: {
  label: string;
  helper?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium">
        {label}

        {required && <span className="ml-1 text-blue-500">*</span>}
      </label>

      {helper && <p className="mt-1 text-xs shortly-subtle">{helper}</p>}

      <div className="mt-2">{children}</div>
    </div>
  );
}

function ExampleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="shortly-subtle">{label}</span>

      <code className="rounded-md bg-[var(--surface)] px-2 py-1 text-xs">
        {value}
      </code>
    </div>
  );
}
