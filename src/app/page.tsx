"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

export default function Home() {
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
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [cursor, setCursor] = useState({ x: -500, y: -500 });
  const [host, setHost] = useState("shortly");
  const { darkMode, toggleTheme } = useTheme();

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
    setHost(window.location.host);
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

  function handleShare() {
    if (!shortUrl) return;

    setShowShareModal(true);
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

  const page = darkMode
    ? {
        background: "bg-slate-950",
        text: "text-white",
        border: "border-slate-900",
        card: "bg-slate-900/80",
        cardSoft: "bg-slate-900/40",
        input: "bg-slate-950",
        inputBorder: "border-slate-800",
        muted: "text-slate-400",
        subtle: "text-slate-500",
        faint: "text-slate-600",
        heading: "text-white",
      }
    : {
        background: "bg-slate-100",
        text: "text-slate-950",
        border: "border-slate-300",
        card: "bg-white",
        cardSoft: "bg-slate-50",
        input: "bg-white",
        inputBorder: "border-slate-300",
        muted: "text-slate-600",
        subtle: "text-slate-500",
        faint: "text-slate-400",
        heading: "text-slate-950",
      };

  return (
    <main
      id="top"
      className={`relative min-h-screen overflow-hidden ${page.background} ${page.text} transition-colors duration-300`}
    >
      {/* Cursor glow */}
      <div
        className={`pointer-events-none fixed z-0 h-[420px] w-[420px] rounded-full blur-[110px] transition-transform duration-150 ease-out ${
          darkMode ? "bg-blue-500/10" : "bg-blue-500/5"
        }`}
        style={{
          transform: `translate3d(${cursor.x - 210}px, ${cursor.y - 210}px, 0)`,
        }}
      />

      <div
        className={`pointer-events-none fixed z-0 h-24 w-24 rounded-full blur-3xl transition-transform duration-75 ease-out ${
          darkMode ? "bg-blue-400/10" : "bg-blue-400/5"
        }`}
        style={{
          transform: `translate3d(${cursor.x - 48}px, ${cursor.y - 48}px, 0)`,
        }}
      />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-5 top-5 z-50 max-w-sm rounded-xl border px-5 py-3 text-sm font-medium shadow-2xl backdrop-blur-xl ${
            darkMode
              ? "border-slate-700 bg-slate-900/95 text-white"
              : "border-slate-300 bg-white/95 text-slate-900"
          }`}
          role="status"
          aria-live="polite"
        >
          <span className="mr-2 text-blue-500">✓</span>
          {toast}
        </div>
      )}

      {/* Share popup */}
      {showShareModal && shortUrl && (
        <ShareModal
          shortUrl={shortUrl}
          darkMode={darkMode}
          onClose={() => setShowShareModal(false)}
          onCopy={async () => {
            await handleCopy();
            setShowShareModal(false);
          }}
        />
      )}

      {/* Navbar */}
      <header
        className={`relative z-20 border-b transition-colors duration-300 ${
          darkMode ? "border-slate-900/80" : "border-slate-300"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-80"
          >
            <img src="/logo.svg" alt="Shortly" className="h-10 w-auto" />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className={`text-sm transition ${
                darkMode
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Features
            </a>

            <a
              href="#use-cases"
              className={`text-sm transition ${
                darkMode
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Use cases
            </a>

            {loggedIn && (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm transition ${
                    darkMode
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  href="/analytics"
                  className={`text-sm transition ${
                    darkMode
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  Analytics
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {!checkingAuth &&
              (loggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`hidden rounded-lg border px-4 py-2 text-sm font-medium transition sm:block ${
                      darkMode
                        ? "border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                        : "border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-950"
                    }`}
                  >
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
                      darkMode
                        ? "bg-white text-slate-950 hover:bg-slate-200"
                        : "bg-slate-950 text-white hover:bg-slate-800"
                    }`}
                  >
                    {loggingOut ? "Signing out..." : "Sign out"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`hidden px-3 py-2 text-sm font-medium transition sm:block ${
                      darkMode
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-600 hover:text-slate-950"
                    }`}
                  >
                    Log in
                  </Link>

                  <Link
                    href="/register"
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      darkMode
                        ? "bg-white text-slate-950 hover:bg-slate-200"
                        : "bg-slate-950 text-white hover:bg-slate-800"
                    }`}
                  >
                    Get started
                  </Link>
                </>
              ))}

            {/* Theme Toggle (last item) */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border text-base transition ${
                darkMode
                  ? "border-slate-800 bg-slate-900 text-yellow-300 hover:border-slate-700 hover:bg-slate-800"
                  : "border-slate-300 bg-slate-100 text-slate-700 hover:border-slate-400 hover:bg-white"
              }`}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 pb-24 pt-20 transition-colors duration-300 sm:pt-28">
        <div className="mx-auto max-w-5xl text-center">
          <div
            className={`mb-7 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
              darkMode
                ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
                : "border-blue-300 bg-blue-100 text-blue-700"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Smarter links. Simpler sharing.
          </div>

          <h1
            className={`mx-auto max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight transition-colors duration-300 sm:text-6xl md:text-7xl ${page.heading}`}
          >
            Turn long links into{" "}
            <span className="text-blue-500">smart, shareable URLs.</span>
          </h1>

          <p
            className={`mx-auto mt-7 max-w-2xl text-lg leading-8 transition-colors duration-300 sm:text-xl ${page.muted}`}
          >
            Create clean short links in seconds, customize them with your own
            identifiers, and track how they perform from one simple place.
          </p>

          {/* URL Creator */}
          <div className="mx-auto mt-12 max-w-4xl">
            <div
              className={`rounded-2xl border p-2 shadow-2xl backdrop-blur-xl transition-colors duration-300 sm:p-3 ${
                darkMode
                  ? "border-slate-800 bg-slate-900/80 shadow-blue-950/20"
                  : "border-slate-300 bg-slate-200 shadow-slate-300/50"
              }`}
            >
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="Paste your long URL here..."
                    autoComplete="url"
                    className={`min-w-0 flex-1 rounded-xl border px-5 py-4 text-sm outline-none transition sm:text-base ${
                      darkMode
                        ? "border-slate-800 bg-slate-950 text-white placeholder:text-slate-600 focus:border-blue-500"
                        : "border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 focus:border-blue-500"
                    }`}
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-blue-600 px-7 py-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                  >
                    {loading ? "Creating..." : "Create short link"}
                  </button>
                </div>

                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <div
                    className={`flex flex-1 items-center rounded-xl border px-4 transition ${
                      darkMode
                        ? "border-slate-800 bg-slate-950"
                        : "border-slate-300 bg-slate-50"
                    }`}
                  >
                    <span
                      className={`mr-2 text-sm ${
                        darkMode ? "text-slate-600" : "text-slate-400"
                      }`}
                    >
                      {host}/
                    </span>

                    <input
                      type="text"
                      value={alias}
                      onChange={(event) => setAlias(event.target.value)}
                      placeholder="custom-id"
                      autoComplete="off"
                      className={`min-w-0 flex-1 bg-transparent py-3 text-sm outline-none ${
                        darkMode
                          ? "text-white placeholder:text-slate-600"
                          : "text-slate-950 placeholder:text-slate-400"
                      }`}
                    />
                  </div>
                </div>

                {error && (
                  <p
                    className={`px-2 pt-3 text-left text-sm ${
                      darkMode ? "text-red-400" : "text-red-600"
                    }`}
                  >
                    {error}
                  </p>
                )}
              </form>
            </div>

            <div
              className={`mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm transition-colors duration-300 ${page.subtle}`}
            >
              <span>✓ Instant creation</span>
              <span>✓ Custom aliases</span>
              <span>✓ Click tracking</span>
              <span>✓ Secure links</span>
            </div>
          </div>

          {/* Result */}
          {shortUrl && (
            <div className="mx-auto mt-8 max-w-4xl space-y-3">
              <div
                className={`rounded-2xl border p-5 text-left backdrop-blur-xl transition-colors duration-300 ${
                  darkMode
                    ? "border-blue-500/20 bg-blue-500/5"
                    : "border-blue-300 bg-blue-50"
                }`}
              >
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Your shortened link
                </p>

                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 flex-1 break-all text-lg font-semibold text-blue-500 transition hover:text-blue-400"
                  >
                    {shortUrl}
                  </a>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                        darkMode
                          ? "border-slate-700 text-slate-300 hover:border-blue-500 hover:text-white"
                          : "border-slate-300 text-slate-700 hover:border-blue-500 hover:text-slate-950"
                      }`}
                    >
                      {copied ? "Copied ✓" : "Copy"}
                    </button>

                    <button
                      type="button"
                      onClick={handleShare}
                      className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>

              {showAccountPrompt && !loggedIn && (
                <div
                  className={`group relative overflow-hidden rounded-2xl border p-6 text-left shadow-xl backdrop-blur-xl transition-colors duration-300 ${
                    darkMode
                      ? "border-slate-800 bg-slate-900/70"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  <div
                    className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl transition duration-500 ${
                      darkMode
                        ? "bg-blue-500/10 group-hover:bg-blue-500/15"
                        : "bg-blue-500/5 group-hover:bg-blue-500/10"
                    }`}
                  />

                  <div className="relative">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm ${
                              darkMode
                                ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                                : "border-blue-300 bg-blue-50 text-blue-600"
                            }`}
                          >
                            ✦
                          </span>

                          <p
                            className={`text-sm font-semibold ${
                              darkMode ? "text-white" : "text-slate-950"
                            }`}
                          >
                            Get more out of Shortly
                          </p>
                        </div>

                        <p
                          className={`mt-3 max-w-2xl text-sm leading-6 ${page.muted}`}
                        >
                          Your link is ready. Create a free account to keep your
                          links organized, track clicks, and manage everything
                          from your dashboard.
                        </p>

                        <div
                          className={`mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs ${page.subtle}`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="text-blue-500">✓</span>
                            Unlimited links
                          </span>

                          <span className="flex items-center gap-1.5">
                            <span className="text-blue-500">✓</span>
                            Click analytics
                          </span>

                          <span className="flex items-center gap-1.5">
                            <span className="text-blue-500">✓</span>
                            Link management
                          </span>
                        </div>
                      </div>

                      <Link
                        href="/register"
                        className={`inline-flex shrink-0 items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition ${
                          darkMode
                            ? "bg-white text-slate-950 hover:bg-slate-200"
                            : "bg-slate-950 text-white hover:bg-slate-800"
                        }`}
                      >
                        Create free account
                        <span className="ml-2">→</span>
                      </Link>
                    </div>

                    <p
                      className={`relative mt-5 text-xs ${
                        darkMode ? "text-slate-600" : "text-slate-500"
                      }`}
                    >
                      No credit card required. You can keep creating links
                      without an account until you reach the guest limit.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Trust / intro */}
      <section
        className={`relative z-10 border-y px-6 py-20 transition-colors duration-300 ${
          darkMode ? "border-slate-900" : "border-slate-300 bg-slate-100"
        }`}
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
            More than a shorter URL
          </p>

          <h2
            className={`mt-4 text-3xl font-bold tracking-tight sm:text-4xl ${page.heading}`}
          >
            Your links should do more than redirect.
          </h2>

          <p className={`mx-auto mt-5 max-w-2xl leading-7 ${page.muted}`}>
            Shortly gives every link a purpose. Create memorable URLs, manage
            them from one place, and understand what happens after someone
            clicks.
          </p>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="relative z-10 overflow-hidden px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
              Everything in one place
            </p>

            <h2
              className={`mt-4 text-3xl font-bold tracking-tight sm:text-4xl ${page.heading}`}
            >
              See what your links are doing.
            </h2>

            <p className={`mt-5 leading-7 ${page.muted}`}>
              Shortly gives you a clear view of your links, clicks, and
              performance without getting in the way.
            </p>
          </div>

          <div className="relative mx-auto mt-14 max-w-6xl">
            <div
              className={`absolute -inset-10 -z-10 rounded-[3rem] blur-3xl ${
                darkMode ? "bg-blue-600/10" : "bg-blue-600/5"
              }`}
            />

            <div
              className={`overflow-hidden rounded-2xl border shadow-2xl transition-colors duration-300 ${
                darkMode
                  ? "border-slate-800 bg-slate-900 shadow-black/40"
                  : "border-slate-300 bg-white shadow-slate-300/40"
              }`}
            >
              <div
                className={`flex items-center justify-between border-b px-5 py-4 ${
                  darkMode
                    ? "border-slate-800 bg-slate-950"
                    : "border-slate-300 bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-3 w-3 rounded-full ${
                      darkMode ? "bg-slate-700" : "bg-slate-400"
                    }`}
                  />
                  <span
                    className={`h-3 w-3 rounded-full ${
                      darkMode ? "bg-slate-700" : "bg-slate-400"
                    }`}
                  />
                  <span
                    className={`h-3 w-3 rounded-full ${
                      darkMode ? "bg-slate-700" : "bg-slate-400"
                    }`}
                  />
                </div>

                <div
                  className={`hidden rounded-lg border px-5 py-1.5 text-xs sm:block ${
                    darkMode
                      ? "border-slate-800 bg-slate-900 text-slate-600"
                      : "border-slate-300 bg-white text-slate-500"
                  }`}
                >
                  app.shortly
                </div>

                <div className="w-12" />
              </div>

              <div className="flex min-h-[520px]">
                <aside
                  className={`hidden w-52 shrink-0 border-r p-5 md:block ${
                    darkMode
                      ? "border-slate-800 bg-slate-950"
                      : "border-slate-300 bg-slate-100"
                  }`}
                >
                  <div className="mb-10">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                        S
                      </div>

                      <span
                        className={`font-semibold ${
                          darkMode ? "text-white" : "text-slate-950"
                        }`}
                      >
                        Shortly
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="rounded-lg bg-blue-500/10 px-3 py-2.5 text-sm font-medium text-blue-500">
                      Overview
                    </div>

                    <div className="px-3 py-2.5 text-sm text-slate-500">
                      Links
                    </div>

                    <div className="px-3 py-2.5 text-sm text-slate-500">
                      Analytics
                    </div>
                  </div>
                </aside>

                <div
                  className={`min-w-0 flex-1 p-5 transition-colors duration-300 sm:p-7 ${
                    darkMode ? "bg-slate-900" : "bg-white"
                  }`}
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <p
                        className={`text-xs uppercase tracking-wider ${
                          darkMode ? "text-slate-600" : "text-slate-400"
                        }`}
                      >
                        Overview
                      </p>

                      <h3
                        className={`mt-1 text-xl font-semibold ${page.heading}`}
                      >
                        Your links
                      </h3>
                    </div>

                    <div className="rounded-lg bg-blue-600 px-4 py-2 text-center text-xs font-semibold text-white">
                      + Create link
                    </div>
                  </div>

                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    <DashboardStat
                      label="Total clicks"
                      value="12,483"
                      change="+18.4%"
                      darkMode={darkMode}
                    />

                    <DashboardStat
                      label="Links created"
                      value="247"
                      change="+12.2%"
                      darkMode={darkMode}
                    />

                    <DashboardStat
                      label="Active links"
                      value="189"
                      change="+8.7%"
                      darkMode={darkMode}
                    />
                  </div>

                  <div
                    className={`mt-5 rounded-xl border p-5 ${
                      darkMode
                        ? "border-slate-800 bg-slate-950/60"
                        : "border-slate-300 bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${page.heading}`}>
                          Click activity
                        </p>

                        <p
                          className={`mt-1 text-xs ${
                            darkMode ? "text-slate-600" : "text-slate-400"
                          }`}
                        >
                          Last 7 days
                        </p>
                      </div>

                      <span className="text-xs text-blue-500">+18.4%</span>
                    </div>

                    <div className="mt-8 flex h-36 items-end gap-2 sm:gap-4">
                      {[35, 52, 42, 70, 58, 82, 96].map((height, index) => (
                        <div key={index} className="flex flex-1 items-end">
                          <div
                            className="w-full rounded-t-md bg-blue-500/60 transition hover:bg-blue-400"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                      ))}
                    </div>

                    <div
                      className={`mt-3 flex justify-between text-[10px] ${
                        darkMode ? "text-slate-700" : "text-slate-400"
                      }`}
                    >
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>

                  <div
                    className={`mt-5 overflow-hidden rounded-xl border ${
                      darkMode
                        ? "border-slate-800 bg-slate-950/60"
                        : "border-slate-300 bg-slate-100"
                    }`}
                  >
                    <div
                      className={`border-b px-5 py-4 ${
                        darkMode ? "border-slate-800" : "border-slate-300"
                      }`}
                    >
                      <p className={`text-sm font-medium ${page.heading}`}>
                        Recent links
                      </p>
                    </div>

                    <div
                      className={`divide-y ${
                        darkMode ? "divide-slate-800" : "divide-slate-300"
                      }`}
                    >
                      <PreviewLink
                        link="shortly.app/product-launch"
                        destination="example.com/product"
                        clicks="4,832"
                        darkMode={darkMode}
                      />

                      <PreviewLink
                        link="shortly.app/my-video"
                        destination="youtube.com/watch"
                        clicks="2,190"
                        darkMode={darkMode}
                      />

                      <PreviewLink
                        link="shortly.app/portfolio"
                        destination="josh-daramola.pages.dev"
                        clicks="1,426"
                        darkMode={darkMode}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
              Everything you need
            </p>

            <h2
              className={`mt-4 text-3xl font-bold tracking-tight sm:text-4xl ${page.heading}`}
            >
              Simple on the surface. Powerful underneath.
            </h2>

            <p className={`mt-5 leading-7 ${page.muted}`}>
              From your first shortened URL to hundreds of links across
              different projects, Shortly keeps link management straightforward.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="⚡"
              title="Instant creation"
              description="Paste a URL and create a clean, shareable link in seconds without unnecessary steps."
              darkMode={darkMode}
            />

            <FeatureCard
              icon="✦"
              title="Custom links"
              description="Give your URLs meaningful identifiers that are easier to recognize, remember, and share."
              darkMode={darkMode}
            />

            <FeatureCard
              icon="◉"
              title="Smart analytics"
              description="Monitor clicks and understand how your links are performing over time."
              darkMode={darkMode}
            />

            <FeatureCard
              icon="⌘"
              title="Link management"
              description="Keep your shortened URLs organized and accessible from a central dashboard."
              darkMode={darkMode}
            />

            <FeatureCard
              icon="◈"
              title="Built for sharing"
              description="Use Shortly links across websites, campaigns, social platforms, messages, and documents."
              darkMode={darkMode}
            />

            <FeatureCard
              icon="✓"
              title="Secure by design"
              description="Shortly is designed around secure connections and responsible link handling."
              darkMode={darkMode}
            />
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section
        id="use-cases"
        className={`relative z-10 border-y px-6 py-24 transition-colors duration-300 ${
          darkMode
            ? "border-slate-900 bg-slate-950/70"
            : "border-slate-300 bg-slate-100"
        }`}
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
              Built for the way you work
            </p>

            <h2
              className={`mt-4 text-3xl font-bold tracking-tight sm:text-4xl ${page.heading}`}
            >
              One link platform. Different possibilities.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            <UseCaseCard
              number="01"
              title="Creators"
              description="Share cleaner links with your audience without turning every post, bio, or campaign into a wall of characters."
              darkMode={darkMode}
            />

            <UseCaseCard
              number="02"
              title="Businesses"
              description="Create campaign-friendly URLs and use click data to understand which links are getting attention."
              darkMode={darkMode}
            />

            <UseCaseCard
              number="03"
              title="Developers"
              description="Create and manage short links as part of modern web applications and digital products."
              darkMode={darkMode}
            />
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div
            className={`rounded-3xl border p-8 transition-colors duration-300 sm:p-12 ${
              darkMode
                ? "border-slate-800 bg-slate-900/50"
                : "border-slate-300 bg-slate-100"
            }`}
          >
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
                  Why Shortly?
                </p>

                <h2
                  className={`mt-4 text-3xl font-bold tracking-tight sm:text-4xl ${page.heading}`}
                >
                  Make your links work harder.
                </h2>

                <p className={`mt-5 leading-7 ${page.muted}`}>
                  Long URLs can be difficult to share, remember, and understand.
                  Shortly turns them into compact links with useful tools behind
                  every click.
                </p>
              </div>

              <div className="space-y-3">
                <ComparisonRow
                  oldText="Long and difficult URLs"
                  newText="Clean, compact links"
                  darkMode={darkMode}
                />

                <ComparisonRow
                  oldText="Random-looking addresses"
                  newText="Custom identifiers"
                  darkMode={darkMode}
                />

                <ComparisonRow
                  oldText="No visibility after sharing"
                  newText="Click tracking"
                  darkMode={darkMode}
                />

                <ComparisonRow
                  oldText="Links scattered everywhere"
                  newText="Centralized management"
                  darkMode={darkMode}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 pb-24">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-blue-500/20 bg-blue-600 px-8 py-16 text-center shadow-2xl shadow-blue-950/30 sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to simplify your links?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-blue-100">
            Create your first Shortly link and turn a long URL into something
            cleaner, smarter, and easier to share.
          </p>

          <a
            href="#top"
            onClick={(event) => {
              event.preventDefault();

              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            className="mt-8 inline-flex rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Create a short link
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`relative z-10 border-t px-6 py-12 transition-colors duration-300 ${
          darkMode ? "border-slate-900" : "border-slate-300"
        }`}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="inline-block">
                <img src="/logo.svg" alt="Shortly" className="h-9 w-auto" />
              </Link>

              <p className={`mt-4 max-w-xs text-sm leading-6 ${page.subtle}`}>
                A simple link management platform for creating, sharing, and
                tracking short URLs.
              </p>
            </div>

            <FooterColumn
              title="Product"
              links={[
                { label: "URL Shortener", href: "/" },
                { label: "Dashboard", href: "/dashboard" },
                { label: "Analytics", href: "/analytics" },
              ]}
              darkMode={darkMode}
            />

            <FooterColumn
              title="Account"
              links={[
                { label: "Log in", href: "/login" },
                { label: "Create account", href: "/register" },
              ]}
              darkMode={darkMode}
            />

            <FooterColumn
              title="Legal"
              links={[
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
              ]}
              darkMode={darkMode}
            />
          </div>

          <div
            className={`mt-12 flex flex-col gap-3 border-t pt-6 text-sm sm:flex-row sm:items-center sm:justify-between ${
              darkMode
                ? "border-slate-900 text-slate-600"
                : "border-slate-300 text-slate-500"
            }`}
          >
            <p>© 2026 Shortly. All rights reserved. Built by Nexvius Labs.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  darkMode,
}: {
  icon: string;
  title: string;
  description: string;
  darkMode: boolean;
}) {
  return (
    <div
      className={`group rounded-2xl border p-7 transition duration-300 hover:-translate-y-1 ${
        darkMode
          ? "border-slate-800 bg-slate-900/40 hover:border-blue-500/30 hover:bg-slate-900/70"
          : "border-slate-300 bg-white hover:border-blue-300 hover:bg-slate-50"
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl border text-lg ${
          darkMode
            ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
            : "border-blue-300 bg-blue-50 text-blue-600"
        }`}
      >
        {icon}
      </div>

      <h3
        className={`mt-6 text-lg font-semibold ${
          darkMode ? "text-white" : "text-slate-950"
        }`}
      >
        {title}
      </h3>

      <p
        className={`mt-3 text-sm leading-6 transition ${
          darkMode
            ? "text-slate-500 group-hover:text-slate-400"
            : "text-slate-500 group-hover:text-slate-600"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

function UseCaseCard({
  number,
  title,
  description,
  darkMode,
}: {
  number: string;
  title: string;
  description: string;
  darkMode: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-8 transition-colors duration-300 ${
        darkMode
          ? "border-slate-800 bg-slate-900/30"
          : "border-slate-300 bg-white"
      }`}
    >
      <span className="text-sm font-semibold text-blue-500">{number}</span>

      <h3
        className={`mt-8 text-2xl font-semibold ${
          darkMode ? "text-white" : "text-slate-950"
        }`}
      >
        {title}
      </h3>

      <p
        className={`mt-4 text-sm leading-7 ${
          darkMode ? "text-slate-500" : "text-slate-600"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

function ComparisonRow({
  oldText,
  newText,
  darkMode,
}: {
  oldText: string;
  newText: string;
  darkMode: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2 sm:gap-5 ${
        darkMode
          ? "border-slate-800 bg-slate-950/70"
          : "border-slate-300 bg-white"
      }`}
    >
      <div
        className={`text-sm ${darkMode ? "text-slate-500" : "text-slate-600"}`}
      >
        <span
          className={`mr-2 ${darkMode ? "text-slate-700" : "text-slate-400"}`}
        >
          —
        </span>
        {oldText}
      </div>

      <div
        className={`text-sm font-medium ${
          darkMode ? "text-slate-200" : "text-slate-700"
        }`}
      >
        <span className="mr-2 text-blue-500">✓</span>
        {newText}
      </div>
    </div>
  );
}

function FooterColumn({
  title,
  links,
  darkMode,
}: {
  title: string;
  links: { label: string; href: string }[];
  darkMode: boolean;
}) {
  return (
    <div>
      <h3
        className={`text-sm font-semibold ${
          darkMode ? "text-slate-300" : "text-slate-700"
        }`}
      >
        {title}
      </h3>

      <div className="mt-4 space-y-3">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={`block text-sm transition ${
              darkMode
                ? "text-slate-500 hover:text-white"
                : "text-slate-500 hover:text-slate-950"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function DashboardStat({
  label,
  value,
  change,
  darkMode,
}: {
  label: string;
  value: string;
  change: string;
  darkMode: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        darkMode
          ? "border-slate-800 bg-slate-950/60"
          : "border-slate-300 bg-slate-100"
      }`}
    >
      <p
        className={`text-xs ${darkMode ? "text-slate-600" : "text-slate-400"}`}
      >
        {label}
      </p>

      <div className="mt-2 flex items-end justify-between gap-2">
        <p
          className={`text-xl font-semibold ${
            darkMode ? "text-white" : "text-slate-950"
          }`}
        >
          {value}
        </p>

        <span className="text-[10px] font-medium text-blue-500">{change}</span>
      </div>
    </div>
  );
}

function PreviewLink({
  link,
  destination,
  clicks,
  darkMode,
}: {
  link: string;
  destination: string;
  clicks: string;
  darkMode: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-blue-500">{link}</p>

        <p
          className={`mt-1 truncate text-xs ${
            darkMode ? "text-slate-600" : "text-slate-500"
          }`}
        >
          {destination}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p
          className={`text-sm font-medium ${
            darkMode ? "text-white" : "text-slate-950"
          }`}
        >
          {clicks}
        </p>

        <p
          className={`mt-1 text-[10px] ${
            darkMode ? "text-slate-600" : "text-slate-500"
          }`}
        >
          clicks
        </p>
      </div>
    </div>
  );
}

function ShareModal({
  shortUrl,
  darkMode,
  onClose,
  onCopy,
}: {
  shortUrl: string;
  darkMode: boolean;
  onClose: () => void;
  onCopy: () => Promise<void>;
}) {
  const encodedUrl = encodeURIComponent(shortUrl);
  const shareText = encodeURIComponent("Check out this link from Shortly");
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  function openShare(target: string) {
    window.open(target, "_blank", "noopener,noreferrer,width=700,height=600");
    onClose();
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: "Shortly link", url: shortUrl });
      onClose();
    } catch {
      /* user cancelled */
    }
  }

  const options = [
    {
      label: "WhatsApp",
      color: "bg-green-500 hover:bg-green-600",
      href: `https://wa.me/?text=${shareText}%20${encodedUrl}`,
      icon: (
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.004 2a9.95 9.95 0 0 0-8.47 15.1L2 22l4.9-1.526A10 10 0 1 0 12.004 2m0 18.3a8.3 8.3 0 0 1-4.23-1.157l-.303-.18-2.91.906.922-2.834-.198-.308A8.3 8.3 0 1 1 12.004 20.3" />
      ),
    },
    {
      label: "X",
      color: "bg-black hover:bg-slate-800",
      href: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`,
      icon: (
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817-5.966 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      ),
    },
    {
      label: "Facebook",
      color: "bg-blue-600 hover:bg-blue-500",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: (
        <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.4-.1c-2.4 0-4 1.5-4 4.1V10H7.7v3H10v8h3.5Z" />
      ),
    },
    {
      label: "LinkedIn",
      color: "bg-[#0A66C2] hover:bg-blue-500",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <path d="M6.5 8.2A2 2 0 1 0 6.5 4.2a2 2 0 0 0 0 4ZM4.7 9.8h3.6V20H4.7V9.8Zm5.8 0h3.4v1.4h.1c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5V20h-3.6v-4.5c0-1.1 0-2.6-1.6-2.6s-1.9 1.2-1.9 2.5V20h-3.6V9.8Z" />
      ),
    },
  ];

  const rowButton = darkMode
    ? "border-slate-700 text-slate-300 hover:border-blue-500 hover:bg-slate-800 hover:text-white"
    : "border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-slate-50 hover:text-slate-950";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl ${
          darkMode
            ? "border-slate-700 bg-slate-900 text-white"
            : "border-slate-200 bg-white text-slate-950"
        }`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 id="share-title" className="text-lg font-semibold">
              Share link
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose where to share your short link
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xl transition ${
              darkMode
                ? "text-slate-500 hover:bg-slate-800 hover:text-white"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            ×
          </button>
        </div>

        <div
          className={`mt-5 truncate rounded-xl border px-4 py-3 text-sm text-blue-500 ${
            darkMode
              ? "border-slate-800 bg-slate-950"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          {shortUrl}
        </div>

        <div className="mt-6 grid grid-cols-4 gap-3">
          {options.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => openShare(option.href)}
              className="group flex flex-col items-center gap-2"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-white transition group-hover:-translate-y-0.5 ${option.color}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  {option.icon}
                </svg>
              </span>

              <span className="text-xs text-slate-500 transition group-hover:text-blue-500">
                {option.label}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={onCopy}
            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${rowButton}`}
          >
            <span className="text-base">⧉</span>
            Copy link
          </button>

          <button
            type="button"
            onClick={() => {
              const subject = encodeURIComponent("Check out this link");
              const body = encodeURIComponent(
                `I wanted to share this link with you:\n\n${shortUrl}`,
              );

              window.location.href = `mailto:?subject=${subject}&body=${body}`;
              onClose();
            }}
            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${rowButton}`}
          >
            <span className="text-base">✉</span>
            Share via email
          </button>

          {canNativeShare && (
            <button
              type="button"
              onClick={nativeShare}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${rowButton}`}
            >
              <span className="text-base">↗</span>
              More sharing options
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
