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

async function generateUniqueShortCode() {
  let shortCode = generateShortCode();

  while (true) {
    const existingUrl = await prisma.url.findUnique({
      where: {
        shortCode,
      },
    });

    if (!existingUrl) {
      return shortCode;
    }

    shortCode = generateShortCode();
  }
}

function parseExpiration(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return undefined;
  }

  if (date <= new Date()) {
    return undefined;
  }

  return date;
}

function isValidAlias(alias: string) {
  return /^[a-zA-Z0-9_-]+$/.test(alias);
}

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
        originalUrl: string;
        shortCode: string;
        clicks: number;
        active: boolean;
        createdAt: Date;
        expiresAt: Date | null;
      }[]
    >`
      SELECT
        "id",
        "originalUrl",
        "shortCode",
        "clicks",
        "active",
        "createdAt",
        "expiresAt"
      FROM "Url"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
    `;

    return NextResponse.json({
      urls,
    });
  } catch (error) {
    console.error("URL fetch error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to load your links.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();

    const url = typeof body.url === "string" ? body.url.trim() : "";

    const alias = typeof body.alias === "string" ? body.alias.trim() : "";

    if (!url) {
      return NextResponse.json(
        {
          error: "URL is required",
        },
        {
          status: 400,
        },
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        {
          error: "Please provide a valid URL",
        },
        {
          status: 400,
        },
      );
    }

    const expirationDate = parseExpiration(body.expiresAt);

    if (
      body.expiresAt &&
      typeof body.expiresAt === "string" &&
      expirationDate === undefined
    ) {
      return NextResponse.json(
        {
          error: "Expiration date must be valid and in the future",
        },
        {
          status: 400,
        },
      );
    }

    let shortCode = alias;

    if (alias) {
      if (!isValidAlias(alias)) {
        return NextResponse.json(
          {
            error:
              "Custom alias can only contain letters, numbers, hyphens, and underscores",
          },
          {
            status: 400,
          },
        );
      }

      if (alias.length < 3 || alias.length > 50) {
        return NextResponse.json(
          {
            error: "Custom alias must be between 3 and 50 characters",
          },
          {
            status: 400,
          },
        );
      }

      const existingUrl = await prisma.url.findUnique({
        where: {
          shortCode: alias,
        },
      });

      if (existingUrl) {
        return NextResponse.json(
          {
            error: "That custom alias is already in use",
          },
          {
            status: 409,
          },
        );
      }
    } else {
      shortCode = await generateUniqueShortCode();
    }

    await prisma.$executeRaw`
      INSERT INTO "Url"
        (
          "originalUrl",
          "shortCode",
          "clicks",
          "active",
          "createdAt",
          "expiresAt",
          "userId"
        )
      VALUES
        (
          ${url},
          ${shortCode},
          0,
          true,
          NOW(),
          ${expirationDate},
          ${userId}
        )
    `;

    const createdUrl = await prisma.$queryRaw<
      {
        id: number;
        originalUrl: string;
        shortCode: string;
        clicks: number;
        active: boolean;
        createdAt: Date;
        expiresAt: Date | null;
      }[]
    >`
      SELECT
        "id",
        "originalUrl",
        "shortCode",
        "clicks",
        "active",
        "createdAt",
        "expiresAt"
      FROM "Url"
      WHERE "shortCode" = ${shortCode}
      AND "userId" = ${userId}
      LIMIT 1
    `;

    return NextResponse.json(
      {
        message: "URL shortened successfully",
        ...createdUrl[0],
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("URL creation error:", error);

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

export async function PUT(request: Request) {
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

    const body = await request.json();

    const id = Number(body.id);

    const url = typeof body.url === "string" ? body.url.trim() : "";

    const alias = typeof body.alias === "string" ? body.alias.trim() : "";

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          error: "Invalid URL ID",
        },
        {
          status: 400,
        },
      );
    }

    if (!url) {
      return NextResponse.json(
        {
          error: "URL is required",
        },
        {
          status: 400,
        },
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        {
          error: "Please provide a valid URL",
        },
        {
          status: 400,
        },
      );
    }

    const expirationDate = parseExpiration(body.expiresAt);

    if (
      body.expiresAt &&
      typeof body.expiresAt === "string" &&
      expirationDate === undefined
    ) {
      return NextResponse.json(
        {
          error: "Expiration date must be valid and in the future",
        },
        {
          status: 400,
        },
      );
    }

    const existingUrls = await prisma.$queryRaw<
      {
        id: number;
        shortCode: string;
      }[]
    >`
      SELECT
        "id",
        "shortCode"
      FROM "Url"
      WHERE "id" = ${id}
      AND "userId" = ${userId}
      LIMIT 1
    `;

    if (existingUrls.length === 0) {
      return NextResponse.json(
        {
          error: "URL not found",
        },
        {
          status: 404,
        },
      );
    }

    const currentUrl = existingUrls[0];

    let shortCode = currentUrl.shortCode;

    if (alias) {
      if (!isValidAlias(alias)) {
        return NextResponse.json(
          {
            error:
              "Custom alias can only contain letters, numbers, hyphens, and underscores",
          },
          {
            status: 400,
          },
        );
      }

      if (alias.length < 3 || alias.length > 50) {
        return NextResponse.json(
          {
            error: "Custom alias must be between 3 and 50 characters",
          },
          {
            status: 400,
          },
        );
      }

      const existingAlias = await prisma.$queryRaw<
        {
          id: number;
        }[]
      >`
        SELECT "id"
        FROM "Url"
        WHERE "shortCode" = ${alias}
        AND "id" <> ${id}
        LIMIT 1
      `;

      if (existingAlias.length > 0) {
        return NextResponse.json(
          {
            error: "That custom alias is already in use",
          },
          {
            status: 409,
          },
        );
      }

      shortCode = alias;
    }

    await prisma.$executeRaw`
      UPDATE "Url"
      SET
        "originalUrl" = ${url},
        "shortCode" = ${shortCode},
        "expiresAt" = ${expirationDate}
      WHERE "id" = ${id}
      AND "userId" = ${userId}
    `;

    const updatedUrl = await prisma.$queryRaw<
      {
        id: number;
        originalUrl: string;
        shortCode: string;
        clicks: number;
        active: boolean;
        createdAt: Date;
        expiresAt: Date | null;
      }[]
    >`
      SELECT
        "id",
        "originalUrl",
        "shortCode",
        "clicks",
        "active",
        "createdAt",
        "expiresAt"
      FROM "Url"
      WHERE "id" = ${id}
      AND "userId" = ${userId}
      LIMIT 1
    `;

    return NextResponse.json({
      message: "URL updated successfully",
      url: updatedUrl[0],
    });
  } catch (error) {
    console.error("URL update error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to update URL.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(request: Request) {
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

    const body = await request.json();
    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          error: "Invalid URL ID",
        },
        {
          status: 400,
        },
      );
    }

    const urls = await prisma.$queryRaw<
      {
        id: number;
        shortCode: string;
        active: boolean;
      }[]
    >`
      SELECT
        "id",
        "shortCode",
        "active"
      FROM "Url"
      WHERE "id" = ${id}
      AND "userId" = ${userId}
      LIMIT 1
    `;

    if (urls.length === 0) {
      return NextResponse.json(
        {
          error: "URL not found",
        },
        {
          status: 404,
        },
      );
    }

    const url = urls[0];
    const newActiveStatus = !url.active;

    await prisma.$executeRaw`
      UPDATE "Url"
      SET "active" = ${newActiveStatus}
      WHERE "id" = ${id}
      AND "userId" = ${userId}
    `;

    return NextResponse.json({
      message: newActiveStatus
        ? "Link activated successfully"
        : "Link disabled successfully",
      url: {
        id: url.id,
        shortCode: url.shortCode,
        active: newActiveStatus,
      },
    });
  } catch (error) {
    console.error("URL status update error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update link status.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request: Request) {
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

    const body = await request.json();
    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          error: "Invalid URL ID",
        },
        {
          status: 400,
        },
      );
    }

    const result = await prisma.$executeRaw`
      DELETE FROM "Url"
      WHERE "id" = ${id}
      AND "userId" = ${userId}
    `;

    if (result === 0) {
      return NextResponse.json(
        {
          error: "URL not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      message: "URL deleted successfully",
      id,
    });
  } catch (error) {
    console.error("URL deletion error:", error);

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
