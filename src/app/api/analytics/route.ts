import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const urls = await prisma.url.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        shortCode: true,
        originalUrl: true,
        clicks: true,
        clicksData: {
          select: {
            id: true,
            createdAt: true,
            referrer: true,
            userAgent: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalClicks = urls.reduce((total, url) => total + url.clicks, 0);

    const clickRecords = urls.flatMap((url) =>
      url.clicksData.map((click) => ({
        id: click.id,
        shortCode: url.shortCode,
        createdAt: click.createdAt,
        referrer: click.referrer,
        userAgent: click.userAgent,
      })),
    );

    return NextResponse.json({
      totalClicks,
      totalLinks: urls.length,
      urls,
      clicks: clickRecords,
    });
  } catch (error) {
    console.error("Analytics error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
