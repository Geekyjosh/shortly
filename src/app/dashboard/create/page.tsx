"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import ShareModal from "@/components/ShareModal";

export default function CreateLink() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [toast, setToast] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  async function checkAuth() {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();

      if (!data.authenticated) {
        window.location.href = "/login";
        return;
      }

      setCheckingAuth(false);
    } catch {
      window.location.href = "/login";
    }
  }

  function getMinimumExpiration() {
    const date = new Date(Date.now() + 5 * 60 * 1000);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setShortUrl("");
    setShareOpen(false);
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
        setError(data.error || "Unable to create short link.");
        setToast(data.error || "Unable to create short link.");
        return;
      }

      const generatedShortUrl = `${window.location.origin}/${data.shortCode}`;

      setShortUrl(generatedShortUrl);
      setShareUrl(generatedShortUrl);

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
      setToast("Link copied to clipboard.");
    } catch {
      setToast("Unable to copy link.");
    }
  }

  function handleShare() {
    if (!shortUrl) return;

    setShareUrl(shortUrl);
    setShareOpen(true);
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />

          <p className="mt-4 text-sm text-slate-500">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-slate-950 text-white">
        {toast && (
          <div className="fixed right-6 top-6 z-50 rounded-xl border border-slate-700 bg-slate-900/95 px-5 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur">
            <span className="mr-2 text-blue-400">✓</span>
            {toast}
          </div>
        )}

        <header className="border-b border-slate-800 bg-slate-950/90">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-blue-400"
            >
              Shortly
            </Link>

            <nav className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm text-slate-400 transition hover:text-white"
              >
                Dashboard
              </Link>

              <Link
                href="/analytics"
                className="text-sm text-slate-400 transition hover:text-white"
              >
                Analytics
              </Link>
            </nav>
          </div>
        </header>

        <div className="mx-auto flex min-h-[calc(100vh-81px)] max-w-4xl items-center px-6 py-12">
          <div className="w-full">
            <Link
              href="/dashboard"
              className="text-sm text-slate-500 transition hover:text-slate-300"
            >
              ← Back to dashboard
            </Link>

            <div className="mb-8 mt-8">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                Create link
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight">
                Create a short link
              </h1>

              <p className="mt-3 max-w-2xl text-slate-400">
                Turn any long URL into a clean, memorable link you can share
                anywhere.
              </p>
            </div>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="url"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Destination URL
                  </label>

                  <input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://example.com/your-long-url"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 outline-none placeholder:text-slate-600 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="alias"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Custom alias
                  </label>

                  <div className="flex overflow-hidden rounded-xl border border-slate-700 bg-slate-950 focus-within:border-blue-500">
                    <span className="flex items-center border-r border-slate-800 px-4 text-sm text-slate-600">
                      {typeof window !== "undefined"
                        ? `${window.location.host}/`
                        : "short.ly/"}
                    </span>

                    <input
                      id="alias"
                      type="text"
                      value={alias}
                      onChange={(event) => setAlias(event.target.value)}
                      placeholder="my-link"
                      className="min-w-0 flex-1 bg-transparent px-4 py-4 outline-none placeholder:text-slate-600"
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-600">
                    Letters, numbers, hyphens and underscores are supported.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="expiresAt"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Expiration
                  </label>

                  <input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    min={getMinimumExpiration()}
                    onChange={(event) => setExpiresAt(event.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-slate-300 outline-none focus:border-blue-500"
                  />

                  <p className="mt-2 text-xs text-slate-600">
                    Leave empty if you want the link to remain active
                    indefinitely.
                  </p>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 px-6 py-4 font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Creating short link..." : "Create short link"}
                </button>
              </form>

              {shortUrl && (
                <div className="mt-8 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <p className="text-sm text-slate-400">
                    Your short link is ready
                  </p>

                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block break-all text-lg font-semibold text-blue-400 transition hover:text-blue-300"
                  >
                    {shortUrl}
                  </a>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:text-white"
                    >
                      Copy link
                    </button>

                    <button
                      type="button"
                      onClick={handleShare}
                      className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
                    >
                      Share
                    </button>

                    <Link
                      href="/dashboard"
                      className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:text-white"
                    >
                      View dashboard
                    </Link>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <ShareModal
        url={shareUrl}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </>
  );
}
