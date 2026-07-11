import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";

const UpdateStatusSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE"]),
  notes: z.string().optional(),
});

function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const invoice = await db.invoice.findFirst({
    where: { id, deletedAt: null, userId: session.user.id },
    include: {
      customer: true,
      items: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!invoice) return notFound();

  return NextResponse.json(invoice);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const result = UpdateStatusSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const invoice = await db.$transaction(async (tx) => {
      const existing = await tx.invoice.findFirst({
        where: { id, deletedAt: null, userId: session.user.id },
      });
      if (!existing) {
        throw new Error("NOT_FOUND");
      }

      const updated = await tx.invoice.update({
        where: { id },
        data: result.data,
      });

      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE",
          entity: "INVOICE",
          entityId: id,
          details: `Updated invoice ${existing.invoiceNumber}. Status: ${updated.status}`,
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: admin only" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await db.$transaction(async (tx) => {
      const existing = await tx.invoice.findFirst({ where: { id } });
      if (!existing) {
        throw new Error("NOT_FOUND");
      }

      await tx.invoice.update({
        where: { id },
        data: { deletedAt: new Date(), publicTokenHash: null },
      });

      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action: "DELETE",
          entity: "INVOICE",
          entityId: id,
          details: `Deleted invoice ${existing.invoiceNumber}`,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") return notFound();
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return notFound();
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
