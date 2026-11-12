"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronRight,
  ExternalLink,
  Globe2,
  Laptop,
  Link2,
  MonitorSmartphone,
  MousePointerClick,
  Plus,
  Radio,
  RefreshCw,
  Smartphone,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { useTheme } from "@/components/ThemeProvider";

type DateRange = "7" | "30" | "90" | "all";
type UrlItem = {
  id: number;
  shortCode: string;
  originalUrl: string;
  clicks: number;
  active: boolean;
  createdAt: string;
  expiresAt: string | null;
};
type AnalyticsClick = {
  id: number;
  urlId: number;
  shortCode: string;
  createdAt: string;
  country: string | null;
  referrer: string | null;
  userAgent: string | null;
  browser: string;
  device: string;
  operatingSystem: string;
  source: string;
};
type BreakdownItem = { name: string; clicks: number };
type CountryStat = { country: string; clicks: number };
type LinkPerformance = {
  id: number;
  shortCode: string;
  originalUrl: string;
  active: boolean;
  createdAt: string;
  totalClicks: number;
  periodClicks: number;
};
type SelectedLink = {
  id: number;
  shortCode: string;
  originalUrl: string;
  active: boolean;
  createdAt: string;
  expiresAt: string | null;
  totalClicks: number;
};
type AnalyticsResponse = {
  range: DateRange;
  selectedLink: SelectedLink | null;
  summary: {
    totalLinks: number;
    activeLinks: number;
    inactiveLinks: number;
    totalClicks: number;
    periodClicks: number;
    averageClicksPerLink: number;
    topLink: LinkPerformance | null;
  };
  totalClicks: number;
  totalLinks: number;
  urls: UrlItem[];
  clicks: AnalyticsClick[];
  countries: CountryStat[];
  clicksOverTime: { date: string; clicks: number }[];
  browsers: BreakdownItem[];
  devices: BreakdownItem[];
  operatingSystems: BreakdownItem[];
  sources: BreakdownItem[];
  linkPerformance: LinkPerformance[];
};

const countryNames: Record<string, string> = {
  AF: "Afghanistan", AL: "Albania", DZ: "Algeria", AR: "Argentina",
  AU: "Australia", AT: "Austria", BD: "Bangladesh", BE: "Belgium",
  BR: "Brazil", CA: "Canada", CL: "Chile", CN: "China", CO: "Colombia",
  HR: "Croatia", CZ: "Czech Republic", DK: "Denmark", EG: "Egypt",
  FI: "Finland", FR: "France", DE: "Germany", GH: "Ghana", GR: "Greece",
  HK: "Hong Kong", HU: "Hungary", IN: "India", ID: "Indonesia",
  IE: "Ireland", IL: "Israel", IT: "Italy", JP: "Japan", KE: "Kenya",
  MY: "Malaysia", MX: "Mexico", MA: "Morocco", NL: "Netherlands",
  NZ: "New Zealand", NG: "Nigeria", NO: "Norway", PK: "Pakistan",
  PE: "Peru", PH: "Philippines", PL: "Poland", PT: "Portugal",
  RO: "Romania", RU: "Russia", SA: "Saudi Arabia", SG: "Singapore",
  ZA: "South Africa", KR: "South Korea", ES: "Spain", SE: "Sweden",
  CH: "Switzerland", TW: "Taiwan", TZ: "Tanzania", TH: "Thailand",
  TR: "Turkey", UG: "Uganda", UA: "Ukraine", AE: "United Arab Emirates",
  GB: "United Kingdom", US: "United States", VN: "Vietnam",
  ZM: "Zambia", ZW: "Zimbabwe",
};

