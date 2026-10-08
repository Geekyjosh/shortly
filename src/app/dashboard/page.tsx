"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Check,
  Copy,
  ExternalLink,
  Link2,
  MoreHorizontal,
  MousePointerClick,
  Pencil,
  Plus,
  Search,
  Share2,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import ShareModal from "@/components/ShareModal";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

type UrlItem = {
  id: number;
  shortCode: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
  expiresAt: string | null;
  active: boolean;
};

type SortOption = "newest" | "oldest" | "clicks";
type StatusFilter = "all" | "active" | "inactive";

function subscribeToLocation() {
  return () => {};
}

function getOriginSnapshot() {
  return window.location.origin;
}

function getServerOriginSnapshot() {
  return "https://shortly.app";
}

function getHostSnapshot() {
  return window.location.host;
}

function getServerHostSnapshot() {
  return "shortly.app";
}

export default function Dashboard() {
  const router = useRouter();

  const origin = useSyncExternalStore(
    subscribeToLocation,
    getOriginSnapshot,
    getServerOriginSnapshot,
  );

  const host = useSyncExternalStore(
    subscribeToLocation,
    getHostSnapshot,
    getServerHostSnapshot,
  );

  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [toast, setToast] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [shareId, setShareId] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<UrlItem | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [menuId, setMenuId] = useState<number | null>(null);

  const loadUrls = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/urls", {
        cache: "no-store",
      });

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
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!data.authenticated) {
          router.replace("/login");
          return;
        }

        setLoggedIn(true);
        await loadUrls();
      } catch {
        router.replace("/login");
      }
    }

    checkAuth();
  }, [loadUrls, router]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  async function toggleStatus(id: number) {
    setActionId(id);
    setMenuId(null);

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

  async function saveEdit(
    id: number,
    url: string,
    alias: string,
    expiresAt: string,
  ) {
    setSavingEdit(true);

    try {
      const response = await fetch("/api/urls", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          url,
          alias,
          expiresAt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update link.");
      }

      setUrls((currentUrls) =>
        currentUrls.map((item) => (item.id === id ? data.url : item)),
      );

      setEditItem(null);
      setToast("Link updated successfully.");
    } catch (error) {
      setToast(
        error instanceof Error ? error.message : "Unable to update link.",
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function deleteLink(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this link? This action cannot be undone.",
    );

    if (!confirmed) return;

    setActionId(id);
    setMenuId(null);

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

      if (editItem?.id === id) {
        setEditItem(null);
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
    const link = `${origin}/${shortCode}`;

    try {
      await navigator.clipboard.writeText(link);
      setShareId(null);
      setMenuId(null);
      setToast("Link copied to clipboard.");
    } catch {
      setToast("Unable to copy link.");
    }
  }

  const filteredUrls = useMemo(() => {
    const query = search.toLowerCase().trim();

    const filtered = urls.filter((item) => {
      const matchesSearch =
        item.originalUrl.toLowerCase().includes(query) ||
        item.shortCode.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.active) ||
        (statusFilter === "inactive" && !item.active);

      return matchesSearch && matchesStatus;
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
  }, [urls, search, sort, statusFilter]);

  const totalClicks = urls.reduce((total, item) => total + item.clicks, 0);

  const activeLinks = urls.filter((item) => item.active).length;
  const inactiveLinks = urls.length - activeLinks;

  const topLink = useMemo(() => {
    if (!urls.length) return null;

    return [...urls].sort((a, b) => b.clicks - a.clicks)[0];
  }, [urls]);

  const shareItem = urls.find((item) => item.id === shareId);

  if (!loggedIn && loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <SiteHeader />

        <main className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-blue-500" />

            <p className="mt-4 text-sm shortly-muted">
              Loading your workspace...
            </p>
          </div>
        </main>

        <SiteFooter />
      </div>
    );
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
        url={shareItem ? `${origin}/${shareItem.shortCode}` : ""}
        open={Boolean(shareItem)}
        onClose={() => setShareId(null)}
      />

      {editItem && (
        <EditModal
          item={editItem}
          host={host}
          saving={savingEdit}
          onSave={saveEdit}
          onClose={() => {
            if (!savingEdit) {
              setEditItem(null);
            }
          }}
        />
      )}

      <main>
        <section className="border-b border-[var(--border)]">
          <div className="shortly-container py-10 sm:py-12">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="shortly-eyebrow">Workspace</p>

                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                  Your links
                </h1>

                <p className="mt-3 max-w-2xl text-base shortly-muted">
                  Create, organize and understand every Shortly link from one
                  focused workspace.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href="/analytics" className="shortly-button-secondary">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Link>

                <Link
                  href="/dashboard/create"
                  className="shortly-button-primary"
                >
                  <Plus className="h-4 w-4" />
                  Create link
                </Link>
              </div>
            </div>

            <nav className="mt-9 flex gap-1 overflow-x-auto border-b border-[var(--border)]">
              <Link
                href="/dashboard"
                className="relative whitespace-nowrap px-4 pb-3 pt-2 text-sm font-semibold"
              >
                Links
                <span className="absolute inset-x-4 bottom-[-1px] h-0.5 bg-blue-500" />
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
                className="whitespace-nowrap px-4 pb-3 pt-2 text-sm font-medium shortly-muted hover:text-[var(--foreground)]"
              >
                UTM Builder
              </Link>
            </nav>
          </div>
        </section>

        <section className="shortly-container py-8 sm:py-10">
          <div className="grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 xl:grid-cols-4">
            <Stat
              label="Total links"
              value={urls.length.toLocaleString()}
              helper={`${inactiveLinks} inactive`}
              icon={Link2}
            />

            <Stat
              label="Total clicks"
              value={totalClicks.toLocaleString()}
              helper="Across all links"
              icon={BarChart3}
            />

            <Stat
              label="Active links"
              value={activeLinks.toLocaleString()}
              helper="Currently redirecting"
              icon={Zap}
            />

            <Stat
              label="Top link"
              value={topLink ? topLink.clicks.toLocaleString() : "0"}
              helper={topLink ? `/${topLink.shortCode}` : "No clicks yet"}
              icon={MousePointerClick}
            />
          </div>

          <section
            className="mt-8 overflow-visible rounded-2xl border"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
            }}
          >
            <div className="border-b border-[var(--border)] p-4 sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="font-semibold">Link library</h2>

                  <p className="mt-1 text-sm shortly-subtle">
                    {filteredUrls.length} of {urls.length} links shown
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative min-w-0 sm:w-72">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 shortly-subtle" />

                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search links..."
                      className="shortly-input pl-10"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value as StatusFilter)
                    }
                    className="shortly-input sm:w-36"
                    aria-label="Filter by status"
                  >
                    <option value="all">All status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>

                  <select
                    value={sort}
                    onChange={(event) =>
                      setSort(event.target.value as SortOption)
                    }
                    className="shortly-input sm:w-40"
                    aria-label="Sort links"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="clicks">Most clicks</option>
                  </select>
                </div>
              </div>
            </div>

            {loading && (
              <div className="p-14 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-blue-500" />

                <p className="mt-4 text-sm shortly-muted">
                  Loading your links...
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="p-12 text-center">
                <p className="text-sm font-medium text-red-500">{error}</p>

                <button
                  type="button"
                  onClick={loadUrls}
                  className="shortly-button-secondary mt-5"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && filteredUrls.length === 0 && (
              <div className="p-12 text-center sm:p-16">
                <div
                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    background: "var(--brand-soft)",
                    color: "var(--brand)",
                  }}
                >
                  <Link2 className="h-5 w-5" />
                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  {search || statusFilter !== "all"
                    ? "No matching links"
                    : "Create your first short link"}
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 shortly-muted">
                  {search || statusFilter !== "all"
                    ? "Try changing your search or filters."
                    : "Your links will appear here with their status, click totals and actions."}
                </p>

                {!search && statusFilter === "all" && (
                  <Link
                    href="/dashboard/create"
                    className="shortly-button-primary mt-6"
                  >
                    <Plus className="h-4 w-4" />
                    Create link
                  </Link>
                )}
              </div>
            )}

            {!loading && !error && filteredUrls.length > 0 && (
              <>
                <div className="hidden grid-cols-[minmax(260px,1.4fr)_minmax(220px,1fr)_100px_110px_150px] gap-4 border-b border-[var(--border)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] shortly-subtle lg:grid">
                  <span>Short link</span>
                  <span>Destination</span>
                  <span>Clicks</span>
                  <span>Status</span>
                  <span className="text-right">Actions</span>
                </div>

                <div className="divide-y divide-[var(--border)]">
                  {filteredUrls.map((item) => {
                    const shortUrl = `${origin}/${item.shortCode}`;
                    const busy = actionId === item.id;

                    return (
                      <div
                        key={item.id}
                        className="group relative p-5 transition hover:bg-[var(--surface-muted)]"
                      >
                        <div className="grid gap-5 lg:grid-cols-[minmax(260px,1.4fr)_minmax(220px,1fr)_100px_110px_150px] lg:items-center lg:gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <a
                                href={shortUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`truncate text-sm font-semibold ${
                                  item.active
                                    ? "text-blue-500 hover:text-blue-400"
                                    : "shortly-muted line-through"
                                }`}
                              >
                                {host}/{item.shortCode}
                              </a>

                              <ExternalLink className="h-3.5 w-3.5 shrink-0 shortly-subtle opacity-0 transition group-hover:opacity-100" />
                            </div>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs shortly-subtle">
                              <span>
                                Created{" "}
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>

                              {item.expiresAt && (
                                <span>
                                  Expires{" "}
                                  {new Date(
                                    item.expiresAt,
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>

                          <p
                            className="min-w-0 truncate text-sm shortly-muted"
                            title={item.originalUrl}
                          >
                            {item.originalUrl}
                          </p>

                          <div>
                            <span className="text-sm font-semibold">
                              {item.clicks.toLocaleString()}
                            </span>

                            <span className="ml-1 text-xs shortly-subtle lg:hidden">
                              clicks
                            </span>
                          </div>

                          <div>
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                item.active
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-slate-500/10 shortly-muted"
                              }`}
                            >
                              {item.active ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 lg:justify-end">
                            <button
                              type="button"
                              onClick={() => copyLink(item.shortCode)}
                              disabled={busy}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] shortly-muted transition hover:bg-[var(--surface)] hover:text-[var(--foreground)] disabled:opacity-40"
                              aria-label="Copy short link"
                              title="Copy link"
                            >
                              <Copy className="h-4 w-4" />
                            </button>

                            <Link
                              href={`/analytics?link=${item.id}`}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] shortly-muted transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                              aria-label="View analytics"
                              title="Analytics"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Link>

                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setMenuId((current) =>
                                    current === item.id ? null : item.id,
                                  )
                                }
                                disabled={busy}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] shortly-muted transition hover:bg-[var(--surface)] hover:text-[var(--foreground)] disabled:opacity-40"
                                aria-label="More link actions"
                                aria-expanded={menuId === item.id}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>

                              {menuId === item.id && (
                                <div
                                  className="shortly-rise absolute right-0 top-11 z-30 w-48 rounded-xl border p-1.5 shadow-xl"
                                  style={{
                                    borderColor: "var(--border)",
                                    background: "var(--surface)",
                                  }}
                                >
                                  <MenuButton
                                    icon={Pencil}
                                    label="Edit link"
                                    onClick={() => {
                                      setEditItem(item);
                                      setMenuId(null);
                                    }}
                                  />

                                  <MenuButton
                                    icon={Share2}
                                    label="Share"
                                    onClick={() => {
                                      setShareId(item.id);
                                      setMenuId(null);
                                    }}
                                  />

                                  <MenuButton
                                    icon={Zap}
                                    label={
                                      item.active
                                        ? "Disable link"
                                        : "Activate link"
                                    }
                                    onClick={() => toggleStatus(item.id)}
                                  />

                                  <div className="my-1 border-t border-[var(--border)]" />

                                  <MenuButton
                                    icon={Trash2}
                                    label="Delete link"
                                    danger
                                    onClick={() => deleteLink(item.id)}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Stat({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: typeof Link2;
}) {
  return (
    <div className="bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm shortly-muted">{label}</p>

          <p className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
            {value}
          </p>

          <p className="mt-2 truncate text-xs shortly-subtle">{helper}</p>
        </div>

        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: "var(--brand-soft)",
            color: "var(--brand)",
          }}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-[var(--surface-muted)] ${
        danger ? "text-red-500" : "shortly-muted hover:text-[var(--foreground)]"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function EditModal({
  item,
  host,
  saving,
  onSave,
  onClose,
}: {
  item: UrlItem;
  host: string;
  saving: boolean;
  onSave: (
    id: number,
    url: string,
    alias: string,
    expiresAt: string,
  ) => Promise<void>;
  onClose: () => void;
}) {
  const [url, setUrl] = useState(item.originalUrl);
  const [alias, setAlias] = useState(item.shortCode);
  const [expiresAt, setExpiresAt] = useState(
    item.expiresAt ? new Date(item.expiresAt).toISOString().slice(0, 16) : "",
  );
  const [formError, setFormError] = useState("");

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, saving]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!url.trim()) {
      setFormError("Destination URL is required.");
      return;
    }

    try {
      new URL(url.trim());
    } catch {
      setFormError("Please enter a valid URL.");
      return;
    }

    await onSave(item.id, url.trim(), alias.trim(), expiresAt);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
      role="presentation"
      onClick={() => {
        if (!saving) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-link-title"
        onClick={(event) => event.stopPropagation()}
        className="shortly-rise max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border shadow-2xl"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface)",
        }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-5 sm:px-6">
          <div>
            <h2 id="edit-link-title" className="text-lg font-semibold">
              Edit link
            </h2>

            <p className="mt-1 text-sm shortly-muted">
              Update the destination, alias or expiration.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] shortly-muted transition hover:bg-[var(--surface-muted)] disabled:opacity-40"
            aria-label="Close edit dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          {formError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
              {formError}
            </div>
          )}

          <div>
            <label
              htmlFor="edit-url"
              className="mb-2 block text-sm font-medium"
            >
              Destination URL
            </label>

            <input
              id="edit-url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              disabled={saving}
              className="shortly-input disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="edit-alias"
              className="mb-2 block text-sm font-medium"
            >
              Custom alias
            </label>

            <div
              className="flex min-h-[46px] overflow-hidden rounded-[var(--radius-sm)] border focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
              }}
            >
              <span className="flex items-center border-r border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm shortly-subtle">
                {host}/
              </span>

              <input
                id="edit-alias"
                type="text"
                value={alias}
                onChange={(event) => setAlias(event.target.value)}
                disabled={saving}
                className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none disabled:opacity-50"
              />
            </div>

            <p className="mt-2 text-xs shortly-subtle">
              Letters, numbers, hyphens and underscores.
            </p>
          </div>

          <div>
            <label
              htmlFor="edit-expiration"
              className="mb-2 block text-sm font-medium"
            >
              Expiration date
            </label>

            <input
              id="edit-expiration"
              type="datetime-local"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
              disabled={saving}
              className="shortly-input disabled:opacity-50"
            />

            <p className="mt-2 text-xs shortly-subtle">
              Leave empty if the link should not expire.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="shortly-button-secondary disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="shortly-button-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
