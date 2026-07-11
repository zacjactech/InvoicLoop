import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { SignupSchema } from "@/lib/validators";
import { createSession } from "@/lib/auth-session";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limit = rateLimit(request, "signup", { max: 5, windowMs: 60_000 });
  const headers = rateLimitHeaders(limit, 5);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many signup attempts. Please try again later." },
      { status: 429, headers }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const result = SignupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400, headers }
      );
    }

    const { name, email, password } = result.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409, headers }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userCount = await db.user.count();
    const role = userCount === 0 ? "ADMIN" : "MEMBER";

    const user = await db.user.create({
      data: { name, email: normalizedEmail, passwordHash, role },
    });

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
      { status: 201, headers }
    );
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409, headers }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers }
    );
  }
}
