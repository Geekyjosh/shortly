import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type DateRange = "7" | "30" | "90" | "all";

function getBrowser(userAgent: string | null) {
  if (!userAgent) {
    return "Unknown";
  }

  if (/Edg\//i.test(userAgent)) {
    return "Edge";
  }

  if (/OPR\//i.test(userAgent) || /Opera/i.test(userAgent)) {
    return "Opera";
  }

  if (/SamsungBrowser/i.test(userAgent)) {
    return "Samsung Internet";
  }

  if (/CriOS/i.test(userAgent)) {
    return "Chrome";
  }

  if (/FxiOS/i.test(userAgent)) {
    return "Firefox";
  }

  if (/Chrome|Chromium/i.test(userAgent)) {
    return "Chrome";
  }

  if (/Firefox/i.test(userAgent)) {
    return "Firefox";
  }

  if (
    /Safari/i.test(userAgent) &&
    !/Chrome|Chromium|CriOS|Android/i.test(userAgent)
  ) {
    return "Safari";
  }

  return "Other";
}

function getDevice(userAgent: string | null) {
  if (!userAgent) {
    return "Unknown";
  }

  if (/iPad|Tablet/i.test(userAgent)) {
    return "Tablet";
  }

  if (/Mobile|Android|iPhone|iPod/i.test(userAgent)) {
    return "Mobile";
  }

  return "Desktop";
}

function getOperatingSystem(userAgent: string | null) {
  if (!userAgent) {
    return "Unknown";
  }

  if (/Windows NT/i.test(userAgent)) {
    return "Windows";
  }

  if (/Android/i.test(userAgent)) {
    return "Android";
  }

  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return "iOS";
  }

  if (/Mac OS X|Macintosh/i.test(userAgent)) {
    return "macOS";
  }

  if (/Linux/i.test(userAgent)) {
    return "Linux";
  }

  if (/CrOS/i.test(userAgent)) {
    return "ChromeOS";
  }

  return "Other";
}

function getTrafficSource(referrer: string | null) {
  if (!referrer) {
    return "Direct";
  }

  try {
    const hostname = new URL(referrer).hostname
      .replace(/^www\./, "")
      .toLowerCase();

    if (
      hostname.includes("google.") ||
      hostname.includes("bing.") ||
      hostname.includes("yahoo.") ||
      hostname.includes("duckduckgo.")
    ) {
      return "Search";
    }

    if (
      hostname.includes("facebook.") ||
      hostname.includes("instagram.") ||
      hostname.includes("twitter.") ||
      hostname.includes("x.com") ||
      hostname.includes("linkedin.") ||
      hostname.includes("tiktok.") ||
      hostname.includes("youtube.")
    ) {
      return "Social";
    }

    return hostname;
  } catch {
    return "Other";
  }
}

function getStartDate(range: DateRange) {
  if (range === "all") {
    return null;
  }

  const days = Number(range);

  const date = new Date();

  date.setHours(0, 0, 0, 0);

  date.setDate(date.getDate() - (days - 1));

  return date;
}

function countValues(values: string[]) {
  const counts: Record<string, number> = {};

  values.forEach((value) => {
    counts[value] = (counts[value] || 0) + 1;
  });

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([name, clicks]) => ({
      name,
      clicks,
    }));
}