function subscribeToLocation(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}
function getSearchSnapshot() { return window.location.search; }
function getServerSearchSnapshot() { return ""; }
function getCountryName(code: string) {
  return code === "Unknown" ? "Unknown" : countryNames[code] || code;
}
function getCountryFlag(code: string) {
  if (!/^[A-Z]{2}$/.test(code)) return "🌐";
  return String.fromCodePoint(...code.split("").map((c) => 127397 + c.charCodeAt(0)));
}
function formatChartDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
function shortDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  });
}
function percentage(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const search = useSyncExternalStore(subscribeToLocation, getSearchSnapshot, getServerSearchSnapshot);
  const selectedLinkId = useMemo(() => {
    const raw = new URLSearchParams(search).get("link");
    const id = Number(raw);
    return raw && Number.isInteger(id) && id > 0 ? id : null;
  }, [search]);

  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("30");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadAnalytics = useCallback(async (cancelled: () => boolean) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ range: dateRange });
      if (selectedLinkId) params.set("link", String(selectedLinkId));
      const response = await fetch(`/api/analytics?${params.toString()}`, { cache: "no-store" });
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load analytics.");
      if (!cancelled()) setAnalytics(data);
    } catch (err) {
      if (!cancelled()) setError(err instanceof Error ? err.message : "Unable to load analytics.");
    } finally {
      if (!cancelled()) setLoading(false);
    }
  }, [dateRange, router, selectedLinkId]);

  useEffect(() => {
    let cancelled = false;
    loadAnalytics(() => cancelled);
    return () => { cancelled = true; };
  }, [loadAnalytics, refreshKey]);

  const periodLabel = dateRange === "all" ? "All time" : `Last ${dateRange} days`;
  const topLink = analytics?.linkPerformance?.[0] ?? null;
  const maxDailyClicks = Math.max(1, ...(analytics?.clicksOverTime.map((item) => item.clicks) ?? [1]));

  function handleLinkChange(value: string) {
    router.push(value ? `/analytics?link=${value}` : "/analytics");
  }

  if (loading && !analytics) {
    return (
      <div data-workspace-form className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <SiteHeader />
        <main className="shortly-container flex min-h-[65vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-blue-500" />
            <p className="mt-4 text-sm shortly-muted">Preparing your analytics...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <SiteHeader />
        <main className="shortly-container flex min-h-[65vh] items-center justify-center py-12">
          <div className="w-full max-w-md rounded-2xl border p-8 text-center" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <Activity className="mx-auto h-8 w-8 text-red-500" />
            <h1 className="mt-4 text-xl font-semibold">Analytics unavailable</h1>
            <p className="mt-2 text-sm text-red-500">{error}</p>
            <button onClick={() => setRefreshKey((v) => v + 1)} className="shortly-button-primary mt-6">Try again</button>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />
      <main>
        <section className="border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="shortly-container pt-7 sm:pt-9">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] shortly-subtle">
                  Workspace / Performance
                </div>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Analytics</h1>
                <p className="mt-2 max-w-2xl text-sm shortly-muted">
                  {analytics.selectedLink
                    ? `A closer look at the performance of /${analytics.selectedLink.shortCode}.`
                    : "A clear picture of your audience, traffic and link performance."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setRefreshKey((v) => v + 1)} className="shortly-button-secondary" disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
                </button>
                <Link href="/dashboard/create" className="shortly-button-primary"><Plus className="h-4 w-4" /> Create link</Link>
              </div>
            </div>
            <nav className="mt-7 flex gap-1 overflow-x-auto border-b border-[var(--border)]" aria-label="Workspace navigation">
              {[
                { href: "/dashboard", label: "Links" },
                { href: "/analytics", label: "Analytics", active: true },
                { href: "/dashboard/create", label: "Create" },
                { href: "/dashboard/bulk", label: "Bulk tools" },
                { href: "/dashboard/utm", label: "UTM builder" },
              ].map((item) => (
                <Link key={item.href} href={item.href} className={`relative whitespace-nowrap px-4 py-3 text-sm font-medium transition ${item.active ? "text-[var(--foreground)]" : "shortly-muted hover:text-[var(--foreground)]"}`}>
                  {item.label}
                  {item.active && <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-blue-500" />}
                </Link>
              ))}
            </nav>
          </div>
        </section>

        <section className="shortly-container py-6 sm:py-8">
          {analytics.selectedLink && (
            <div className="mb-5 flex flex-col gap-4 rounded-xl border border-blue-500/25 bg-blue-500/[0.045] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-500">Single link report</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${analytics.selectedLink.active ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 shortly-muted"}`}>{analytics.selectedLink.active ? "Active" : "Inactive"}</span>
                </div>
                <p className="mt-1 truncate text-lg font-semibold text-blue-500">/{analytics.selectedLink.shortCode}</p>
                <p className="mt-0.5 truncate text-xs shortly-muted" title={analytics.selectedLink.originalUrl}>{analytics.selectedLink.originalUrl}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <a href={`/${analytics.selectedLink.shortCode}`} target="_blank" rel="noopener noreferrer" className="shortly-button-secondary">Open link <ExternalLink className="h-4 w-4" /></a>
                <Link href="/analytics" className="shortly-button-secondary">Clear selection</Link>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div className="flex items-center gap-2 px-1">
              <CalendarDays className="h-4 w-4 shortly-subtle" />
              <div>
                <p className="text-sm font-semibold">Reporting period</p>
                <p className="text-[11px] shortly-subtle">{periodLabel} · {analytics.summary.periodClicks.toLocaleString()} recorded clicks</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select value={analytics.selectedLink?.id ?? ""} onChange={(event) => handleLinkChange(event.target.value)} className="shortly-input sm:w-56" aria-label="Filter analytics by link">
                <option value="">All links</option>
                {analytics.urls.map((url) => <option key={url.id} value={url.id}>/{url.shortCode}</option>)}
              </select>
              <div className="flex rounded-lg border p-1" style={{ borderColor: "var(--border)", background: "var(--surface-muted)" }}>
                {([["7", "7D"], ["30", "30D"], ["90", "90D"], ["all", "All"]] as [DateRange, string][]).map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setDateRange(value)} aria-pressed={dateRange === value} className={`min-w-11 rounded-md px-3 py-2 text-xs font-semibold transition ${dateRange === value ? "bg-blue-600 text-white shadow-sm" : "shortly-muted hover:text-[var(--foreground)]"}`}>{label}</button>
                ))}
              </div>
            </div>
          </div>

          {loading && <div className="mt-3 flex items-center gap-2 text-xs shortly-subtle"><span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" /> Updating report…</div>}
          {error && <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Clicks in period" value={analytics.summary.periodClicks.toLocaleString()} helper={periodLabel} icon={MousePointerClick} accent />
            <StatCard label="All-time clicks" value={(analytics.selectedLink?.totalClicks ?? analytics.summary.totalClicks).toLocaleString()} helper={analytics.selectedLink ? "For this short link" : "Across your links"} icon={TrendingUp} />
            <StatCard label="Total links" value={analytics.summary.totalLinks.toLocaleString()} helper={`${analytics.summary.activeLinks} active · ${analytics.summary.inactiveLinks} inactive`} icon={Link2} />
            <StatCard label="Average clicks / link" value={analytics.summary.averageClicksPerLink.toLocaleString()} helper="For the selected period" icon={Activity} />
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,.8fr)]">
            <section className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <div className="flex flex-col gap-2 border-b border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold">Click activity</h2>
                  <p className="mt-1 text-xs shortly-muted">Daily clicks over the selected reporting period.</p>
                </div>
                <span className="w-fit rounded-md bg-[var(--surface-muted)] px-2.5 py-1.5 text-[11px] font-semibold shortly-muted">{periodLabel}</span>
              </div>
              {analytics.clicksOverTime.length === 0 ? <EmptyState text="No click activity recorded for this period." /> : (
                <div className="h-[290px] px-2 pb-3 pt-5 sm:h-[330px] sm:px-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.clicksOverTime.map((item) => ({ ...item, label: formatChartDate(item.date) }))} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#263449" : "#e7edf4"} vertical={false} />
                      <XAxis dataKey="label" stroke={darkMode ? "#718096" : "#94a3b8"} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={18} />
                      <YAxis allowDecimals={false} domain={[0, "auto"]} stroke={darkMode ? "#718096" : "#94a3b8"} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={34} />
                      <Tooltip contentStyle={{ backgroundColor: darkMode ? "#101c2d" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#dbe3ed"}`, borderRadius: "9px", color: darkMode ? "#fff" : "#0f172a", fontSize: "12px" }} labelStyle={{ color: darkMode ? "#cbd5e1" : "#475569" }} />
                      <Line type="monotone" dataKey="clicks" name="Clicks" stroke={darkMode ? "#60a5fa" : "#2563eb"} strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] px-5 py-3 text-[11px] shortly-subtle">
                <span>{analytics.clicksOverTime.length.toLocaleString()} days with reporting data</span>
                <span>Peak day: {maxDailyClicks.toLocaleString()} clicks</span>
              </div>
            </section>

            <section className="flex flex-col overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <div className="border-b border-[var(--border)] px-5 py-4">
                <h2 className="font-semibold">Leading link</h2>
                <p className="mt-1 text-xs shortly-muted">Your strongest performer in this period.</p>
              </div>
              {topLink ? (
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-blue-500/10 px-2 py-1 text-[11px] font-semibold text-blue-500">#1 performer</span>
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="mt-5 break-all text-2xl font-semibold tracking-tight text-blue-500">/{topLink.shortCode}</p>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 shortly-muted" title={topLink.originalUrl}>{topLink.originalUrl}</p>
                  <div className="mt-6 border-t border-[var(--border)] pt-4">
                    <p className="text-3xl font-semibold tracking-tight">{topLink.periodClicks.toLocaleString()}</p>
                    <p className="mt-1 text-xs shortly-muted">clicks · {periodLabel.toLowerCase()}</p>
                  </div>
                  <div className="mt-auto flex gap-2 pt-5">
                    <Link href={`/analytics?link=${topLink.id}`} className="shortly-button-secondary flex-1">View report <ChevronRight className="h-4 w-4" /></Link>
                    <a href={`/${topLink.shortCode}`} target="_blank" rel="noopener noreferrer" aria-label="Open leading link" className="shortly-button-secondary"><ExternalLink className="h-4 w-4" /></a>
                  </div>
                </div>
              ) : <div className="flex flex-1 items-center p-5"><EmptyState text="Your top link will appear when you have link activity." /></div>}
            </section>
          </div>

          {!analytics.selectedLink && (
            <section className="mt-5 overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <div className="flex flex-col gap-2 border-b border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div><h2 className="font-semibold">Link performance</h2><p className="mt-1 text-xs shortly-muted">Compare every link by clicks in this period.</p></div>
                <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-500 hover:underline">Manage links <ChevronRight className="h-3.5 w-3.5" /></Link>
              </div>
              {analytics.linkPerformance.length === 0 ? <EmptyState text="Create your first short link to start tracking performance." /> : (
                <div className="divide-y divide-[var(--border)]">
                  {analytics.linkPerformance.slice(0, 8).map((item, index) => {
                    const share = percentage(item.periodClicks, analytics.summary.periodClicks);
                    return (
                      <div key={item.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_110px_110px] sm:items-center">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--surface-muted)] text-xs font-semibold shortly-subtle">{index + 1}</span>
                          <div className="min-w-0">
                            <Link href={`/analytics?link=${item.id}`} className="text-sm font-semibold text-blue-500 hover:underline">/{item.shortCode}</Link>
                            <p className="mt-1 truncate text-xs shortly-subtle" title={item.originalUrl}>{item.originalUrl}</p>
                            <div className="mt-2 h-1.5 max-w-[360px] overflow-hidden rounded-full bg-[var(--surface-muted)]"><div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.max(share, item.periodClicks > 0 ? 1 : 0)}%` }} /></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2 sm:block sm:text-right"><p className="text-sm font-semibold">{item.periodClicks.toLocaleString()}</p><p className="text-[11px] shortly-subtle">period clicks</p></div>
                        <div className="flex items-center justify-between gap-2 sm:block sm:text-right"><p className="text-sm font-semibold">{item.totalClicks.toLocaleString()}</p><p className="text-[11px] shortly-subtle">all-time clicks</p></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            <section className="rounded-xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <div className="flex items-start justify-between gap-3">
                <div><h2 className="font-semibold">Audience locations</h2><p className="mt-1 text-xs shortly-muted">Countries generating link visits.</p></div>
                <Globe2 className="h-5 w-5 text-blue-500" />
              </div>
              <div className="mt-5 space-y-4">
                {analytics.countries.length === 0 ? <EmptyState text="No geographic data available for this period." /> : analytics.countries.slice(0, 8).map(({ country, clicks }) => (
                  <MetricRow key={country} label={<><span className="mr-2">{getCountryFlag(country)}</span>{getCountryName(country)}</>} value={clicks} percentage={percentage(clicks, analytics.summary.periodClicks)} />
                ))}
              </div>
            </section>
            <BreakdownCard icon={Radio} title="Traffic sources" description="Where visitors came from before opening your links." stats={analytics.sources} total={analytics.summary.periodClicks} />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <BreakdownCard icon={MonitorSmartphone} title="Devices" description="Device types used by visitors." stats={analytics.devices} total={analytics.summary.periodClicks} />
            <BreakdownCard icon={BarChart3} title="Browsers" description="Browsers used to open your links." stats={analytics.browsers} total={analytics.summary.periodClicks} />
            <BreakdownCard icon={Laptop} title="Operating systems" description="Platforms used to access your links." stats={analytics.operatingSystems} total={analytics.summary.periodClicks} />
          </div>

          <section className="mt-5 overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div className="flex flex-col gap-2 border-b border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="font-semibold">Recent click activity</h2><p className="mt-1 text-xs shortly-muted">The latest recorded visits in this reporting period.</p></div>
              <span className="w-fit rounded-md bg-[var(--surface-muted)] px-2.5 py-1.5 text-[11px] font-semibold shortly-muted">{Math.min(analytics.clicks.length, 50)} events shown</span>
            </div>
            {analytics.clicks.length === 0 ? <EmptyState text="No clicks have been recorded for this period." /> : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[850px] text-left">
                    <thead className="bg-[var(--surface-muted)] text-[10px] font-semibold uppercase tracking-[0.1em] shortly-subtle"><tr><th className="px-5 py-3">Short link</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Device</th><th className="px-4 py-3">Browser / OS</th><th className="px-4 py-3">Source</th><th className="px-5 py-3">Visited</th></tr></thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {analytics.clicks.slice(0, 50).map((click) => (
                        <tr key={click.id} className="transition hover:bg-[var(--surface-muted)]">
                          <td className="px-5 py-3.5"><Link href={`/analytics?link=${click.urlId}`} className="text-sm font-semibold text-blue-500 hover:underline">/{click.shortCode}</Link></td>
                          <td className="px-4 py-3.5 text-sm shortly-muted">{getCountryFlag(click.country || "Unknown")} {getCountryName(click.country || "Unknown")}</td>
                          <td className="px-4 py-3.5 text-sm shortly-muted">{click.device}</td>
                          <td className="px-4 py-3.5"><p className="text-sm shortly-muted">{click.browser}</p><p className="mt-0.5 text-[11px] shortly-subtle">{click.operatingSystem}</p></td>
                          <td className="max-w-[180px] truncate px-4 py-3.5 text-sm shortly-muted">{click.source}</td>
                          <td className="whitespace-nowrap px-5 py-3.5 text-xs shortly-subtle">{new Date(click.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="divide-y divide-[var(--border)] md:hidden">
                  {analytics.clicks.slice(0, 50).map((click) => (
                    <div key={click.id} className="px-4 py-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <Link href={`/analytics?link=${click.urlId}`} className="text-sm font-semibold text-blue-500">/{click.shortCode}</Link>
                        <span className="text-[11px] shortly-subtle">{shortDate(click.createdAt)}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs shortly-muted">
                        <span>{getCountryFlag(click.country || "Unknown")} {getCountryName(click.country || "Unknown")}</span><span>{click.device}</span><span>{click.browser}</span><span>{click.operatingSystem}</span>
                      </div>
                      <p className="mt-1 truncate text-[11px] shortly-subtle">Source: {click.source}</p>
                    </div>
                  ))}
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

function StatCard({ label, value, helper, icon: Icon, accent = false }: {
  label: string; value: string; helper: string; icon: typeof Link2; accent?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl border p-4 sm:p-5 ${accent ? "border-blue-500/30 bg-blue-600 text-white" : "bg-[var(--surface)]"}`} style={!accent ? { borderColor: "var(--border)" } : undefined}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-xs font-medium ${accent ? "text-blue-100" : "shortly-muted"}`}>{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{value}</p>
          <p className={`mt-1.5 text-[11px] ${accent ? "text-blue-100/80" : "shortly-subtle"}`}>{helper}</p>
        </div>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent ? "bg-white/15 text-white" : "text-blue-500"}`} style={!accent ? { background: "var(--brand-soft)" } : undefined}><Icon className="h-4 w-4" /></span>
      </div>
    </div>
  );
}

function MetricRow({ label, value, percentage: percent }: {
  label: React.ReactNode; value: number; percentage: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-sm shortly-muted">{label}</span>
        <span className="shrink-0 text-right"><strong className="text-sm font-semibold">{value.toLocaleString()}</strong><span className="ml-2 text-[11px] shortly-subtle">{percent}%</span></span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]"><div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.max(percent, value > 0 ? 1.5 : 0)}%` }} /></div>
    </div>
  );
}

function BreakdownCard({ icon: Icon, title, description, stats, total }: {
  icon: typeof Radio | typeof BarChart3 | typeof MonitorSmartphone | typeof Laptop | typeof Smartphone;
  title: string; description: string; stats: BreakdownItem[]; total: number;
}) {
  return (
    <section className="rounded-xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="flex items-start justify-between gap-3">
        <div><h2 className="font-semibold">{title}</h2><p className="mt-1 text-xs shortly-muted">{description}</p></div>
        <Icon className="h-5 w-5 shrink-0 text-blue-500" />
      </div>
      <div className="mt-5 space-y-4">
        {stats.length === 0 ? <EmptyState text={`No ${title.toLowerCase()} data available for this period.`} /> : stats.slice(0, 6).map((item) => (
          <MetricRow key={item.name} label={item.name} value={item.clicks} percentage={percentage(item.clicks, total)} />
        ))}
      </div>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-5 py-7 text-center"><p className="text-sm shortly-subtle">{text}</p></div>;
}
