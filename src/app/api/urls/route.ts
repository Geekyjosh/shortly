import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

function generateShortCode(length = 6) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(urls);
  } catch (error) {
    console.error("URL fetch error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "URL ID is required" },
        { status: 400 },
      );
    }

    const url = await prisma.url.findFirst({
      where: {
        id: Number(id),
        userId,
      },
    });

    if (!url) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    await prisma.url.delete({
      where: {
        id: url.id,
      },
    });

    return NextResponse.json({
      message: "URL deleted successfully",
      id: url.id,
    });
  } catch (error) {
    console.error("URL deletion error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { url, alias, expiresAt } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Please provide a valid URL" },
        { status: 400 },
      );
    }

    let expirationDate: Date | null = null;

    if (expiresAt) {
      expirationDate = new Date(expiresAt);

      if (isNaN(expirationDate.getTime())) {
        return NextResponse.json(
          { error: "Please provide a valid expiration date" },
          { status: 400 },
        );
      }

      if (expirationDate <= new Date()) {
        return NextResponse.json(
          { error: "Expiration date must be in the future" },
          { status: 400 },
        );
      }
    }

    let shortCode = alias?.trim() || generateShortCode();

    if (alias) {
      if (!/^[a-zA-Z0-9_-]+$/.test(shortCode)) {
        return NextResponse.json(
          {
            error:
              "Custom alias can only contain letters, numbers, hyphens, and underscores",
          },
          { status: 400 },
        );
      }

      const existingUrl = await prisma.url.findUnique({
        where: {
          shortCode,
        },
      });

      if (existingUrl) {
        return NextResponse.json(
          { error: "That custom alias is already in use" },
          { status: 409 },
        );
      }
    } else {
      while (
        await prisma.url.findUnique({
          where: {
            shortCode,
          },
        })
      ) {
        shortCode = generateShortCode();
      }
    }

    const shortenedUrl = await prisma.url.create({
      data: {
        originalUrl: url,
        shortCode,
        userId,
        expiresAt: expirationDate,
      },
    });

    return NextResponse.json(
      {
        message: "URL shortened successfully",
        id: shortenedUrl.id,
        shortCode: shortenedUrl.shortCode,
        originalUrl: shortenedUrl.originalUrl,
        expiresAt: shortenedUrl.expiresAt,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("URL creation error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
