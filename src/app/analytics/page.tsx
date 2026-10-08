"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Globe2,
  Laptop,
  Link2,
  MonitorSmartphone,
  MousePointerClick,
  Plus,
  Radio,
  Smartphone,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
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

type BreakdownItem = {
  name: string;
  clicks: number;
};

type CountryStat = {
  country: string;
  clicks: number;
};

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

  clicksOverTime: {
    date: string;
    clicks: number;
  }[];

  browsers: BreakdownItem[];
  devices: BreakdownItem[];
  operatingSystems: BreakdownItem[];
  sources: BreakdownItem[];
  linkPerformance: LinkPerformance[];
};

const countryNames: Record<string, string> = {
  AF: "Afghanistan",
  AL: "Albania",
  DZ: "Algeria",
  AR: "Argentina",
  AU: "Australia",
  AT: "Austria",
  BD: "Bangladesh",
  BE: "Belgium",
  BR: "Brazil",
  CA: "Canada",
  CL: "Chile",
  CN: "China",
  CO: "Colombia",
  HR: "Croatia",
  CZ: "Czech Republic",
  DK: "Denmark",
  EG: "Egypt",
  FI: "Finland",
  FR: "France",
  DE: "Germany",
  GH: "Ghana",
  GR: "Greece",
  HK: "Hong Kong",
  HU: "Hungary",
  IN: "India",
  ID: "Indonesia",
  IE: "Ireland",
  IL: "Israel",
  IT: "Italy",
  JP: "Japan",
  KE: "Kenya",
  MY: "Malaysia",
  MX: "Mexico",
  MA: "Morocco",
  NL: "Netherlands",
  NZ: "New Zealand",
  NG: "Nigeria",
  NO: "Norway",
  PK: "Pakistan",
  PE: "Peru",
  PH: "Philippines",
  PL: "Poland",
  PT: "Portugal",
  RO: "Romania",
  RU: "Russia",
  SA: "Saudi Arabia",
  SG: "Singapore",
  ZA: "South Africa",
  KR: "South Korea",
  ES: "Spain",
  SE: "Sweden",
  CH: "Switzerland",
  TW: "Taiwan",
  TZ: "Tanzania",
  TH: "Thailand",
  TR: "Turkey",
  UG: "Uganda",
  UA: "Ukraine",
  AE: "United Arab Emirates",
  GB: "United Kingdom",
  US: "United States",
  VN: "Vietnam",
  ZM: "Zambia",
  ZW: "Zimbabwe",
};

function subscribeToLocation(callback: () => void) {
  window.addEventListener("popstate", callback);

  return () => {
    window.removeEventListener("popstate", callback);
  };
}

function getSearchSnapshot() {
  return window.location.search;
}

function getServerSearchSnapshot() {
  return "";
}

function getCountryName(code: string) {
  if (code === "Unknown") {
    return "Unknown";
  }

  return countryNames[code] || code;
}

function getCountryFlag(code: string) {
  if (!/^[A-Z]{2}$/.test(code)) {
    return "🌐";
  }

  return String.fromCodePoint(
    ...code.split("").map((character) => 127397 + character.charCodeAt(0)),
  );
}

