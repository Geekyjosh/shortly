"use client";

import Link from "next/link";
import {
  BarChart3,
  Check,
  Copy,
  Layers3,
  Link2,
  Plus,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { FormEvent, useMemo, useState, useSyncExternalStore } from "react";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

type BulkResult = {
  input: string;
  status: "success" | "error";
  shortCode?: string;
  shortUrl?: string;
  error?: string;
};

const MAX_URLS = 20;

function subscribeToLocation() {
  return () => {};
}

function getOriginSnapshot() {
  return window.location.origin;
}

function getServerOriginSnapshot() {
  return "https://shortly.app";
}

export default function BulkShortenerPage() {
  const origin = useSyncExternalStore(
    subscribeToLocation,
    getOriginSnapshot,
    getServerOriginSnapshot,
  );

  const [input, setInput] = useState("");
  const [results, setResults] = useState<BulkResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState("");
  const [message, setMessage] = useState("");

  const urls = useMemo(() => {
    const unique = new Set<string>();

    input
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean)
      .forEach((value) => {
        unique.add(value);
      });

    return Array.from(unique);
  }, [input]);

  const successfulResults = results.filter(
    (result) => result.status === "success",
  );

  const failedResults = results.filter((result) => result.status === "error");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setResults([]);
    setCurrentIndex(0);

    if (urls.length === 0) {
      setMessage("Paste at least one URL before creating your links.");
      return;
    }

    if (urls.length > MAX_URLS) {
      setMessage(`You can shorten up to ${MAX_URLS} URLs in one batch.`);
      return;
    }

    setLoading(true);

    const batchResults: BulkResult[] = [];

    for (let index = 0; index < urls.length; index += 1) {
      const url = urls[index];

      setCurrentIndex(index + 1);

      try {
        const response = await fetch("/api/urls", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            url,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          batchResults.push({
            input: url,
            status: "error",
            error: data.error || "Unable to shorten this URL.",
          });

          setResults([...batchResults]);

          continue;
        }

        batchResults.push({
          input: url,
          status: "success",
          shortCode: data.shortCode,
          shortUrl: `${origin}/${data.shortCode}`,
        });

        setResults([...batchResults]);
      } catch {
        batchResults.push({
          input: url,
          status: "error",
          error: "Something went wrong while processing this URL.",
        });

        setResults([...batchResults]);
      }
    }

    setLoading(false);

    const createdCount = batchResults.filter(
      (result) => result.status === "success",
    ).length;

    if (createdCount === urls.length) {
      setMessage(
        `${createdCount} ${
          createdCount === 1 ? "link" : "links"
        } created successfully.`,
      );
    } else {
      setMessage(
        `${createdCount} of ${urls.length} links were created successfully.`,
      );
    }
  }

  async function copyLink(shortUrl: string) {
    try {
      await navigator.clipboard.writeText(shortUrl);

      setCopiedUrl(shortUrl);

      window.setTimeout(() => {
        setCopiedUrl("");
      }, 1800);
    } catch {
      setMessage("Unable to copy link.");
    }
  }

  async function copyAll() {
    const text = successfulResults
      .map((result) => result.shortUrl)
      .filter(Boolean)
      .join("\n");

    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);

      setMessage(
        `${successfulResults.length} short ${
          successfulResults.length === 1 ? "link" : "links"
        } copied.`,
      );
    } catch {
      setMessage("Unable to copy links.");
    }
  }

  function resetForm() {
    setInput("");
    setResults([]);
    setMessage("");
    setCurrentIndex(0);
    setCopiedUrl("");
  }

  return (
    <div data-workspace-form className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      <main>
        <section className="border-b border-[var(--border)]">
          <div className="shortly-container py-10 sm:py-12">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="shortly-eyebrow">Workspace</p>

                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                  Bulk shortener
                </h1>

                <p className="mt-3 max-w-2xl text-base shortly-muted">
                  Paste multiple destination URLs and create clean Shortly links
                  in one batch.
                </p>
              </div>

              <Link
                href="/dashboard/create"
                className="shortly-button-secondary w-fit"
              >
                <Plus className="h-4 w-4" />
                Single link
              </Link>
            </div>

            <nav className="mt-9 flex gap-1 overflow-x-auto border-b border-[var(--border)]" aria-label="Workspace navigation">
              <Link href="/dashboard" className="whitespace-nowrap px-4 pb-3 pt-2 text-sm font-medium shortly-muted hover:text-[var(--foreground)]">Links</Link>
              <Link href="/analytics" className="whitespace-nowrap px-4 pb-3 pt-2 text-sm font-medium shortly-muted hover:text-[var(--foreground)]">Analytics</Link>
              <Link href="/dashboard/create" className="whitespace-nowrap px-4 pb-3 pt-2 text-sm font-medium shortly-muted hover:text-[var(--foreground)]">Create</Link>
              <Link href="/dashboard/bulk" aria-current="page" className="relative whitespace-nowrap px-4 pb-3 pt-2 text-sm font-semibold">Bulk tools<span className="absolute inset-x-4 bottom-[-1px] h-0.5 bg-blue-500" /></Link>
              <Link href="/dashboard/utm" className="whitespace-nowrap px-4 pb-3 pt-2 text-sm font-medium shortly-muted hover:text-[var(--foreground)]">UTM builder</Link>
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
                    <h2 className="text-lg font-semibold">Destination URLs</h2>

                    <p className="mt-1 text-sm shortly-muted">
                      Enter one URL per line.
                    </p>
                  </div>

                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: "var(--brand-soft)",
                      color: "var(--brand)",
                    }}
                  >
                    <Layers3 className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-5 sm:p-6">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <label htmlFor="bulk-urls" className="text-base font-semibold">
                    Destination URLs
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const pasted = await navigator.clipboard.readText();
                          if (!pasted.trim()) {
                            setMessage("Your clipboard is empty.");
                            return;
                          }
                          setInput((current) => [current.trim(), pasted.trim()].filter(Boolean).join("\n"));
                          setMessage("URLs pasted from clipboard.");
                        } catch {
                          setMessage("Clipboard access was blocked. Paste directly into the field instead.");
                        }
                      }}
                      disabled={loading}
                      className="shortly-button-secondary min-h-9 px-3 py-2 text-sm"
                    >
                      Paste from clipboard
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInput("https://example.com/product\nhttps://github.com\nhttps://openai.com");
                        setMessage("Sample URLs loaded. Replace them with your destinations before shortening.");
                        setResults([]);
                      }}
                      disabled={loading}
                      className="min-h-9 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-[var(--brand-soft)]"
                    >
                      Load sample
                    </button>
                  </div>
                </div>

                <textarea
                  id="bulk-urls"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  disabled={loading}
                  placeholder={`https://example.com/page-one
https://github.com
https://openai.com`}
                  rows={12}
                  className="shortly-input mt-2 min-h-[280px] resize-y py-4 leading-7 disabled:opacity-50"
                />

                <div className="mt-3 flex flex-col gap-2 text-xs shortly-subtle sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    {urls.length} / {MAX_URLS} URLs
                  </span>

                  <span>Duplicate lines are automatically removed.</span>
                </div>

                {message && (
                  <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm shortly-muted">
                    {message}
                  </div>
                )}

                {loading && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="font-medium">Creating links...</span>

                      <span className="shortly-subtle">
                        {currentIndex} / {urls.length}
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{
                          width: `${
                            urls.length ? (currentIndex / urls.length) * 100 : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                    className="shortly-button-secondary disabled:opacity-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Clear
                  </button>

                  <button
                    type="submit"
                    disabled={
                      loading || urls.length === 0 || urls.length > MAX_URLS
                    }
                    className="shortly-button-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Layers3 className="h-4 w-4" />

                    {loading
                      ? "Creating..."
                      : `Shorten ${urls.length || ""} ${
                          urls.length === 1 ? "URL" : "URLs"
                        }`}
                  </button>
                </div>
              </form>
            </section>

            <aside className="space-y-5">
              <div
                className="rounded-2xl border p-5 sm:p-6"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                }}
              >
                <p className="text-sm font-semibold">Bulk shortening</p>

                <div className="mt-5 space-y-4">
                  <InfoItem
                    number="1"
                    title="Paste URLs"
                    text={`Add up to ${MAX_URLS} destinations, one per line.`}
                  />

                  <InfoItem
                    number="2"
                    title="Validate"
                    text="Each destination goes through Shortly's URL validation."
                  />

                  <InfoItem
                    number="3"
                    title="Create"
                    text="Valid destinations receive their own short URL."
                  />

                  <InfoItem
                    number="4"
                    title="Copy"
                    text="Copy individual results or all successful links at once."
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
                <p className="text-sm font-semibold">Independent results</p>

                <p className="mt-2 text-sm leading-6 shortly-muted">
                  If one destination is invalid, the rest of the batch will
                  continue processing.
                </p>
              </div>
            </aside>
          </div>

          {results.length > 0 && (
            <section
              className="mt-8 overflow-hidden rounded-2xl border"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
              }}
            >
              <div className="flex flex-col gap-4 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <h2 className="text-lg font-semibold">Results</h2>

                  <p className="mt-1 text-sm shortly-muted">
                    {successfulResults.length} successful ·{" "}
                    {failedResults.length} failed
                  </p>
                </div>

                {successfulResults.length > 0 && (
                  <button
                    type="button"
                    onClick={copyAll}
                    className="shortly-button-secondary w-fit"
                  >
                    <Copy className="h-4 w-4" />
                    Copy all
                  </button>
                )}
              </div>

              <div className="divide-y divide-[var(--border)]">
                {results.map((result, index) => (
                  <div
                    key={`${result.input}-${index}`}
                    className="p-5 transition hover:bg-[var(--surface-muted)]"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <span
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            result.status === "success"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {result.status === "success" ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </span>

                        <div className="min-w-0">
                          <p
                            className="truncate text-sm shortly-muted"
                            title={result.input}
                          >
                            {result.input}
                          </p>

                          {result.status === "success" && result.shortUrl && (
                            <a
                              href={result.shortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 block truncate text-sm font-semibold text-blue-500 hover:text-blue-400"
                            >
                              {result.shortUrl}
                            </a>
                          )}

                          {result.status === "error" && (
                            <p className="mt-1 text-sm text-red-500">
                              {result.error}
                            </p>
                          )}
                        </div>
                      </div>

                      {result.status === "success" && result.shortUrl && (
                        <button
                          type="button"
                          onClick={() => copyLink(result.shortUrl!)}
                          className="shortly-button-secondary shrink-0"
                        >
                          {copiedUrl === result.shortUrl ? (
                            <>
                              <Check className="h-4 w-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copy
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {successfulResults.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/dashboard" className="shortly-button-secondary">
                <Link2 className="h-4 w-4" />
                View links
              </Link>

              <Link href="/analytics" className="shortly-button-secondary">
                <BarChart3 className="h-4 w-4" />
                View analytics
              </Link>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function InfoItem({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
        style={{
          background: "var(--brand-soft)",
          color: "var(--brand)",
        }}
      >
        {number}
      </span>

      <div>
        <p className="text-sm font-medium">{title}</p>

        <p className="mt-1 text-xs leading-5 shortly-subtle">{text}</p>
      </div>
    </div>
  );
}
