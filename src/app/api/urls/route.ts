import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
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
      select: {
        id: true,
      },
    });

    if (!existingUrl) {
      return shortCode;
    }

    shortCode = generateShortCode();
  }
}

async function getAnonymousId() {
  const cookieStore = await cookies();

  let anonymousId = cookieStore.get("shortly_guest_id")?.value;

  if (!anonymousId) {
    anonymousId = randomUUID();
  }

  return anonymousId;
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

/*
|--------------------------------------------------------------------------
| GET /api/urls
|--------------------------------------------------------------------------
| Returns all links belonging to the currently authenticated user.
*/
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

    const urls = await prisma.url.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        originalUrl: true,
        shortCode: true,
        clicks: true,
        active: true,
        createdAt: true,
        expiresAt: true,
      },
    });

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

/*
|--------------------------------------------------------------------------
| POST /api/urls
|--------------------------------------------------------------------------
| Creates a URL for either:
| - an authenticated user
| - a guest user with a maximum of 5 links
|--------------------------------------------------------------------------
*/
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const url = typeof body.url === "string" ? body.url.trim() : "";

    const alias = typeof body.alias === "string" ? body.alias.trim() : "";

    const userId = await getCurrentUserId();

    /*
     * Authenticated users belong to their account.
     * Guests receive a browser-based anonymous ID.
     */
    const anonymousId = userId ? null : await getAnonymousId();

    /*
     * Validate URL before doing database work.
     */
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

    /*
     * Guests can create a maximum of 5 links.
     */
    if (!userId && anonymousId) {
      const guestLinkCount = await prisma.url.count({
        where: {
          anonymousId,
        },
      });

      if (guestLinkCount >= 5) {
        return NextResponse.json(
          {
            error:
              "You have reached the free limit of 5 links. Create a free account to continue creating links and manage them from your dashboard.",
            limitReached: true,
          },
          {
            status: 403,
          },
        );
      }
    }

    /*
     * Validate expiration date.
     */
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

    /*
     * Generate or validate custom alias.
     */
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
        select: {
          id: true,
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

    /*
     * Create the link.
     */
    const createdUrl = await prisma.url.create({
      data: {
        originalUrl: url,
        shortCode,
        clicks: 0,
        active: true,
        expiresAt: expirationDate,
        userId,
        anonymousId,
      },
      select: {
        id: true,
        originalUrl: true,
        shortCode: true,
        clicks: true,
        active: true,
        createdAt: true,
        expiresAt: true,
        anonymousId: true,
      },
    });

    /*
     * Return the newly-created link.
     */
    const response = NextResponse.json(
      {
        message: "URL shortened successfully",
        ...createdUrl,
        guest: !userId,
        guestLimit: !userId ? 5 : null,
      },
      {
        status: 201,
      },
    );

    /*
     * Remember the guest browser for one year.
     */
    if (!userId && anonymousId) {
      response.cookies.set("shortly_guest_id", anonymousId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }

    return response;
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

/*
|--------------------------------------------------------------------------
| PUT /api/urls
|--------------------------------------------------------------------------
| Updates a link belonging to the authenticated user.
|--------------------------------------------------------------------------
*/
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

    /*
     * Validate expiration.
     */
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

    /*
     * Make sure the URL belongs to the current user.
     */
    const currentUrl = await prisma.url.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
        shortCode: true,
      },
    });

    if (!currentUrl) {
      return NextResponse.json(
        {
          error: "URL not found",
        },
        {
          status: 404,
        },
      );
    }

    let shortCode = currentUrl.shortCode;

    /*
     * Validate a new alias if provided.
     */
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

      const existingAlias = await prisma.url.findFirst({
        where: {
          shortCode: alias,
          NOT: {
            id,
          },
        },
        select: {
          id: true,
        },
      });

      if (existingAlias) {
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

    /*
     * Update the link.
     */
    const updatedUrl = await prisma.url.update({
      where: {
        id,
      },
      data: {
        originalUrl: url,
        shortCode,
        expiresAt: expirationDate,
      },
      select: {
        id: true,
        originalUrl: true,
        shortCode: true,
        clicks: true,
        active: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    return NextResponse.json({
      message: "URL updated successfully",
      url: updatedUrl,
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

/*
|--------------------------------------------------------------------------
| PATCH /api/urls
|--------------------------------------------------------------------------
| Toggles the active/inactive status of a user's link.
|--------------------------------------------------------------------------
*/
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

    const url = await prisma.url.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
        shortCode: true,
        active: true,
      },
    });

    if (!url) {
      return NextResponse.json(
        {
          error: "URL not found",
        },
        {
          status: 404,
        },
      );
    }

    const newActiveStatus = !url.active;

    const updatedUrl = await prisma.url.update({
      where: {
        id,
      },
      data: {
        active: newActiveStatus,
      },
      select: {
        id: true,
        shortCode: true,
        active: true,
      },
    });

    return NextResponse.json({
      message: newActiveStatus
        ? "Link activated successfully"
        : "Link disabled successfully",
      url: updatedUrl,
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

/*
|--------------------------------------------------------------------------
| DELETE /api/urls
|--------------------------------------------------------------------------
| Deletes a link belonging to the authenticated user.
|--------------------------------------------------------------------------
*/
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

    const existingUrl = await prisma.url.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!existingUrl) {
      return NextResponse.json(
        {
          error: "URL not found",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.url.delete({
      where: {
        id,
      },
    });

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