function formatChartDate(date: string) {
  const value = new Date(`${date}T00:00:00`);

  return value.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { darkMode } = useTheme();

  const search = useSyncExternalStore(
    subscribeToLocation,
    getSearchSnapshot,
    getServerSearchSnapshot,
  );

  const selectedLinkId = useMemo(() => {
    const params = new URLSearchParams(search);

    const rawLinkId = params.get("link");

    if (!rawLinkId) {
      return null;
    }

    const id = Number(rawLinkId);

    return Number.isInteger(id) && id > 0 ? id : null;
  }, [search]);

  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [dateRange, setDateRange] = useState<DateRange>("30");

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        params.set("range", dateRange);

        if (selectedLinkId) {
          params.set("link", String(selectedLinkId));
        }

        const response = await fetch(`/api/analytics?${params.toString()}`, {
          cache: "no-store",
        });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load analytics.");
        }

        if (!cancelled) {
          setAnalytics(data);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load analytics.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, [dateRange, router, selectedLinkId]);

  const periodLabel = dateRange === "all" ? "All Time" : `${dateRange} Days`;

  function handleLinkChange(value: string) {
    if (!value) {
      router.push("/analytics");
      return;
    }

    router.push(`/analytics?link=${value}`);
  }

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <SiteHeader />

        <main className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-blue-500" />

            <p className="mt-4 text-sm shortly-muted">Loading analytics...</p>
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
          <div
            className="w-full max-w-md rounded-2xl border p-8 text-center"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
            }}
          >
            <h1 className="text-xl font-semibold">Unable to load analytics</h1>

            <p className="mt-3 text-sm text-red-500">{error}</p>

            <Link href="/dashboard" className="shortly-button-primary mt-6">
              Back to links
            </Link>
          </div>
        </main>

        <SiteFooter />
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      <main>
        <section className="border-b border-[var(--border)]">
          <div className="shortly-container py-10 sm:py-12">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="shortly-eyebrow">Workspace</p>

                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                  Analytics
                </h1>

                <p className="mt-3 max-w-2xl text-base shortly-muted">
                  {analytics.selectedLink
                    ? `Performance for /${analytics.selectedLink.shortCode}.`
                    : "Understand which links get attention, where clicks come from, and how visitors access them."}
                </p>
              </div>

              <Link
                href="/dashboard/create"
                className="shortly-button-primary w-fit"
              >
                <Plus className="h-4 w-4" />
                Create link
              </Link>
            </div>

            <nav className="mt-9 flex gap-1 overflow-x-auto border-b border-[var(--border)]">
              <Link
                href="/dashboard"
                className="whitespace-nowrap px-4 pb-3 pt-2 text-sm font-medium shortly-muted hover:text-[var(--foreground)]"
              >
                Links
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
              <Link
                href="/analytics"
                className="relative whitespace-nowrap px-4 pb-3 pt-2 text-sm font-semibold"
              >
                Analytics
                <span className="absolute inset-x-4 bottom-[-1px] h-0.5 bg-blue-500" />
              </Link>

              <Link
                href="/dashboard/create"
                className="whitespace-nowrap px-4 pb-3 pt-2 text-sm font-medium shortly-muted hover:text-[var(--foreground)]"
              >
                Create
              </Link>
            </nav>
          </div>
        </section>

        <section className="shortly-container py-8 sm:py-10">
          {analytics.selectedLink && (
            <section
              className="mb-6 rounded-2xl border p-5 sm:p-6"
              style={{
                borderColor: "rgba(59, 130, 246, 0.28)",
                background: "var(--surface)",
              }}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="shortly-eyebrow">Selected link</span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        analytics.selectedLink.active
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-slate-500/10 shortly-muted"
                      }`}
                    >
                      {analytics.selectedLink.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <h2 className="mt-3 truncate text-xl font-semibold text-blue-500">
                    /{analytics.selectedLink.shortCode}
                  </h2>

                  <p
                    className="mt-2 max-w-2xl truncate text-sm shortly-muted"
                    title={analytics.selectedLink.originalUrl}
                  >
                    {analytics.selectedLink.originalUrl}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={`/${analytics.selectedLink.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shortly-button-secondary"
                  >
                    Open link
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  <Link href="/analytics" className="shortly-button-secondary">
                    View all links
                  </Link>
                </div>
              </div>
            </section>
          )}

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold">Performance overview</p>

              <p className="mt-1 text-xs shortly-subtle">{periodLabel}</p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={analytics.selectedLink?.id ?? ""}
                onChange={(event) => handleLinkChange(event.target.value)}
                className="shortly-input sm:w-64"
                aria-label="Select link"
              >
                <option value="">All links</option>

                {analytics.urls.map((url) => (
                  <option key={url.id} value={url.id}>
                    /{url.shortCode}
                  </option>
                ))}
              </select>

              <div
                className="inline-flex w-fit rounded-xl border p-1"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                }}
              >
                {[
                  ["7", "7 Days"],
                  ["30", "30 Days"],
                  ["90", "90 Days"],
                  ["all", "All Time"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDateRange(value as DateRange)}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      dateRange === value
                        ? "bg-blue-600 text-white"
                        : "shortly-muted hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading && (
            <div className="mt-4 flex items-center gap-2 text-xs shortly-subtle">
              <div className="h-3 w-3 animate-spin rounded-full border border-[var(--border)] border-t-blue-500" />
              Updating analytics...
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 xl:grid-cols-4">
            <Stat
              label={analytics.selectedLink ? "Total clicks" : "Total links"}
              value={
                analytics.selectedLink
                  ? analytics.selectedLink.totalClicks.toLocaleString()
                  : analytics.summary.totalLinks.toLocaleString()
              }
              helper={
                analytics.selectedLink
                  ? "All-time clicks"
                  : `${analytics.summary.activeLinks} active`
              }
              icon={Link2}
            />

            <Stat
              label="Clicks"
              value={analytics.summary.periodClicks.toLocaleString()}
              helper={periodLabel}
              icon={MousePointerClick}
            />

            <Stat
              label={analytics.selectedLink ? "Status" : "Active links"}
              value={
                analytics.selectedLink
                  ? analytics.selectedLink.active
                    ? "Active"
                    : "Inactive"
                  : analytics.summary.activeLinks.toLocaleString()
              }
              helper={
                analytics.selectedLink
                  ? "Current link state"
                  : "Currently redirecting"
              }
              icon={CheckCircle2}
            />

            <Stat
              label="Avg. clicks / link"
              value={analytics.summary.averageClicksPerLink.toLocaleString()}
              helper={periodLabel}
              icon={TrendingUp}
            />
          </div>

          <section
            className="mt-8 rounded-2xl border p-5 sm:p-6"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
            }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Click activity</h2>

                <p className="mt-1 text-sm shortly-muted">
                  Daily click activity during the selected period.
                </p>
              </div>

              <span className="w-fit rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium shortly-muted">
                {periodLabel}
              </span>
            </div>

            {analytics.clicksOverTime.length === 0 ? (
              <EmptyState text="No click activity for this period." />
            ) : (
              <div className="mt-7 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analytics.clicksOverTime.map((item) => ({
                      ...item,
                      label: formatChartDate(item.date),
                    }))}
                    margin={{
                      top: 8,
                      right: 8,
                      left: -22,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={darkMode ? "#1e293b" : "#e2e8f0"}
                      vertical={false}
                    />

                    <XAxis
                      dataKey="label"
                      stroke={darkMode ? "#64748b" : "#94a3b8"}
                      tick={{
                        fontSize: 11,
                      }}
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      stroke={darkMode ? "#64748b" : "#94a3b8"}
                      tick={{
                        fontSize: 11,
                      }}
                      tickLine={false}
                      axisLine={false}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? "#0f172a" : "#ffffff",
                        border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
                        borderRadius: "10px",
                        color: darkMode ? "#ffffff" : "#0f172a",
                      }}
                      labelStyle={{
                        color: darkMode ? "#cbd5e1" : "#475569",
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke={darkMode ? "#60a5fa" : "#2563eb"}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{
                        r: 5,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1.15fr_.85fr]">
            {!analytics.selectedLink && (
              <section
                className="rounded-2xl border p-5 sm:p-6"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                }}
              >
                <h2 className="text-lg font-semibold">Top links</h2>

                <p className="mt-1 text-sm shortly-muted">
                  Best-performing links for {periodLabel.toLowerCase()}.
                </p>

                <div className="mt-6">
                  {analytics.linkPerformance.length === 0 ? (
                    <EmptyState text="No links available yet." />
                  ) : (
                    analytics.linkPerformance.slice(0, 5).map((link, index) => (
                      <div
                        key={link.id}
                        className={`flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
                          index !==
                          Math.min(analytics.linkPerformance.length, 5) - 1
                            ? "border-b border-[var(--border)]"
                            : ""
                        }`}
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-xs font-semibold shortly-subtle">
                            {index + 1}
                          </span>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-blue-500">
                              /{link.shortCode}
                            </p>

                            <p
                              className="mt-1 truncate text-xs shortly-subtle"
                              title={link.originalUrl}
                            >
                              {link.originalUrl}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-semibold">
                              {link.periodClicks.toLocaleString()}
                            </p>

                            <p className="mt-1 text-[11px] shortly-subtle">
                              clicks
                            </p>
                          </div>

                          <Link
                            href={`/analytics?link=${link.id}`}
                            aria-label={`View analytics for ${link.shortCode}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] shortly-muted transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}

            <section
              className={`rounded-2xl border p-5 sm:p-6 ${
                analytics.selectedLink ? "xl:col-span-2" : ""
              }`}
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Countries</h2>

                  <p className="mt-1 text-sm shortly-muted">
                    Where clicks are coming from.
                  </p>
                </div>

                <Globe2 className="h-5 w-5 text-blue-500" />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {analytics.countries.length === 0 ? (
                  <div className="md:col-span-2">
                    <EmptyState text="No geographic data for this period." />
                  </div>
                ) : (
                  analytics.countries
                    .slice(0, 10)
                    .map(({ country, clicks }) => {
                      const percentage =
                        analytics.summary.periodClicks > 0
                          ? Math.round(
                              (clicks / analytics.summary.periodClicks) * 100,
                            )
                          : 0;

                      return (
                        <MetricRow
                          key={country}
                          label={`${getCountryFlag(country)} ${getCountryName(
                            country,
                          )}`}
                          value={clicks.toLocaleString()}
                          percentage={percentage}
                        />
                      );
                    })
                )}
              </div>
            </section>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <BreakdownCard
              icon={Radio}
              title="Traffic sources"
              description="Where visitors arrived from."
              stats={analytics.sources}
              total={analytics.summary.periodClicks}
            />

            <BreakdownCard
              icon={BarChart3}
              title="Browsers"
              description="Browsers used to open your links."
              stats={analytics.browsers}
              total={analytics.summary.periodClicks}
            />

            <BreakdownCard
              icon={MonitorSmartphone}
              title="Devices"
              description="Device types used by visitors."
              stats={analytics.devices}
              total={analytics.summary.periodClicks}
            />

            <BreakdownCard
              icon={Laptop}
              title="Operating systems"
              description="Platforms used to open your links."
              stats={analytics.operatingSystems}
              total={analytics.summary.periodClicks}
            />
          </div>

          <section
            className="mt-8 overflow-hidden rounded-2xl border"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
            }}
          >
            <div className="border-b border-[var(--border)] p-5 sm:p-6">
              <h2 className="text-lg font-semibold">Recent activity</h2>

              <p className="mt-1 text-sm shortly-muted">
                Latest click events during the selected period.
              </p>
            </div>

            {analytics.clicks.length === 0 ? (
              <div className="p-6">
                <EmptyState text="No clicks recorded for this period." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] text-left">
                  <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[11px] font-semibold uppercase tracking-[0.08em] shortly-subtle">
                    <tr>
                      <th className="px-5 py-3">Short URL</th>

                      <th className="px-5 py-3">Country</th>

                      <th className="px-5 py-3">Device</th>

                      <th className="px-5 py-3">Browser</th>

                      <th className="px-5 py-3">OS</th>

                      <th className="px-5 py-3">Source</th>

                      <th className="px-5 py-3">Date</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[var(--border)]">
                    {analytics.clicks.slice(0, 50).map((click) => (
                      <tr
                        key={click.id}
                        className="transition hover:bg-[var(--surface-muted)]"
                      >
                        <td className="px-5 py-4 text-sm font-semibold text-blue-500">
                          /{click.shortCode}
                        </td>

                        <td className="px-5 py-4 text-sm shortly-muted">
                          <span className="mr-2">
                            {getCountryFlag(click.country || "Unknown")}
                          </span>

                          {getCountryName(click.country || "Unknown")}
                        </td>

                        <td className="px-5 py-4 text-sm shortly-muted">
                          {click.device}
                        </td>

                        <td className="px-5 py-4 text-sm shortly-muted">
                          {click.browser}
                        </td>

                        <td className="px-5 py-4 text-sm shortly-muted">
                          {click.operatingSystem}
                        </td>

                        <td className="max-w-xs truncate px-5 py-4 text-sm shortly-muted">
                          {click.source}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm shortly-subtle">
                          {new Date(click.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
        <div className="min-w-0">
          <p className="text-sm shortly-muted">{label}</p>

          <p className="mt-3 truncate text-3xl font-semibold tracking-[-0.035em]">
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

function MetricRow({
  label,
  value,
  percentage,
}: {
  label: string;
  value: string;
  percentage: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <span className="truncate text-sm shortly-muted">{label}</span>

        <div className="shrink-0 text-right">
          <span className="text-sm font-semibold">{value}</span>

          <span className="ml-2 text-xs shortly-subtle">{percentage}%</span>
        </div>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
        <div
          className="h-full rounded-full bg-blue-500"
          style={{
            width: `${Math.max(percentage, percentage > 0 ? 2 : 0)}%`,
          }}
        />
      </div>
    </div>
  );
}

function BreakdownCard({
  icon: Icon,
  title,
  description,
  stats,
  total,
}: {
  icon:
    | typeof Radio
    | typeof BarChart3
    | typeof MonitorSmartphone
    | typeof Laptop
    | typeof Smartphone;

  title: string;
  description: string;
  stats: BreakdownItem[];
  total: number;
}) {
  return (
    <section
      className="rounded-2xl border p-5 sm:p-6"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>

          <p className="mt-1 text-sm shortly-muted">{description}</p>
        </div>

        <Icon className="h-5 w-5 text-blue-500" />
      </div>

      <div className="mt-6 space-y-4">
        {stats.length === 0 ? (
          <EmptyState
            text={`No ${title.toLowerCase()} data for this period.`}
          />
        ) : (
          stats.slice(0, 6).map((item) => {
            const percentage =
              total > 0 ? Math.round((item.clicks / total) * 100) : 0;

            return (
              <MetricRow
                key={item.name}
                label={item.name}
                value={item.clicks.toLocaleString()}
                percentage={percentage}
              />
            );
          })
        )}
      </div>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="mt-6 flex min-h-40 items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-6 text-center">
      <p className="text-sm shortly-subtle">{text}</p>
    </div>
  );
}
