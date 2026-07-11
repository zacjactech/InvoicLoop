import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ForgotPasswordSchema } from "@/lib/validators";
import {
  buildResetUrl,
  issueResetToken,
} from "@/lib/reset-tokens";
import { sendEmail } from "@/lib/mailer";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limit = rateLimit(request, "forgot-password", {
    max: 5,
    windowMs: 60_000,
  });
  const headers = rateLimitHeaders(limit, 5);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const result = ForgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400, headers }
      );
    }

    const email = result.data.email.toLowerCase();
    const user = await db.user.findUnique({ where: { email } });

    if (user) {
      const { raw, hash, expiresAt } = issueResetToken();
      await db.passwordResetToken.create({
        data: { userId: user.id, tokenHash: hash, expiresAt },
      });
      const url = buildResetUrl(raw);
      await sendEmail({
        to: user.email,
        subject: "Reset your InvoiceLoop password",
        text: `Someone (hopefully you) requested a password reset for ${user.email}.\n\nClick the link below within the next hour to set a new password:\n\n${url}\n\nIf you didn't request this, you can safely ignore this message.`,
      });
    }

    return NextResponse.json({ ok: true }, { headers });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers }
    );
  }
}
