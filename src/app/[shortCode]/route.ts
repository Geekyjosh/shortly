import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shortCode: string }> },
) {
  const { shortCode } = await params;

  const url = await prisma.url.findUnique({
    where: {
      shortCode,
    },
  });

  if (!url) {
    return NextResponse.json({ error: "Short URL not found" }, { status: 404 });
  }

  if (url.expiresAt && url.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "This short URL has expired" },
      { status: 410 },
    );
  }

  const referrer = request.headers.get("referer");
  const userAgent = request.headers.get("user-agent");

  await prisma.$transaction([
    prisma.url.update({
      where: {
        id: url.id,
      },
      data: {
        clicks: {
          increment: 1,
        },
      },
    }),

    prisma.click.create({
      data: {
        urlId: url.id,
        referrer,
        userAgent,
      },
    }),
  ]);

  return NextResponse.redirect(url.originalUrl);
}
