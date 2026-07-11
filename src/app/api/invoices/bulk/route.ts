import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";

const BulkActionSchema = z.object({
  ids: z.array(z.string()).min(1),
  action: z.enum(["mark_sent", "mark_paid", "delete"]),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = BulkActionSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { ids, action } = result.data;

  // RBAC: deletes are admin-only, mirroring the single-invoice route.
  if (action === "delete" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: admin only" }, { status: 403 });
  }

  // Scoped to the caller's tenant; never operate across merchants.
  const scopedWhere = { id: { in: ids }, userId: session.user.id };

  try {
    const affected = await db.$transaction(async (tx) => {
      if (action === "delete") {
        const res = await tx.invoice.updateMany({
          where: { ...scopedWhere, deletedAt: null },
          data: { deletedAt: new Date(), publicTokenHash: null },
        });
        return res.count;
      }

      if (action === "mark_sent") {
        const res = await tx.invoice.updateMany({
          where: { ...scopedWhere, deletedAt: null },
          data: { status: "SENT" },
        });
        return res.count;
      }

      if (action === "mark_paid") {
        const invoices = await tx.invoice.findMany({
          where: { ...scopedWhere, deletedAt: null },
        });
        for (const inv of invoices) {
          await tx.invoice.update({
            where: { id: inv.id },
            data: { status: "PAID", balancePaid: inv.total },
          });
        }
        return invoices.length;
      }

      return 0;
    });

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: action === "delete" ? "DELETE" : "UPDATE",
        entity: "INVOICE",
        entityId: ids.join(","),
        details: `Bulk ${action} on ${affected} invoice(s)`,
      },
    });

    return NextResponse.json({ success: true, affected });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
