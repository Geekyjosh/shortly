import { randomUUID } from "crypto";
import { lookup } from "dns/promises";
import { isIP } from "net";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

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

  if (Number.isNaN(date.getTime())) {
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

function isPrivateIPv4(ip: string) {
  const parts = ip.split(".").map(Number);

  if (
    parts.length !== 4 ||
    parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)
  ) {
    return true;
  }

  const [a, b] = parts;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
}

function isPrivateIPv6(ip: string) {
  const normalized = ip.toLowerCase();

  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb") ||
    normalized.startsWith("::ffff:127.") ||
    normalized.startsWith("::ffff:10.") ||
    normalized.startsWith("::ffff:192.168.")
  );
}

function isPrivateIp(ip: string) {
  const version = isIP(ip);

  if (version === 4) {
    return isPrivateIPv4(ip);
  }

  if (version === 6) {
    return isPrivateIPv6(ip);
  }

  return true;
}

async function validatePublicHostname(hostname: string) {
  const normalizedHostname = hostname.toLowerCase();

  if (
    normalizedHostname === "localhost" ||
    normalizedHostname.endsWith(".localhost") ||
    normalizedHostname.endsWith(".local") ||
    normalizedHostname.endsWith(".internal") ||
    normalizedHostname === "0.0.0.0"
  ) {
    return false;
  }

  if (isIP(normalizedHostname)) {
    return !isPrivateIp(normalizedHostname);
  }

  try {
    const addresses = await lookup(normalizedHostname, {
      all: true,
      verbatim: true,
    });

    if (addresses.length === 0) {
      return false;
    }

    return addresses.every((address) => !isPrivateIp(address.address));
  } catch {
    return false;
  }
}

type DestinationValidation =
  | {
      valid: true;
      normalizedUrl: string;
    }
  | {
      valid: false;
      error: string;
    };

async function requestDestination(url: URL, method: "HEAD" | "GET") {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 8000);

  try {
    return await fetch(url.toString(), {
      method,
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent": "Shortly-Link-Validator/1.0",
        Accept:
          "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
        ...(method === "GET"
          ? {
              Range: "bytes=0-0",
            }
          : {}),
      },
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function validateDestinationUrl(
  value: string,
): Promise<DestinationValidation> {
  let currentUrl: URL;

  try {
    currentUrl = new URL(value);
  } catch {
    return {
      valid: false,
      error: "Please provide a valid URL.",
    };
  }

  if (!["http:", "https:"].includes(currentUrl.protocol)) {
    return {
      valid: false,
      error: "Only HTTP and HTTPS URLs are supported.",
    };
  }

  if (currentUrl.username || currentUrl.password) {
    return {
      valid: false,
      error: "URLs containing usernames or passwords are not supported.",
    };
  }

  const maximumRedirects = 5;

  for (
    let redirectCount = 0;
    redirectCount <= maximumRedirects;
    redirectCount++
  ) {
    const publicHostname = await validatePublicHostname(currentUrl.hostname);

    if (!publicHostname) {
      return {
        valid: false,
        error: "This URL cannot be reached or points to a private address.",
      };
    }

    let response: Response;

    try {
      response = await requestDestination(currentUrl, "HEAD");

      /*
       * Some websites do not support HEAD,
       * even though the destination exists.
       */
      if (response.status === 405 || response.status === 501) {
        await response.body?.cancel();

        response = await requestDestination(currentUrl, "GET");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return {
          valid: false,
          error: "The destination website took too long to respond.",
        };
      }

      /*
       * Some hosts behave differently for HEAD,
       * so make one lightweight GET attempt.
       */
      try {
        response = await requestDestination(currentUrl, "GET");
      } catch (fallbackError) {
        if (
          fallbackError instanceof Error &&
          fallbackError.name === "AbortError"
        ) {
          return {
            valid: false,
            error: "The destination website took too long to respond.",
          };
        }

        return {
          valid: false,
          error: "The destination website could not be reached.",
        };
      }
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");

      await response.body?.cancel();

      if (!location) {
        return {
          valid: false,
          error: "The destination returned an invalid redirect.",
        };
      }

      try {
        currentUrl = new URL(location, currentUrl);
      } catch {
        return {
          valid: false,
          error: "The destination returned an invalid redirect.",
        };
      }

      if (!["http:", "https:"].includes(currentUrl.protocol)) {
        return {
          valid: false,
          error: "The destination redirects to an unsupported URL.",
        };
      }

      continue;
    }

    await response.body?.cancel();

    if (response.status === 404 || response.status === 410) {
      return {
        valid: false,
        error: "The destination page does not exist.",
      };
    }

    /*
     * 401 and 403 still mean the website exists.
     * The page may simply require authentication
     * or block automated requests.
     */
    if (response.status === 401 || response.status === 403) {
      return {
        valid: true,
        normalizedUrl: currentUrl.toString(),
      };
    }

    if (response.status >= 500) {
      return {
        valid: false,
        error:
          "The destination website is currently unavailable. Please try again later.",
      };
    }

    if (response.status >= 400) {
      return {
        valid: false,
        error: "The destination website rejected the request.",
      };
    }

    return {
      valid: true,
      normalizedUrl: currentUrl.toString(),
    };
  }

  return {
    valid: false,
    error: "The destination has too many redirects.",
  };
}

/*
|--------------------------------------------------------------------------
| GET /api/urls
|--------------------------------------------------------------------------
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
*/

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const url = typeof body.url === "string" ? body.url.trim() : "";

    const alias = typeof body.alias === "string" ? body.alias.trim() : "";

    const userId = await getCurrentUserId();

    const anonymousId = userId ? null : await getAnonymousId();

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

    /*
     * First validate that the destination is
     * both safe for Shortly to request and reachable.
     */
    const destinationValidation = await validateDestinationUrl(url);

    if (!destinationValidation.valid) {
      return NextResponse.json(
        {
          error: destinationValidation.error,
        },
        {
          status: 400,
        },
      );
    }

    const validatedUrl = destinationValidation.normalizedUrl;

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

    const createdUrl = await prisma.url.create({
      data: {
        originalUrl: validatedUrl,
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

    /*
     * Validate edited destinations too.
     * Otherwise a valid link could later be
     * changed to a broken or unsafe destination.
     */
    const destinationValidation = await validateDestinationUrl(url);

    if (!destinationValidation.valid) {
      return NextResponse.json(
        {
          error: destinationValidation.error,
        },
        {
          status: 400,
        },
      );
    }

    const validatedUrl = destinationValidation.normalizedUrl;

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

    const updatedUrl = await prisma.url.update({
      where: {
        id,
      },
      data: {
        originalUrl: validatedUrl,
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
      message: "Link deleted successfully",
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
