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
  RefreshCw,
  ArrowUpRight,
  CalendarDays,
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
      <div data-workspace-form className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <SiteHeader />
        <main className="shortly-container flex min-h-[62vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-blue-500" />
            <p className="mt-4 text-sm shortly-muted">Preparing your workspace...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const clickRate = urls.length ? Math.round((activeLinks / urls.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      {toast && (
        <div role="status" aria-live="polite" className="shortly-rise fixed right-4 top-20 z-[90] flex max-w-sm items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}><Check className="h-3.5 w-3.5" /></span>
          {toast}
        </div>
      )}

      <ShareModal url={shareItem ? `${origin}/${shareItem.shortCode}` : ""} open={Boolean(shareItem)} onClose={() => setShareId(null)} />

      {editItem && (
        <EditModal item={editItem} host={host} saving={savingEdit} onSave={saveEdit} onClose={() => { if (!savingEdit) setEditItem(null); }} />
      )}

      <main className="shortly-container pb-12 pt-6 sm:pt-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium shortly-muted">
            Workspace <span className="shortly-subtle">/</span> Link library
          </div>
          <button type="button" onClick={loadUrls} disabled={loading} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] px-3 text-xs font-semibold shortly-muted transition hover:bg-[var(--surface)] hover:text-[var(--foreground)] disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh data
          </button>
        </div>

        <section className="overflow-hidden rounded-2xl bg-[#0b1730] text-white shadow-[0_12px_32px_rgba(2,6,23,.14)]">
          <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[1fr_300px] lg:items-center lg:p-8">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-blue-300/20 bg-blue-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-blue-200">Your workspace</span>
                <span className="text-[11px] text-slate-400">SHORTLY / LINKS</span>
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-[2.65rem]">Manage every link.<br className="hidden sm:block" /> See what gets clicked.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Your links, activity and controls in one place. Pick up where you left off.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/dashboard/create" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"><Plus className="h-4 w-4" /> Create a link</Link>
                <Link href="/analytics" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/20 px-4 text-sm font-semibold text-white transition hover:bg-white/10"><BarChart3 className="h-4 w-4" /> View analytics</Link>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">Link availability</span>
                <span className="font-mono text-xs text-blue-300">{clickRate}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${clickRate}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400">{activeLinks} active</span>
                <span className="text-slate-400">{inactiveLinks} inactive</span>
              </div>
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Most clicked link</p>
                {topLink ? (
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">/{topLink.shortCode}</p>
                      <p className="mt-1 text-xs text-slate-400">{topLink.clicks.toLocaleString()} clicks</p>
                    </div>
                    <Link href={`/analytics?link=${topLink.id}`} aria-label="View top link analytics" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 text-blue-200 transition hover:bg-white/10"><ArrowUpRight className="h-4 w-4" /></Link>
                  </div>
                ) : <p className="mt-2 text-sm text-slate-400">Your best-performing link will appear here.</p>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10">
            <div className="px-4 py-3 sm:px-7"><p className="text-lg font-semibold">{urls.length.toLocaleString()}</p><p className="mt-0.5 text-[10px] text-slate-400 sm:text-xs">Total links</p></div>
            <div className="px-4 py-3 sm:px-7"><p className="text-lg font-semibold">{totalClicks.toLocaleString()}</p><p className="mt-0.5 text-[10px] text-slate-400 sm:text-xs">All-time clicks</p></div>
            <div className="px-4 py-3 sm:px-7"><p className="text-lg font-semibold">{activeLinks.toLocaleString()}</p><p className="mt-0.5 text-[10px] text-slate-400 sm:text-xs">Currently active</p></div>
          </div>
        </section>

        <nav aria-label="Workspace sections" className="mt-6 flex gap-1 overflow-x-auto border-b border-[var(--border)]">
          <Link href="/dashboard" aria-current="page" className="relative whitespace-nowrap px-4 py-3 text-sm font-semibold text-[var(--foreground)]">Links<span className="absolute inset-x-4 bottom-0 h-0.5 bg-blue-600" /></Link>
          <Link href="/analytics" className="whitespace-nowrap rounded-t-lg px-4 py-3 text-sm font-medium shortly-muted transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]">Analytics</Link>
          <Link href="/dashboard/create" className="whitespace-nowrap rounded-t-lg px-4 py-3 text-sm font-medium shortly-muted transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]">Create</Link>
          <Link href="/dashboard/bulk" className="whitespace-nowrap rounded-t-lg px-4 py-3 text-sm font-medium shortly-muted transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]">Bulk tools</Link>
          <Link href="/dashboard/utm" className="whitespace-nowrap rounded-t-lg px-4 py-3 text-sm font-medium shortly-muted transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]">UTM builder</Link>
        </nav>

        <section className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Stat label="Total links" value={urls.length.toLocaleString()} helper={`${inactiveLinks} inactive`} icon={Link2} />
          <Stat label="Total clicks" value={totalClicks.toLocaleString()} helper="Across all your links" icon={BarChart3} />
          <Stat label="Active links" value={activeLinks.toLocaleString()} helper="Currently redirecting" icon={Zap} />
          <Stat label="Top link clicks" value={topLink ? topLink.clicks.toLocaleString() : "0"} helper={topLink ? `/${topLink.shortCode}` : "No clicks recorded"} icon={MousePointerClick} />
        </section>

        <section className="mt-6 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] p-4 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2"><h2 className="text-base font-semibold">Your link library</h2><span className="rounded-md bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-semibold shortly-muted">{urls.length}</span></div>
                  <p className="mt-1 text-xs shortly-subtle">{filteredUrls.length} results · Search, filter and manage your URLs</p>
                </div>
                <Link href="/dashboard/create" className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700 sm:hidden"><Plus className="h-3.5 w-3.5" /> New</Link>
              </div>
              <div className="grid gap-2 sm:grid-cols-[minmax(190px,1fr)_auto] xl:w-auto">
                <div className="relative min-w-0 sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 shortly-subtle" />
                  <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by URL or alias" className="shortly-input pl-10" />
                </div>
                <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)} className="shortly-input sm:w-40" aria-label="Sort links">
                  <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="clicks">Most clicks</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {(["all", "active", "inactive"] as StatusFilter[]).map((status) => {
                const count = status === "all" ? urls.length : status === "active" ? activeLinks : inactiveLinks;
                const selected = statusFilter === status;
                return <button key={status} type="button" onClick={() => setStatusFilter(status)} aria-pressed={selected} className={`inline-flex min-h-8 items-center gap-2 rounded-md border px-3 text-xs font-semibold capitalize transition ${selected ? "border-blue-600 bg-blue-600 text-white" : "border-[var(--border)] shortly-muted hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]"}`}>{status}<span className={`text-[10px] ${selected ? "text-blue-100" : "shortly-subtle"}`}>{count}</span></button>;
              })}
              {(search || statusFilter !== "all") && <button type="button" onClick={() => { setSearch(""); setStatusFilter("all"); }} className="ml-auto text-xs font-semibold text-blue-600 hover:underline">Clear filters</button>}
            </div>
          </div>

          {loading && <div className="p-12 text-center"><div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[var(--border)] border-t-blue-500" /><p className="mt-3 text-sm shortly-muted">Loading your links...</p></div>}
          {!loading && error && <div className="p-10 text-center"><p className="text-sm font-medium text-red-500">{error}</p><button type="button" onClick={loadUrls} className="shortly-button-secondary mt-4">Try again</button></div>}
          {!loading && !error && filteredUrls.length === 0 && (
            <div className="px-5 py-12 text-center sm:py-16">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]"><Link2 className="h-5 w-5" /></div>
              <h3 className="mt-4 text-base font-semibold">{search || statusFilter !== "all" ? "No matching links" : "Your link library is empty"}</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 shortly-muted">{search || statusFilter !== "all" ? "Try another search or change the status filter." : "Create your first short URL and it will appear here, ready to manage and track."}</p>
              {search || statusFilter !== "all" ? <button type="button" onClick={() => { setSearch(""); setStatusFilter("all"); }} className="mt-4 text-sm font-semibold text-blue-600">Reset filters</button> : <Link href="/dashboard/create" className="shortly-button-primary mt-5"><Plus className="h-4 w-4" /> Create your first link</Link>}
            </div>
          )}

          {!loading && !error && filteredUrls.length > 0 && (
            <>
              <div className="hidden grid-cols-[minmax(210px,1.25fr)_minmax(180px,1fr)_75px_95px_132px] gap-4 border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.1em] shortly-subtle lg:grid">
                <span>Short link</span><span>Destination</span><span>Clicks</span><span>Status</span><span className="text-right">Actions</span>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {filteredUrls.map((item) => {
                  const shortUrl = `${origin}/${item.shortCode}`;
                  const busy = actionId === item.id;
                  return (
                    <article key={item.id} className="group px-4 py-4 transition-colors hover:bg-[var(--surface-muted)] sm:px-5">
                      <div className="grid gap-3 lg:grid-cols-[minmax(210px,1.25fr)_minmax(180px,1fr)_75px_95px_132px] lg:items-center lg:gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <a href={shortUrl} target="_blank" rel="noopener noreferrer" className={`truncate text-sm font-semibold ${item.active ? "text-blue-600 hover:text-blue-500" : "shortly-muted line-through"}`}>{host}/{item.shortCode}</a>
                            <ExternalLink className="h-3 w-3 shrink-0 shortly-subtle opacity-0 transition group-hover:opacity-100" />
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] shortly-subtle"><span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />{new Date(item.createdAt).toLocaleDateString()}</span>{item.expiresAt && <span>Expires {new Date(item.expiresAt).toLocaleDateString()}</span>}</div>
                        </div>
                        <p className="min-w-0 truncate text-xs shortly-muted" title={item.originalUrl}>{item.originalUrl}</p>
                        <div className="flex items-baseline gap-1 lg:block"><span className="text-sm font-semibold tabular-nums">{item.clicks.toLocaleString()}</span><span className="text-[10px] shortly-subtle lg:hidden">clicks</span></div>
                        <div><span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold ${item.active ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 shortly-muted"}`}><span className={`h-1.5 w-1.5 rounded-full ${item.active ? "bg-emerald-500" : "bg-slate-400"}`} />{item.active ? "Active" : "Inactive"}</span></div>
                        <div className="flex items-center gap-1.5 lg:justify-end">
                          <button type="button" onClick={() => copyLink(item.shortCode)} disabled={busy} className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] shortly-muted transition hover:border-blue-500/40 hover:bg-[var(--surface)] hover:text-blue-600 disabled:opacity-40" aria-label="Copy short link" title="Copy link"><Copy className="h-4 w-4" /></button>
                          <Link href={`/analytics?link=${item.id}`} className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] shortly-muted transition hover:border-blue-500/40 hover:bg-[var(--surface)] hover:text-blue-600" aria-label="View analytics" title="Analytics"><BarChart3 className="h-4 w-4" /></Link>
                          <div className="relative">
                            <button type="button" onClick={() => setMenuId((current) => current === item.id ? null : item.id)} disabled={busy} className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] shortly-muted transition hover:bg-[var(--surface)] hover:text-[var(--foreground)] disabled:opacity-40" aria-label="More link actions" aria-expanded={menuId === item.id}><MoreHorizontal className="h-4 w-4" /></button>
                            {menuId === item.id && <div className="shortly-rise absolute right-0 top-10 z-30 w-48 rounded-lg border p-1.5 shadow-xl" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                              <MenuButton icon={Pencil} label="Edit link" onClick={() => { setEditItem(item); setMenuId(null); }} />
                              <MenuButton icon={Share2} label="Share" onClick={() => { setShareId(item.id); setMenuId(null); }} />
                              <MenuButton icon={Zap} label={item.active ? "Disable link" : "Activate link"} onClick={() => toggleStatus(item.id)} />
                              <div className="my-1 border-t border-[var(--border)]" />
                              <MenuButton icon={Trash2} label="Delete link" danger onClick={() => deleteLink(item.id)} />
                            </div>}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
          <div className="flex flex-col gap-2 border-t border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-[11px] shortly-subtle sm:flex-row sm:items-center sm:justify-between">
            <span>Showing {filteredUrls.length} of {urls.length} links</span>
            <span>Manage destinations, status and sharing from each link's actions.</span>
          </div>
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
