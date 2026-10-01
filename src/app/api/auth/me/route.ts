import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({
        authenticated: false,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("AUTH_ME_ERROR:", error);

    return NextResponse.json(
      {
        authenticated: false,
        error: "Authentication check failed",
      },
      { status: 500 },
    );
  }
}
