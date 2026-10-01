"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [cursor, setCursor] = useState({ x: -500, y: -500 });

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      setCursor({
        x: event.clientX,
        y: event.clientY,
      });
    }

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        setLoggedIn(data.authenticated === true);
      } catch {
        setLoggedIn(false);
      } finally {
        setCheckingAuth(false);
      }
    }

    checkAuth();
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
        setError(data.error || "Something went wrong.");
        setToast(data.error || "Unable to create short link.");
        return;
      }

      setShortUrl(`${window.location.origin}/${data.shortCode}`);
      setUrl("");
      setAlias("");
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

  async function handleShare() {
    if (!shortUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Shortened URL",
          url: shortUrl,
        });

        setToast("Link shared successfully.");
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setToast("Unable to share link.");
        }
      }
    } else {
      await handleCopy();
      setToast("Link copied. You can now share it anywhere.");
    }
  }

  async function handleLogout() {
    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        setLoggedIn(false);
        setToast("Signed out successfully.");
      } else {
        setToast("Unable to sign out.");
      }
    } catch {
      setToast("Unable to sign out.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-6 py-12 text-white">
      <div
        className="pointer-events-none fixed z-0 h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-[100px] transition-transform duration-150 ease-out"
        style={{
          transform: `translate3d(${cursor.x - 210}px, ${cursor.y - 210}px, 0)`,
        }}
      />

      <div
        className="pointer-events-none fixed z-0 h-24 w-24 rounded-full bg-blue-400/10 blur-3xl transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${cursor.x - 48}px, ${cursor.y - 48}px, 0)`,
        }}
      />

      {toast && (
        <div className="fixed right-6 top-6 z-50 rounded-xl border border-slate-700 bg-slate-900/95 px-5 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur">
          <span className="mr-2 text-blue-400">✓</span>
          {toast}
        </div>
      )}

      <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center justify-center">
        <nav className="mb-10 flex flex-wrap items-center justify-center gap-8">
          <Link
            href="/"
            className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400 transition hover:text-blue-300"
          >
            Shortly
          </Link>

          {loggedIn && (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-slate-400 transition hover:text-white"
              >
                Dashboard
              </Link>

              <Link
                href="/analytics"
                className="text-sm font-medium text-slate-400 transition hover:text-white"
              >
                Analytics
              </Link>
            </>
          )}
        </nav>

        <div className="mb-10 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-blue-400">
            Simple URL management
          </p>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Shorten your URLs.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
            Create clean, memorable short links and track their performance from
            one simple dashboard.
          </p>
        </div>

        <section className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="Paste your long URL here..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-4 outline-none placeholder:text-slate-500 focus:border-blue-500"
              required
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={alias}
                onChange={(event) => setAlias(event.target.value)}
                placeholder="Custom alias (optional)"
                className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-4 outline-none placeholder:text-slate-500 focus:border-blue-500"
              />

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-7 py-4 font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Shortening..." : "Shorten URL"}
              </button>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
          </form>

          {shortUrl && (
            <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Your shortened URL</p>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1 break-all font-medium text-blue-400 transition hover:text-blue-300"
                >
                  {shortUrl}
                </a>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:text-white"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {!checkingAuth && (
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {loggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
                >
                  Open dashboard
                </Link>

                <Link
                  href="/dashboard/create"
                  className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:text-white"
                >
                  Create link
                </Link>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-red-500 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loggingOut ? "Signing out..." : "Sign out"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:text-white"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        )}

        <p className="mt-12 text-sm text-slate-600">
          Built by{" "}
          <a
            href="https://linkedin.com/in/joshuadaramola"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 transition hover:text-blue-400"
          >
            Olaoluwa Joshua Daramola
          </a>{" "}
          with Next.js, TypeScript, PostgreSQL and Prisma.
        </p>
      </div>
    </main>
  );
}
