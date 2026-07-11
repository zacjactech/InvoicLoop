import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import { CustomerSchema } from "@/lib/validators";

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
  const customer = await db.customer.findFirst({
    where: { id, deletedAt: null, userId: session.user.id },
    include: {
      invoices: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) return notFound();

  return NextResponse.json(customer);
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
  const result = CustomerSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const customer = await db.$transaction(async (tx) => {
      const existing = await tx.customer.findFirst({
        where: { id, deletedAt: null, userId: session.user.id },
      });
      if (!existing) throw new Error("NOT_FOUND");

      const updated = await tx.customer.update({
        where: { id },
        data: result.data,
      });

      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE",
          entity: "CUSTOMER",
          entityId: id,
          details: `Updated customer ${updated.name}`,
        },
      });

      return updated;
    });

    return NextResponse.json(customer);
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
      const existing = await tx.customer.findFirst({
        where: { id, deletedAt: null, userId: session.user.id },
      });
      if (!existing) throw new Error("NOT_FOUND");

      await tx.customer.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action: "DELETE",
          entity: "CUSTOMER",
          entityId: id,
          details: `Deleted customer ${existing.name}`,
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