function getDateKey(date: Date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function GET(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Authentication required",
        },
        {
          status: 401,
        },
      );
    }

    const { searchParams } = new URL(request.url);

    const rawRange = searchParams.get("range") || "30";

    const range: DateRange = ["7", "30", "90", "all"].includes(rawRange)
      ? (rawRange as DateRange)
      : "30";

    const rawLinkId = searchParams.get("link");

    const linkId = rawLinkId ? Number(rawLinkId) : null;

    if (rawLinkId && (!Number.isInteger(linkId) || !linkId || linkId <= 0)) {
      return NextResponse.json(
        {
          error: "Invalid link ID",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Load all links owned by this user.
     */
    const urls = await prisma.url.findMany({
      where: {
        userId,
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        shortCode: true,
        originalUrl: true,
        clicks: true,
        active: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    /*
     * If a specific link was requested, verify ownership.
     */
    const selectedUrl =
      linkId !== null ? urls.find((url) => url.id === linkId) : null;

    if (linkId !== null && !selectedUrl) {
      return NextResponse.json(
        {
          error: "Link not found",
        },
        {
          status: 404,
        },
      );
    }

    const startDate = getStartDate(range);

    /*
     * Load clicks belonging only to this user's URLs.
     */
    const rawClicks = await prisma.click.findMany({
      where: {
        url: {
          userId,
        },

        ...(linkId
          ? {
              urlId: linkId,
            }
          : {}),

        ...(startDate
          ? {
              createdAt: {
                gte: startDate,
              },
            }
          : {}),
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        urlId: true,
        createdAt: true,
        country: true,
        referrer: true,
        userAgent: true,

        url: {
          select: {
            shortCode: true,
          },
        },
      },
    });

    /*
     * Add useful analytics dimensions derived from
     * the information already stored in Click.
     */
    const clicks = rawClicks.map((click) => ({
      id: click.id,
      urlId: click.urlId,
      shortCode: click.url.shortCode,
      createdAt: click.createdAt,
      country: click.country,
      referrer: click.referrer,
      userAgent: click.userAgent,

      browser: getBrowser(click.userAgent),
      device: getDevice(click.userAgent),
      operatingSystem: getOperatingSystem(click.userAgent),
      source: getTrafficSource(click.referrer),
    }));

    /*
     * Country breakdown.
     */
    const countryCounts: Record<string, number> = {};

    clicks.forEach((click) => {
      const country = click.country || "Unknown";

      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });

    const countries = Object.entries(countryCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([country, clicks]) => ({
        country,
        clicks,
      }));

    /*
     * Browser breakdown.
     */
    const browsers = countValues(clicks.map((click) => click.browser));

    /*
     * Device breakdown.
     */
    const devices = countValues(clicks.map((click) => click.device));

    /*
     * Operating system breakdown.
     */
    const operatingSystems = countValues(
      clicks.map((click) => click.operatingSystem),
    );

    /*
     * Traffic source breakdown.
     */
    const sources = countValues(clicks.map((click) => click.source));

    /*
     * Daily click activity.
     */
    const dailyCounts: Record<string, number> = {};

    clicks.forEach((click) => {
      const date = getDateKey(click.createdAt);

      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    const clicksOverTime = Object.entries(dailyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, clicks]) => ({
        date,
        clicks,
      }));

    /*
     * Per-link click totals within the selected period.
     */
    const clickCountsByUrl: Record<number, number> = {};

    clicks.forEach((click) => {
      clickCountsByUrl[click.urlId] = (clickCountsByUrl[click.urlId] || 0) + 1;
    });

    const linkPerformance = urls
      .map((url) => ({
        id: url.id,
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        active: url.active,
        createdAt: url.createdAt,

        totalClicks: url.clicks,

        periodClicks: clickCountsByUrl[url.id] || 0,
      }))
      .sort((a, b) => b.periodClicks - a.periodClicks);

    const activeLinks = urls.filter((url) => url.active).length;

    const totalClicksAllTime = urls.reduce(
      (total, url) => total + url.clicks,
      0,
    );

    const periodClicks = clicks.length;

    const averageClicksPerLink =
      urls.length > 0 ? Math.round(periodClicks / urls.length) : 0;

    const topLink = linkPerformance[0] || null;

    return NextResponse.json({
      range,

      selectedLink: selectedUrl
        ? {
            id: selectedUrl.id,
            shortCode: selectedUrl.shortCode,
            originalUrl: selectedUrl.originalUrl,
            active: selectedUrl.active,
            createdAt: selectedUrl.createdAt,
            expiresAt: selectedUrl.expiresAt,
            totalClicks: selectedUrl.clicks,
          }
        : null,

      summary: {
        totalLinks: urls.length,
        activeLinks,
        inactiveLinks: urls.length - activeLinks,

        totalClicks: totalClicksAllTime,

        periodClicks,

        averageClicksPerLink,

        topLink,
      },

      /*
       * Kept for compatibility with the current
       * analytics UI.
       */
      totalClicks: totalClicksAllTime,
      totalLinks: urls.length,
      urls,
      clicks,
      countries,

      /*
       * New advanced analytics data.
       */
      clicksOverTime,
      browsers,
      devices,
      operatingSystems,
      sources,
      linkPerformance,
    });
  } catch (error) {
    console.error("Analytics error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to load analytics.",
      },
      {
        status: 500,
      },
    );
  }
}
