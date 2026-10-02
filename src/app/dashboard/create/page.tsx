"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import ShareModal from "@/components/ShareModal";
import { useTheme } from "@/components/ThemeProvider";

export default function CreateLink() {
  const { darkMode, toggleTheme } = useTheme();

  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [toast, setToast] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [host, setHost] = useState("short.ly");

  useEffect(() => {
    setHost(window.location.host);
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

      setShortUrl(`${window.location.origin}/${data.shortCode}`);

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

    setShareOpen(true);
  }

  const t = darkMode
    ? {
        page: "bg-slate-950 text-white",
        header: "border-slate-800 bg-slate-950/90",
        navLink: "text-slate-400 hover:text-white",
        card: "border-slate-800 bg-slate-900",
        label: "text-slate-300",
        muted: "text-slate-400",
        subtle: "text-slate-500",
        hint: "text-slate-600",
        back: "text-slate-500 hover:text-slate-300",
        input:
          "border-slate-700 bg-slate-950 text-white placeholder:text-slate-600",
        inputGroup: "border-slate-700 bg-slate-950",
        prefix: "border-slate-800 text-slate-600",
        btn: "border-slate-700 text-slate-300 hover:border-blue-500 hover:text-white",
        toast: "border-slate-700 bg-slate-900/95 text-white",
        spinner: "border-slate-700 border-t-blue-500",
        link: "text-blue-400 hover:text-blue-300",
        success: "border-emerald-500/20 bg-emerald-500/5",
        errorBox: "border-red-500/20 bg-red-500/10 text-red-400",
        themeBtn:
          "border-slate-800 bg-slate-900 text-yellow-300 hover:border-slate-700 hover:bg-slate-800",
      }
    : {
        page: "bg-slate-50 text-slate-900",
        header: "border-slate-200 bg-white",
        navLink: "text-slate-500 hover:text-slate-900",
        card: "border-slate-200 bg-white",
        label: "text-slate-700",
        muted: "text-slate-600",
        subtle: "text-slate-500",
        hint: "text-slate-500",
        back: "text-slate-500 hover:text-slate-800",
        input:
          "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400",
        inputGroup: "border-slate-300 bg-white",
        prefix: "border-slate-200 text-slate-500",
        btn: "border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600",
        toast: "border-slate-200 bg-white text-slate-900",
        spinner: "border-slate-300 border-t-blue-500",
        link: "text-blue-600 hover:text-blue-500",
        success: "border-emerald-300 bg-emerald-50",
        errorBox: "border-red-300 bg-red-50 text-red-600",
        themeBtn:
          "border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-200",
      };

  if (checkingAuth) {
    return (
      <main
        className={`flex min-h-screen items-center justify-center ${t.page}`}
      >
        <div className="text-center">
          <div
            className={`mx-auto h-8 w-8 animate-spin rounded-full border-2 ${t.spinner}`}
          />

          <p className={`mt-4 text-sm ${t.subtle}`}>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className={`min-h-screen transition-colors duration-300 ${t.page}`}>
        {toast && (
          <div
            className={`fixed right-6 top-6 z-50 rounded-xl border px-5 py-3 text-sm font-medium shadow-2xl backdrop-blur ${t.toast}`}
          >
            <span className="mr-2 text-blue-500">✓</span>
            {toast}
          </div>
        )}

        <header
          className={`border-b transition-colors duration-300 ${t.header}`}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Shortly logo"
                width={120}
                height={50}
                priority
              />
            </Link>

            <div className="flex items-center gap-6">
              <nav className="flex items-center gap-6">
                <Link
                  href="/dashboard"
                  className={`text-sm transition ${t.navLink}`}
                >
                  Dashboard
                </Link>

                <Link
                  href="/analytics"
                  className={`text-sm transition ${t.navLink}`}
                >
                  Analytics
                </Link>
              </nav>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
                title={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
                className={`flex h-10 w-10 items-center justify-center rounded-lg border text-base transition ${t.themeBtn}`}
              >
                {darkMode ? "☀️" : "🌙"}
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto flex min-h-[calc(100vh-81px)] max-w-4xl items-center px-6 py-12">
          <div className="w-full">
            <Link href="/dashboard" className={`text-sm transition ${t.back}`}>
              ← Back to dashboard
            </Link>

            <div className="mb-8 mt-8">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-500">
                Create link
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight">
                Create a short link
              </h1>

              <p className={`mt-3 max-w-2xl ${t.muted}`}>
                Turn any long URL into a clean, memorable link you can share
                anywhere.
              </p>
            </div>

            <section
              className={`rounded-2xl border p-6 shadow-2xl transition-colors duration-300 sm:p-8 ${t.card}`}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="url"
                    className={`mb-2 block text-sm font-medium ${t.label}`}
                  >
                    Destination URL
                  </label>

                  <input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://example.com/your-long-url"
                    className={`w-full rounded-xl border px-4 py-4 outline-none focus:border-blue-500 ${t.input}`}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="alias"
                    className={`mb-2 block text-sm font-medium ${t.label}`}
                  >
                    Custom alias
                  </label>

                  <div
                    className={`flex overflow-hidden rounded-xl border focus-within:border-blue-500 ${t.inputGroup}`}
                  >
                    <span
                      className={`flex items-center border-r px-4 text-sm ${t.prefix}`}
                    >
                      {host}/
                    </span>

                    <input
                      id="alias"
                      type="text"
                      value={alias}
                      onChange={(event) => setAlias(event.target.value)}
                      placeholder="my-link"
                      className={`min-w-0 flex-1 bg-transparent px-4 py-4 outline-none ${
                        darkMode
                          ? "text-white placeholder:text-slate-600"
                          : "text-slate-900 placeholder:text-slate-400"
                      }`}
                    />
                  </div>

                  <p className={`mt-2 text-xs ${t.hint}`}>
                    Letters, numbers, hyphens and underscores are supported.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="expiresAt"
                    className={`mb-2 block text-sm font-medium ${t.label}`}
                  >
                    Expiration
                  </label>

                  <input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    min={getMinimumExpiration()}
                    onChange={(event) => setExpiresAt(event.target.value)}
                    style={{ colorScheme: darkMode ? "dark" : "light" }}
                    className={`w-full rounded-xl border px-4 py-4 outline-none focus:border-blue-500 ${t.input}`}
                  />

                  <p className={`mt-2 text-xs ${t.hint}`}>
                    Leave empty if you want the link to remain active
                    indefinitely.
                  </p>
                </div>

                {error && (
                  <div
                    className={`rounded-xl border px-4 py-3 text-sm ${t.errorBox}`}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 px-6 py-4 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Creating short link..." : "Create short link"}
                </button>
              </form>

              {shortUrl && (
                <div className={`mt-8 rounded-xl border p-5 ${t.success}`}>
                  <p className={`text-sm ${t.muted}`}>
                    Your short link is ready
                  </p>

                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-2 block break-all text-lg font-semibold transition ${t.link}`}
                  >
                    {shortUrl}
                  </a>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className={`rounded-lg border px-5 py-2.5 text-sm font-medium transition ${t.btn}`}
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
                      className={`rounded-lg border px-5 py-2.5 text-sm font-medium transition ${t.btn}`}
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
        url={shortUrl}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </>
  );
}
