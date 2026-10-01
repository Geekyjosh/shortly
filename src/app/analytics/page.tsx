"use client";

import { useEffect, useMemo, useState } from "react";
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
  shortCode: string;
  createdAt: string;
  referrer: string | null;
  userAgent: string | null;
};

type Analytics = {
  totalClicks: number;
  totalLinks: number;
  clicks: Click[];
};

export default function AnalyticsPage() {
  const router = useRouter();

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await fetch("/api/analytics");

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        setAnalytics(data);
      } catch (error) {
        console.error("Analytics fetch error:", error);
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

  function getBrowser(userAgent: string | null) {
    if (!userAgent) return "Unknown";
    if (userAgent.includes("Edg")) return "Edge";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";

    return "Other";
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="text-sm font-medium uppercase tracking-widest text-blue-400 transition hover:text-blue-300"
            >
              Shortly
            </Link>

            <h1 className="mt-2 text-3xl font-bold">Analytics</h1>

            <p className="mt-2 text-slate-400">
              Monitor clicks and activity across your shortened links.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/analytics"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              Analytics
            </Link>

            <Link
              href="/dashboard"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-blue-500 hover:text-white"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading analytics...</p>
        ) : !analytics ? (
          <p className="text-red-400">Unable to load analytics.</p>
        ) : (
          <>
            <section className="mb-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Total Links</p>

                <p className="mt-2 text-4xl font-bold">
                  {analytics.totalLinks}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Total Clicks</p>

                <p className="mt-2 text-4xl font-bold">
                  {analytics.totalClicks}
                </p>
              </div>
            </section>

            <section className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Clicks Over Time</h2>

                <p className="mt-1 text-sm text-slate-400">
                  Daily click activity across all your links.
                </p>
              </div>

              {clicksOverTime.length === 0 ? (
                <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-slate-800 bg-slate-950">
                  <p className="text-sm text-slate-500">
                    No click data available yet.
                  </p>
                </div>
              ) : (
                <div className="h-72">
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
                        tick={{ fontSize: 12 }}
                      />

                      <YAxis
                        allowDecimals={false}
                        stroke="#64748b"
                        tick={{ fontSize: 12 }}
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

            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Recent Clicks</h2>

                <p className="mt-1 text-sm text-slate-400">
                  Recent visitor activity across your links.
                </p>
              </div>

              {analytics.clicks.length === 0 ? (
                <p className="text-slate-400">No clicks recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-slate-800 text-sm text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Short URL</th>
                        <th className="px-4 py-3">Browser</th>
                        <th className="px-4 py-3">Referrer</th>
                        <th className="px-4 py-3">Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {analytics.clicks.map((click) => (
                        <tr
                          key={click.id}
                          className="border-b border-slate-800 last:border-0"
                        >
                          <td className="px-4 py-4 font-medium text-blue-400">
                            /{click.shortCode}
                          </td>

                          <td className="px-4 py-4 text-slate-300">
                            {getBrowser(click.userAgent)}
                          </td>

                          <td className="max-w-xs truncate px-4 py-4 text-slate-400">
                            {click.referrer || "Direct"}
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
          </>
        )}
      </div>
    </main>
  );
}
