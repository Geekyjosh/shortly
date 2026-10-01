"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Mail, Share2, X } from "lucide-react";

type UrlItem = {
  id: number;
  shortCode: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
  expiresAt: string | null;
  active: boolean;
};

type ShareModalProps = {
  url: string;
  onCopy: () => void;
  onClose: () => void;
};

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.004 2a9.95 9.95 0 0 0-8.47 15.1L2 22l4.9-1.526A10 10 0 1 0 12.004 2m0 18.3a8.3 8.3 0 0 1-4.23-1.157l-.303-.18-2.91.906.922-2.834-.198-.308A8.3 8.3 0 1 1 12.004 20.3" />
    </svg>
  );
}

function XBrandIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817-5.966 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.4-.1c-2.4 0-4 1.5-4 4.1V10H7.7v3H10v8h3.5Z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M6.5 8.2A2 2 0 1 0 6.5 4.2a2 2 0 0 0 0 4ZM4.7 9.8h3.6V20H4.7V9.8Zm5.8 0h3.4v1.4h.1c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5V20h-3.6v-4.5c0-1.1 0-2.6-1.6-2.6s-1.9 1.2-1.9 2.5V20h-3.6V9.8Z" />
    </svg>
  );
}

function ShareModal({ url, onCopy, onClose }: ShareModalProps) {
  const encodedUrl = encodeURIComponent(url);
  const shareText = encodeURIComponent("Check out this link");

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  function openShare(target: string) {
    window.open(target, "_blank", "noopener,noreferrer,width=700,height=600");

    onClose();
  }

  async function nativeShare() {
    if (!navigator.share) return;

    try {
      await navigator.share({
        title: "Shortly link",
        url,
      });

      onClose();
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        onClose();
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-dialog-title"
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Share2 className="h-5 w-5" />
            </div>

            <div>
              <h2 id="share-dialog-title" className="font-semibold text-white">
                Share link
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Share your shortened URL
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close share dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
            <p className="truncate text-sm text-blue-400">{url}</p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() =>
                openShare(`https://wa.me/?text=${shareText}%20${encodedUrl}`)
              }
              className="group flex flex-col items-center gap-2"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-400 transition group-hover:bg-green-500/20 group-hover:scale-105">
                <WhatsAppIcon />
              </span>

              <span className="text-xs text-slate-400 transition group-hover:text-white">
                WhatsApp
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                openShare(
                  `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`,
                )
              }
              className="group flex flex-col items-center gap-2"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white transition group-hover:bg-white/10 group-hover:scale-105">
                <XBrandIcon />
              </span>

              <span className="text-xs text-slate-400 transition group-hover:text-white">
                X
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                openShare(
                  `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
                )
              }
              className="group flex flex-col items-center gap-2"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition group-hover:bg-blue-500/20 group-hover:scale-105">
                <FacebookIcon />
              </span>

              <span className="text-xs text-slate-400 transition group-hover:text-white">
                Facebook
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                openShare(
                  `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
                )
              }
              className="group flex flex-col items-center gap-2"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition group-hover:bg-blue-500/20 group-hover:scale-105">
                <LinkedinIcon />
              </span>

              <span className="text-xs text-slate-400 transition group-hover:text-white">
                LinkedIn
              </span>
            </button>
          </div>

          <div className="mt-7 space-y-3">
            <button
              type="button"
              onClick={() =>
                openShare(`mailto:?subject=${shareText}&body=${encodedUrl}`)
              }
              className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-left transition hover:border-slate-700 hover:bg-slate-800"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                <Mail className="h-5 w-5" />
              </span>

              <span>
                <span className="block text-sm font-medium text-slate-300">
                  Share via email
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Open your default email app
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={onCopy}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-left transition hover:border-slate-700 hover:bg-slate-800"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <Copy className="h-5 w-5" />
              </span>

              <span>
                <span className="block text-sm font-medium text-slate-300">
                  Copy link
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Copy the shortened URL to your clipboard
                </span>
              </span>
            </button>

            {typeof navigator !== "undefined" &&
              typeof navigator.share === "function" && (
                <button
                  type="button"
                  onClick={nativeShare}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-left transition hover:border-slate-700 hover:bg-slate-800"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Share2 className="h-5 w-5" />
                  </span>

                  <span>
                    <span className="block text-sm font-medium text-slate-300">
                      More sharing options
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      Use your device&apos;s native share menu
                    </span>
                  </span>
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [toast, setToast] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [shareId, setShareId] = useState<number | null>(null);

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

      setLoggedIn(true);
      await loadUrls();
    } catch {
      window.location.href = "/login";
    }
  }

  async function loadUrls() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/urls");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load your links.");
      }

      setUrls(data.urls || []);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to load your links.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(id: number) {
    setActionId(id);

    try {
      const response = await fetch("/api/urls", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update link.");
      }

      setUrls((currentUrls) =>
        currentUrls.map((item) =>
          item.id === id
            ? {
                ...item,
                active: data.url.active,
              }
            : item,
        ),
      );

      setToast(
        data.url.active
          ? "Link activated successfully."
          : "Link disabled successfully.",
      );
    } catch (error) {
      setToast(
        error instanceof Error ? error.message : "Unable to update link.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function deleteLink(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this link? This action cannot be undone.",
    );

    if (!confirmed) return;

    setActionId(id);

    try {
      const response = await fetch("/api/urls", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete link.");
      }

      setUrls((currentUrls) => currentUrls.filter((item) => item.id !== id));

      if (shareId === id) {
        setShareId(null);
      }

      setToast("Link deleted successfully.");
    } catch (error) {
      setToast(
        error instanceof Error ? error.message : "Unable to delete link.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function copyLink(shortCode: string) {
    const link = `${window.location.origin}/${shortCode}`;

    try {
      await navigator.clipboard.writeText(link);
      setShareId(null);
      setToast("Link copied to clipboard.");
    } catch {
      setToast("Unable to copy link.");
    }
  }

  const filteredUrls = useMemo(() => {
    const query = search.toLowerCase().trim();

    const filtered = urls.filter((item) => {
      return (
        item.originalUrl.toLowerCase().includes(query) ||
        item.shortCode.toLowerCase().includes(query)
      );
    });

    return [...filtered].sort((a, b) => {
      if (sort === "oldest") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }

      if (sort === "clicks") {
        return b.clicks - a.clicks;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [urls, search, sort]);

  const totalClicks = urls.reduce((total, item) => total + item.clicks, 0);

  const activeLinks = urls.filter((item) => item.active).length;

  const shareItem = urls.find((item) => item.id === shareId);

  if (!loggedIn && loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />

          <p className="mt-4 text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {toast && (
        <div className="fixed right-6 top-6 z-[200] rounded-xl border border-slate-700 bg-slate-900/95 px-5 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur">
          <span className="mr-2 text-blue-400">
            <Check className="inline h-4 w-4" />
          </span>

          {toast}
        </div>
      )}

      {shareItem && (
        <ShareModal
          url={`${window.location.origin}/${shareItem.shortCode}`}
          onCopy={() => copyLink(shareItem.shortCode)}
          onClose={() => setShareId(null)}
        />
      )}

      <header className="border-b border-slate-800 bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/dashboard"
            className="text-lg font-bold tracking-tight text-blue-400"
          >
            Shortly
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              Home
            </Link>

            <Link href="/dashboard" className="text-sm font-medium text-white">
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

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
              Link management
            </p>

            <h1 className="text-4xl font-bold tracking-tight">Your links</h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Create, manage and share all your shortened URLs from one place.
            </p>
          </div>

          <Link
            href="/dashboard/create"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium transition hover:bg-blue-500"
          >
            Create short link
          </Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Total links</p>

            <p className="mt-3 text-3xl font-bold">{urls.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Total clicks</p>

            <p className="mt-3 text-3xl font-bold">{totalClicks}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Active links</p>

            <p className="mt-3 text-3xl font-bold">{activeLinks}</p>
          </div>
        </div>

        <section className="overflow-visible rounded-2xl border border-slate-800 bg-slate-900">
          <div className="flex flex-col gap-4 border-b border-slate-800 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold">Short links</h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage and share your links.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search links..."
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm outline-none placeholder:text-slate-500 focus:border-blue-500"
              />

              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-blue-500"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="clicks">Most clicks</option>
              </select>
            </div>
          </div>

          {loading && (
            <div className="p-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />

              <p className="mt-4 text-sm text-slate-500">
                Loading your links...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="p-12 text-center">
              <p className="text-red-400">{error}</p>

              <button
                type="button"
                onClick={loadUrls}
                className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-blue-500 hover:text-white"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && filteredUrls.length === 0 && (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 text-2xl">
                🔗
              </div>

              <h3 className="mt-5 font-semibold">
                {search ? "No links found" : "No short links yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {search
                  ? "Try a different search term."
                  : "Create your first shortened URL and it will appear here."}
              </p>

              {!search && (
                <Link
                  href="/dashboard/create"
                  className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium transition hover:bg-blue-500"
                >
                  Create your first link
                </Link>
              )}
            </div>
          )}

          {!loading && !error && filteredUrls.length > 0 && (
            <div className="divide-y divide-slate-800">
              {filteredUrls.map((item) => {
                const shortUrl = `${window.location.origin}/${item.shortCode}`;
                const busy = actionId === item.id;

                return (
                  <div
                    key={item.id}
                    className="p-5 transition hover:bg-slate-950/50"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <a
                            href={shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`font-semibold transition ${
                              item.active
                                ? "text-blue-400 hover:text-blue-300"
                                : "text-slate-500 line-through"
                            }`}
                          >
                            {window.location.host}/{item.shortCode}
                          </a>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              item.active
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {item.active ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <p className="mt-2 max-w-3xl truncate text-sm text-slate-500">
                          {item.originalUrl}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                          <span>{item.clicks} clicks</span>

                          <span>
                            Created{" "}
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>

                          {item.expiresAt && (
                            <span>
                              Expires{" "}
                              {new Date(item.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => copyLink(item.shortCode)}
                          disabled={busy}
                          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:text-white disabled:opacity-50"
                        >
                          Copy
                        </button>

                        <button
                          type="button"
                          onClick={() => setShareId(item.id)}
                          disabled={busy}
                          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:text-white disabled:opacity-50"
                        >
                          Share
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleStatus(item.id)}
                          disabled={busy}
                          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-amber-500 hover:text-white disabled:opacity-50"
                        >
                          {busy
                            ? "Working..."
                            : item.active
                              ? "Disable"
                              : "Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteLink(item.id)}
                          disabled={busy}
                          className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 transition hover:border-red-500 hover:bg-red-500/10 disabled:opacity-50"
                        >
                          Delete
                        </button>

                        <a
                          href={shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                            item.active
                              ? "bg-blue-600 text-white hover:bg-blue-500"
                              : "bg-slate-800 text-slate-500"
                          }`}
                        >
                          Open
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
