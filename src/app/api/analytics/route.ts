import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

    const urls = await prisma.$queryRaw<
      {
        id: number;
        shortCode: string;
        originalUrl: string;
        clicks: number;
        active: boolean;
        createdAt: Date;
        expiresAt: Date | null;
      }[]
    >`
      SELECT
        "id",
        "shortCode",
        "originalUrl",
        "clicks",
        "active",
        "createdAt",
        "expiresAt"
      FROM "Url"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
    `;

    const clicks = await prisma.$queryRaw<
      {
        id: number;
        urlId: number;
        shortCode: string;
        createdAt: Date;
        country: string | null;
        referrer: string | null;
        userAgent: string | null;
      }[]
    >`
      SELECT
        c."id",
        c."urlId",
        u."shortCode",
        c."createdAt",
        c."country",
        c."referrer",
        c."userAgent"
      FROM "Click" c
      INNER JOIN "Url" u
        ON u."id" = c."urlId"
      WHERE u."userId" = ${userId}
      ORDER BY c."createdAt" DESC
    `;

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

    const totalClicks = urls.reduce((total, url) => total + url.clicks, 0);

    return NextResponse.json({
      totalClicks,
      totalLinks: urls.length,
      urls,
      clicks,
      countries,
    });
  } catch (error) {
    console.error("Analytics error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}
