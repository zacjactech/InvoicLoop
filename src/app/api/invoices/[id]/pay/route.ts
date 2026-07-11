import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";

function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const invoice = await db.$transaction(async (tx) => {
      const existing = await tx.invoice.findFirst({
        where: { id, deletedAt: null, userId: session.user.id },
        include: { customer: true },
      });
      if (!existing) throw new Error("NOT_FOUND");

      const updated = await tx.invoice.update({
        where: { id },
        data: { status: "PAID", balancePaid: existing.total },
      });

      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE",
          entity: "INVOICE",
          entityId: id,
          details: `Invoice ${existing.invoiceNumber} for ${existing.customer.name} marked as PAID. Amount settled: $${existing.total.toFixed(2)}.`,
        },
      });

      return updated;
    });

    return NextResponse.json(invoice);
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") return notFound();
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return notFound();
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
