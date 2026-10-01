"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Url = {
  id: number;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
  expiresAt: string | null;
};

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
  urls: Url[];
  clicks: Click[];
};

export default function Dashboard() {
  const router = useRouter();

  const [urls, setUrls] = useState<Url[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const [qrUrl, setQrUrl] = useState("");
  const [qrShortCode, setQrShortCode] = useState("");

  const [analyticsShortCode, setAnalyticsShortCode] = useState("");

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [urlsResponse, analyticsResponse] = await Promise.all([
          fetch("/api/urls"),
          fetch("/api/analytics"),
        ]);

        if (urlsResponse.status === 401 || analyticsResponse.status === 401) {
          router.push("/login");
          return;
        }

        const urlsData = await urlsResponse.json();
        const analyticsData = await analyticsResponse.json();

        if (urlsResponse.ok) {
          setUrls(urlsData);
        }

        if (analyticsResponse.ok) {
          setAnalytics(analyticsData);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [router]);

  const totalLinks = urls.length;

  const totalClicks = urls.reduce((total, url) => total + url.clicks, 0);

  const today = new Date();

  const todaysClicks =
    analytics?.clicks.filter((click) => {
      const clickDate = new Date(click.createdAt);

      return (
        clickDate.getFullYear() === today.getFullYear() &&
        clickDate.getMonth() === today.getMonth() &&
        clickDate.getDate() === today.getDate()
      );
    }).length ?? 0;

  const clicksOverTime = useMemo(() => {
    if (!analytics?.clicks.length) {
      return [];
    }

    const grouped = analytics.clicks.reduce<Record<string, number>>(
      (accumulator, click) => {
        const date = new Date(click.createdAt);
        const key = date.toISOString().slice(0, 10);

        accumulator[key] = (accumulator[key] || 0) + 1;

        return accumulator;
      },
      {},
    );

    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, clicks]) => ({
        date,
        clicks,
      }));
  }, [analytics]);

  async function handleCreateUrl(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setShortUrl("");
    setCreating(true);

    try {
      const response = await fetch("/api/urls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          alias: alias || undefined,
          expiresAt: expiresAt || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      const newUrl: Url = {
        id: data.id,
        originalUrl: data.originalUrl,
        shortCode: data.shortCode,
        clicks: 0,
        createdAt: new Date().toISOString(),
        expiresAt: data.expiresAt,
      };

      setUrls((currentUrls) => [newUrl, ...currentUrls]);

      setAnalytics((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          totalLinks: current.totalLinks + 1,
          urls: [newUrl, ...current.urls],
        };
      });

      setShortUrl(`${window.location.origin}/${data.shortCode}`);

      setUrl("");
      setAlias("");
      setExpiresAt("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this shortened URL?",
    );

    if (!confirmed) {
      return;
    }

    const response = await fetch("/api/urls", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      setUrls((currentUrls) => currentUrls.filter((url) => url.id !== id));

      setAnalytics((current) => {
        if (!current) {
          return current;
        }

        const deletedUrl = current.urls.find((url) => url.id === id);

        return {
          ...current,
          totalLinks: current.totalLinks - 1,
          totalClicks: current.totalClicks - (deletedUrl?.clicks ?? 0),
          urls: current.urls.filter((url) => url.id !== id),
          clicks: current.clicks.filter(
            (click) => click.shortCode !== deletedUrl?.shortCode,
          ),
        };
      });
    }
  }

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  function formatExpiration(expiresAt: string | null) {
    if (!expiresAt) {
      return "Never";
    }

    const expirationDate = new Date(expiresAt);

    if (expirationDate < new Date()) {
      return "Expired";
    }

    return expirationDate.toLocaleString();
  }

  function openQrCode(shortCode: string) {
    const fullUrl = `${window.location.origin}/${shortCode}`;

    setQrUrl(fullUrl);
    setQrShortCode(shortCode);
  }

  function closeQrCode() {
    setQrUrl("");
    setQrShortCode("");
  }

  function downloadQrCode() {
    const canvas = document.getElementById(
      "shortly-qr-code",
    ) as HTMLCanvasElement | null;

    if (!canvas) {
      return;
    }

    const link = document.createElement("a");

    link.download = `shortly-${qrShortCode}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function openAnalytics(shortCode: string) {
    setAnalyticsShortCode(shortCode);
  }

  function closeAnalytics() {
    setAnalyticsShortCode("");
  }

  function getBrowser(userAgent: string | null) {
    if (!userAgent) {
      return "Unknown";
    }

    if (userAgent.includes("Edg")) {
      return "Edge";
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

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-start justify-between gap-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-blue-400">
              Shortly
            </p>

            <h1 className="mt-2 text-3xl font-bold">URL Dashboard</h1>

            <p className="mt-2 text-slate-400">
              Manage your shortened links and track their performance.
            </p>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-red-500 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>

        <section className="mb-10 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Create a short URL</h2>

            <p className="mt-1 text-sm text-slate-400">
              Create and manage a new shortened link from your dashboard.
            </p>
          </div>

          <form onSubmit={handleCreateUrl} className="space-y-3">
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="Paste your long URL here..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-blue-500"
              required
            />

            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="text"
                value={alias}
                onChange={(event) => setAlias(event.target.value)}
                placeholder="Custom alias (optional)"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-blue-500"
              />

              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? "Creating..." : "Shorten URL"}
            </button>
          </form>

          {shortUrl && (
            <div className="mt-5 rounded-lg border border-slate-700 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Your shortened URL</p>

              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block break-all font-medium text-blue-400 hover:text-blue-300"
              >
                {shortUrl}
              </a>
            </div>
          )}
        </section>

        {loading ? (
          <p className="text-slate-400">Loading dashboard...</p>
        ) : (
          <>
            <section className="mb-10">
              <div className="mb-5">
                <h2 className="text-xl font-semibold">Analytics</h2>

                <p className="mt-1 text-sm text-slate-400">
                  Track how your shortened links are performing.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
                  <p className="text-sm text-slate-400">Total Links</p>

                  <p className="mt-2 text-3xl font-bold">{totalLinks}</p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
                  <p className="text-sm text-slate-400">Total Clicks</p>

                  <p className="mt-2 text-3xl font-bold">{totalClicks}</p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
                  <p className="text-sm text-slate-400">Today&apos;s Clicks</p>

                  <p className="mt-2 text-3xl font-bold">{todaysClicks}</p>
                </div>
              </div>
            </section>

            <section className="mb-10 rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Clicks Over Time</h2>

                <p className="mt-1 text-sm text-slate-400">
                  Track the number of clicks your shortened links receive each
                  day.
                </p>
              </div>

              {clicksOverTime.length === 0 ? (
                <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-slate-800 bg-slate-950">
                  <p className="text-sm text-slate-500">
                    No click data available yet.
                  </p>
                </div>
              ) : (
                <div className="h-72 w-full">
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
                        tickFormatter={(value) =>
                          new Date(`${value}T00:00:00`).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )
                        }
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
                        labelFormatter={(value) =>
                          new Date(`${value}T00:00:00`).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )
                        }
                        formatter={(value) => [value, "Clicks"]}
                      />

                      <Line
                        type="monotone"
                        dataKey="clicks"
                        stroke="#60a5fa"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          fill: "#60a5fa",
                        }}
                        activeDot={{
                          r: 6,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className="mb-10 rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Link Performance</h2>

                <p className="mt-1 text-sm text-slate-400">
                  See which shortened links are getting the most traffic.
                </p>
              </div>

              {urls.length === 0 ? (
                <p className="text-slate-400">No links available yet.</p>
              ) : (
                <div className="space-y-4">
                  {urls.map((url) => (
                    <div
                      key={url.id}
                      className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950 p-4"
                    >
                      <div className="min-w-0">
                        <a
                          href={`/${url.shortCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-400 hover:text-blue-300"
                        >
                          /{url.shortCode}
                        </a>

                        <p className="mt-1 truncate text-sm text-slate-500">
                          {url.originalUrl}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-semibold">{url.clicks}</p>

                        <p className="text-sm text-slate-500">
                          {url.clicks === 1 ? "click" : "clicks"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mb-10 rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Recent Clicks</h2>

                <p className="mt-1 text-sm text-slate-400">
                  See recent activity across your shortened links.
                </p>
              </div>

              {!analytics?.clicks.length ? (
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
                      {analytics.clicks.slice(0, 10).map((click) => (
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

            {urls.length === 0 ? (
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-8 text-center">
                <p className="text-slate-400">
                  You haven&apos;t created any shortened URLs yet.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-slate-800 text-sm text-slate-400">
                      <tr>
                        <th className="px-6 py-4">Short URL</th>
                        <th className="px-6 py-4">Original URL</th>
                        <th className="px-6 py-4">Clicks</th>
                        <th className="px-6 py-4">Created</th>
                        <th className="px-6 py-4">Expires</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {urls.map((url) => {
                        const expired =
                          url.expiresAt !== null &&
                          new Date(url.expiresAt) < new Date();

                        return (
                          <tr
                            key={url.id}
                            className="border-b border-slate-800 last:border-0"
                          >
                            <td className="px-6 py-4">
                              <a
                                href={`/${url.shortCode}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`font-medium ${
                                  expired
                                    ? "text-slate-500 line-through"
                                    : "text-blue-400 hover:text-blue-300"
                                }`}
                              >
                                /{url.shortCode}
                              </a>
                            </td>

                            <td className="max-w-md truncate px-6 py-4 text-slate-400">
                              {url.originalUrl}
                            </td>

                            <td className="px-6 py-4 font-medium">
                              {url.clicks}
                            </td>

                            <td className="px-6 py-4 text-slate-400">
                              {new Date(url.createdAt).toLocaleDateString()}
                            </td>

                            <td
                              className={`px-6 py-4 ${
                                expired
                                  ? "font-medium text-red-400"
                                  : "text-slate-400"
                              }`}
                            >
                              {formatExpiration(url.expiresAt)}
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => openAnalytics(url.shortCode)}
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  Analytics
                                </button>

                                <button
                                  onClick={() => openQrCode(url.shortCode)}
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  QR Code
                                </button>

                                <button
                                  onClick={() => handleDelete(url.id)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {analyticsShortCode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
          onClick={closeAnalytics}
        >
          <div
            className="w-full max-w-3xl rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Link Analytics</h2>

                <p className="mt-1 text-sm text-slate-400">
                  /{analyticsShortCode}
                </p>
              </div>

              <button
                onClick={closeAnalytics}
                className="text-2xl text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>

            {(() => {
              const linkClicks =
                analytics?.clicks.filter(
                  (click) => click.shortCode === analyticsShortCode,
                ) ?? [];

              return (
                <>
                  <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-5">
                    <p className="text-sm text-slate-400">Total Clicks</p>

                    <p className="mt-2 text-3xl font-bold">
                      {linkClicks.length}
                    </p>
                  </div>

                  <div className="mt-6 max-h-80 overflow-y-auto">
                    {linkClicks.length === 0 ? (
                      <p className="py-8 text-center text-slate-500">
                        No clicks recorded for this link yet.
                      </p>
                    ) : (
                      <table className="w-full text-left">
                        <thead className="border-b border-slate-800 text-sm text-slate-400">
                          <tr>
                            <th className="px-4 py-3">Browser</th>

                            <th className="px-4 py-3">Referrer</th>

                            <th className="px-4 py-3">Date</th>
                          </tr>
                        </thead>

                        <tbody>
                          {linkClicks.map((click) => (
                            <tr
                              key={click.id}
                              className="border-b border-slate-800 last:border-0"
                            >
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
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {qrUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
          onClick={closeQrCode}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-6 text-center shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">QR Code</h2>

              <button
                onClick={closeQrCode}
                className="text-2xl text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <p className="mt-2 break-all text-sm text-slate-400">{qrUrl}</p>

            <div className="mt-6 flex justify-center rounded-lg bg-white p-5">
              <QRCodeCanvas
                id="shortly-qr-code"
                value={qrUrl}
                size={220}
                level="H"
                includeMargin
              />
            </div>

            <button
              onClick={downloadQrCode}
              className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-500"
            >
              Download QR Code
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
