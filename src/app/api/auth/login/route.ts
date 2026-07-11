import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { LoginSchema } from "@/lib/validators";
import { createSession } from "@/lib/auth-session";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

// Used as a stand-in when the user does not exist so bcrypt runs anyway and
// login latency is independent of whether the email is registered. Defeats
// account enumeration via response timing.
const PLACEHOLDER_HASH =
  "$2a$10$CwTycUXWue0Thq9StjUM0uJ8.DL5MQkQxJ5Cw6Z4J8W7kYbKq2s1m";

export async function POST(request: Request) {
  const limit = rateLimit(request, "login", { max: 10, windowMs: 60_000 });
  const headers = rateLimitHeaders(limit, 10);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly." },
      { status: 429, headers }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const result = LoginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400, headers }
      );
    }

    const { email, password } = result.data;
    const normalizedEmail = email.toLowerCase();

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    const hashToCheck = user?.passwordHash ?? PLACEHOLDER_HASH;
    const valid = await bcrypt.compare(password, hashToCheck);

    if (!user || !valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401, headers }
      );
    }

    await createSession(user.id);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { headers }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers }
    );
  }
}
