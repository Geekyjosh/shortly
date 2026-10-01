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
        referrer: string | null;
        userAgent: string | null;
      }[]
    >`
      SELECT
        c."id",
        c."urlId",
        u."shortCode",
        c."createdAt",
        c."referrer",
        c."userAgent"
      FROM "Click" c
      INNER JOIN "Url" u
        ON u."id" = c."urlId"
      WHERE u."userId" = ${userId}
      ORDER BY c."createdAt" DESC
    `;

    const totalClicks = urls.reduce((total, url) => total + url.clicks, 0);

    return NextResponse.json({
      totalClicks,
      totalLinks: urls.length,
      urls,
      clicks,
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
