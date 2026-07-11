import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { hashPublicInvoiceToken } from "@/lib/public-token";

function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const aBuf = Buffer.from(a, "hex");
    const bBuf = Buffer.from(b, "hex");
    if (aBuf.length === 0 || aBuf.length !== bBuf.length) return false;
    return timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const token =
    new URL(request.url).searchParams.get("token")?.trim() ?? "";
  if (!token) {
    return NextResponse.json({ error: "Invalid share link" }, { status: 403 });
  }
  const presentedHash = hashPublicInvoiceToken(token);

  try {
    const updated = await db.$transaction(async (tx) => {
      const existing = await tx.invoice.findFirst({
        where: { id, deletedAt: null, publicTokenHash: { not: null } },
        include: { customer: true },
      });
      if (!existing || !existing.publicTokenHash) {
        throw new Error("NOT_FOUND");
      }
      if (!safeEqualHex(presentedHash, existing.publicTokenHash)) {
        throw new Error("NOT_FOUND");
      }

      const isAlreadyPaid = existing.status === "PAID";
      const next = await tx.invoice.update({
        where: { id: existing.id },
        data: isAlreadyPaid
          ? {}
          : { status: "PAID", balancePaid: existing.total },
      });

      if (!isAlreadyPaid) {
        await tx.activityLog.create({
          data: {
            userId: existing.userId,
            action: "UPDATE",
            entity: "INVOICE",
            entityId: id,
            details: `Invoice ${existing.invoiceNumber} settled by customer ${existing.customer.name} via public portal. Amount: $${existing.total.toFixed(2)}.`,
          },
        });
      }

      return next;
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") return notFound();
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return notFound();
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
