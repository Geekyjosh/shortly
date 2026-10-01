"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Click = {
  id: number;
  urlId: number;
  shortCode: string;
  createdAt: string;
  country: string | null;
  referrer: string | null;
  userAgent: string | null;
};

type UrlItem = {
  id: number;
  shortCode: string;
  originalUrl: string;
  clicks: number;
  active: boolean;
  createdAt: string;
  expiresAt: string | null;
};

type CountryStat = {
  country: string;
  clicks: number;
};

type Analytics = {
  totalClicks: number;
  totalLinks: number;
  urls: UrlItem[];
  clicks: Click[];
  countries: CountryStat[];
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

export default function AnalyticsPage() {
  const router = useRouter();

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await fetch("/api/analytics", {
          cache: "no-store",
        });

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load analytics.");
        }

        setAnalytics(data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Unable to load analytics.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [router]);

  const clicksOverTime = useMemo(() => {
    if (!analytics?.clicks.length) {
      return [];
    }

    const grouped: Record<string, number> = {};

    analytics.clicks.forEach((click) => {
      const date = new Date(click.createdAt).toISOString().slice(0, 10);

      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, clicks]) => ({
        date,
        clicks,
      }));
  }, [analytics]);

  const activeLinks = useMemo(() => {
    return analytics?.urls.filter((url) => url.active).length || 0;
  }, [analytics]);

  const averageClicks = useMemo(() => {
    if (!analytics?.totalLinks) {
      return 0;
    }

    return Math.round(analytics.totalClicks / analytics.totalLinks);
  }, [analytics]);

  const topLinks = useMemo(() => {
    if (!analytics) {
      return [];
    }

    return [...analytics.urls].sort((a, b) => b.clicks - a.clicks).slice(0, 5);
  }, [analytics]);

  const browserStats = useMemo(() => {
    const counts: Record<string, number> = {};

    analytics?.clicks.forEach((click) => {
      const browser = getBrowser(click.userAgent);

      counts[browser] = (counts[browser] || 0) + 1;
    });

    return Object.entries(counts).sort(([, a], [, b]) => b - a);
  }, [analytics]);

  const referrerStats = useMemo(() => {
    const counts: Record<string, number> = {};

    analytics?.clicks.forEach((click) => {
      const referrer = getReferrer(click.referrer);

      counts[referrer] = (counts[referrer] || 0) + 1;
    });

    return Object.entries(counts).sort(([, a], [, b]) => b - a);
  }, [analytics]);

  const countryStats = useMemo(() => {
    if (!analytics) {
      return [];
    }

    return analytics.countries.slice(0, 10);
  }, [analytics]);

  function getBrowser(userAgent: string | null) {
    if (!userAgent) {
      return "Unknown";
    }

    if (userAgent.includes("Edg")) {
      return "Edge";
    }

    if (userAgent.includes("OPR")) {
      return "Opera";
    }

    if (userAgent.includes("Chrome")) {
      return "Chrome";
    }

    if (userAgent.includes("Firefox")) {
      return "Firefox";
    }

    if (userAgent.includes("Safari")) {
      return "Safari";
    }

    return "Other";
  }

  function getReferrer(referrer: string | null) {
    if (!referrer) {
      return "Direct";
    }

    try {
      return new URL(referrer).hostname;
    } catch {
      return referrer;
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />

          <p className="mt-4 text-sm text-slate-500">Loading analytics...</p>
        </div>
      </main>
    );
  }

  if (error || !analytics) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h1 className="text-xl font-semibold">Unable to load analytics</h1>

          <p className="mt-3 text-sm text-red-400">
            {error || "Something went wrong."}
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium transition hover:bg-blue-500"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="Shortly logo"
                width={140}
                height={40}
                priority
                className="h-10 w-auto"
              />
            </Link>

            <p className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
              Performance
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              Analytics
            </h1>

            <p className="mt-3 text-slate-400">
              Understand how your shortened links are performing.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              href="/dashboard/create"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium transition hover:bg-blue-500"
            >
              Create link
            </Link>
          </div>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Total links</p>

            <p className="mt-3 text-3xl font-bold">{analytics.totalLinks}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Total clicks</p>

            <p className="mt-3 text-3xl font-bold">{analytics.totalClicks}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Active links</p>

            <p className="mt-3 text-3xl font-bold">{activeLinks}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Avg. clicks / link</p>

            <p className="mt-3 text-3xl font-bold">{averageClicks}</p>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Click activity</h2>

            <p className="mt-1 text-sm text-slate-500">
              Daily click activity across your links.
            </p>
          </div>

          {clicksOverTime.length === 0 ? (
            <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950">
              <p className="text-sm text-slate-500">
                No click data available yet.
              </p>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={clicksOverTime}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    tick={{
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                    stroke="#64748b"
                    tick={{
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value) => [value, "Clicks"]}
                  />

                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#60a5fa"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <div className="mb-8 grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Geographic analytics</h2>

            <p className="mt-1 text-sm text-slate-500">
              See where your shortened links are being clicked around the world.
            </p>

            <div className="mt-6 space-y-3">
              {countryStats.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950 p-8 text-center">
                  <p className="text-sm text-slate-500">
                    No geographic data available yet.
                  </p>
                </div>
              ) : (
                countryStats.map(({ country, clicks }) => {
                  const percentage = analytics.totalClicks
                    ? Math.round((clicks / analytics.totalClicks) * 100)
                    : 0;

                  return (
                    <div
                      key={country}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="text-xl">
                            {getCountryFlag(country)}
                          </span>

                          <span className="truncate text-sm font-medium text-slate-200">
                            {getCountryName(country)}
                          </span>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold text-white">
                            {clicks}
                          </p>

                          <p className="text-xs text-slate-500">
                            {percentage}%
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${Math.max(percentage, 2)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Top links</h2>

            <p className="mt-1 text-sm text-slate-500">
              Your most clicked shortened URLs.
            </p>

            <div className="mt-6 space-y-4">
              {topLinks.length === 0 ? (
                <p className="text-sm text-slate-500">No links yet.</p>
              ) : (
                topLinks.map((link) => (
                  <div
                    key={link.id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-blue-400">
                          /{link.shortCode}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-600">
                          {link.originalUrl}
                        </p>
                      </div>

                      <span className="shrink-0 text-sm font-semibold text-white">
                        {link.clicks} clicks
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="mb-8 grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Traffic sources</h2>

            <p className="mt-1 text-sm text-slate-500">
              Where your visitors are coming from.
            </p>

            <div className="mt-6 space-y-4">
              {referrerStats.length === 0 ? (
                <p className="text-sm text-slate-500">No referrer data yet.</p>
              ) : (
                referrerStats.slice(0, 6).map(([referrer, count]) => (
                  <div
                    key={referrer}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
                  >
                    <span className="truncate text-sm text-slate-300">
                      {referrer}
                    </span>

                    <span className="ml-4 text-sm font-semibold text-white">
                      {count}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Browsers</h2>

            <p className="mt-1 text-sm text-slate-500">
              Browsers used to access your links.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {browserStats.length === 0 ? (
                <p className="text-sm text-slate-500">No browser data yet.</p>
              ) : (
                browserStats.map(([browser, count]) => (
                  <div
                    key={browser}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <p className="text-sm text-slate-400">{browser}</p>

                    <p className="mt-2 text-2xl font-bold">{count}</p>

                    <p className="mt-1 text-xs text-slate-600">clicks</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Recent clicks</h2>

            <p className="mt-1 text-sm text-slate-500">
              Recent visitor activity across your links.
            </p>
          </div>

          {analytics.clicks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950 p-10 text-center">
              <p className="text-sm text-slate-500">No clicks recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Short URL</th>

                    <th className="px-4 py-3">Country</th>

                    <th className="px-4 py-3">Browser</th>

                    <th className="px-4 py-3">Referrer</th>

                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {analytics.clicks.slice(0, 50).map((click) => (
                    <tr
                      key={click.id}
                      className="border-b border-slate-800 last:border-0"
                    >
                      <td className="px-4 py-4 font-medium text-blue-400">
                        /{click.shortCode}
                      </td>

                      <td className="px-4 py-4 text-slate-300">
                        <span className="mr-2">
                          {getCountryFlag(click.country || "Unknown")}
                        </span>

                        {getCountryName(click.country || "Unknown")}
                      </td>

                      <td className="px-4 py-4 text-slate-300">
                        {getBrowser(click.userAgent)}
                      </td>

                      <td className="max-w-xs truncate px-4 py-4 text-slate-400">
                        {getReferrer(click.referrer)}
                      </td>

                      <td className="px-4 py-4 text-slate-400">
                        {new Date(click.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
