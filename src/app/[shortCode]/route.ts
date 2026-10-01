import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shortCode: string }> },
) {
  try {
    const { shortCode } = await params;

    const urls = await prisma.$queryRaw<
      {
        id: number;
        originalUrl: string;
        shortCode: string;
        clicks: number;
        active: boolean;
        expiresAt: Date | null;
      }[]
    >`
      SELECT
        "id",
        "originalUrl",
        "shortCode",
        "clicks",
        "active",
        "expiresAt"
      FROM "Url"
      WHERE "shortCode" = ${shortCode}
      LIMIT 1
    `;

    if (urls.length === 0) {
      return NextResponse.json(
        {
          error: "Short URL not found",
        },
        {
          status: 404,
        },
      );
    }

    const url = urls[0];

    if (!url.active) {
      return NextResponse.json(
        {
          error: "This short URL has been disabled",
        },
        {
          status: 410,
        },
      );
    }

    if (url.expiresAt && url.expiresAt <= new Date()) {
      return NextResponse.json(
        {
          error: "This short URL has expired",
        },
        {
          status: 410,
        },
      );
    }

    const referrer = request.headers.get("referer");
    const userAgent = request.headers.get("user-agent");

    await prisma.$transaction([
      prisma.$executeRaw`
        UPDATE "Url"
        SET "clicks" = "clicks" + 1
        WHERE "id" = ${url.id}
      `,
      prisma.$executeRaw`
        INSERT INTO "Click"
          ("urlId", "createdAt", "referrer", "userAgent")
        VALUES
          (${url.id}, NOW(), ${referrer}, ${userAgent})
      `,
    ]);

    return NextResponse.redirect(url.originalUrl);
  } catch (error) {
    console.error("Short URL redirect error:", error);

    return NextResponse.json(
      {
        error: "Unable to process this short URL",
      },
      {
        status: 500,
      },
    );
  }
}
