import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { ResetPasswordSchema } from "@/lib/validators";
import { hashToken } from "@/lib/reset-tokens";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = ResetPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { token, password } = result.data;
    const tokenHash = hashToken(token);

    const now = new Date();

    // Single-use: atomically claim the token if it's still valid.
    const claimed = await db.passwordResetToken.updateMany({
      where: { tokenHash, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    });

    if (claimed.count === 0) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired" },
        { status: 400 }
      );
    }

    const resetToken = await db.passwordResetToken.findUnique({
      where: { tokenHash },
    });
    if (!resetToken) {
      return NextResponse.json({ error: "Reset link not found" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    // Invalidate any leftover sessions for that user as a precaution.
    await db.session.deleteMany({ where: { userId: resetToken.userId } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
