"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setShortUrl("");
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
        return;
      }

      setShortUrl(`${window.location.origin}/${data.shortCode}`);

      setUrl("");
      setAlias("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
      } else {
        setError("Unable to log out. Please try again.");
      }
    } catch {
      setError("Unable to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center justify-center">
        <div className="mb-10 text-center">
          <Link
            href="/"
            className="text-sm font-medium uppercase tracking-[0.3em] text-blue-400 transition hover:text-blue-300"
          >
            Shortly
          </Link>

          <h1 className="mt-4 text-5xl font-bold tracking-tight sm:text-6xl">
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
            <div className="mt-6 rounded-lg border border-slate-700 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Your shortened URL</p>

              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block break-all font-medium text-blue-400 hover:text-blue-300"
              >
                {shortUrl}
              </a>
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
                  Dashboard
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
