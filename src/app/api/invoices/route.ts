import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import { InvoiceSchema } from "@/lib/validators";
import {
  buildPublicInvoiceUrl,
  issuePublicInvoiceToken,
} from "@/lib/public-token";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const customerId = searchParams.get("customerId") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    deletedAt: null,
    userId: session.user.id,
    ...(status ? { status } : {}),
    ...(customerId ? { customerId } : {}),
    ...(search
      ? {
          OR: [
            { invoiceNumber: { contains: search } },
            { customer: { name: { contains: search } } },
          ],
        }
      : {}),
  };

  const [invoices, total] = await Promise.all([
    db.invoice.findMany({
      where,
      include: { customer: true, items: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.invoice.count({ where }),
  ]);

  return NextResponse.json({
    invoices,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = InvoiceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { items, ...invoiceData } = result.data;

    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = subtotal * ((invoiceData.taxRate || 0) / 100);
    const total = subtotal + taxAmount - (invoiceData.discount || 0);

    const { raw: shareTokenRaw, hash: shareTokenHash } =
      issuePublicInvoiceToken();
    const shareUrl = buildPublicInvoiceUrl("placeholder", shareTokenRaw);

    const invoice = await db.$transaction(async (tx) => {
      const created = await tx.invoice.create({
        data: {
          ...invoiceData,
          issuedDate: new Date(invoiceData.issuedDate),
          dueDate: new Date(invoiceData.dueDate),
          userId: session.user.id,
          total,
          publicTokenHash: shareTokenHash,
          items: {
            create: items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.quantity * item.unitPrice,
            })),
          },
        },
        include: { customer: true, items: true },
      });

      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action: "CREATE",
          entity: "INVOICE",
          entityId: created.id,
          details: `Created invoice ${created.invoiceNumber} for ${created.customer.name}. Total: $${total.toFixed(2)}`,
        },
      });

      return created;
    });

    const finalShareUrl = shareUrl.replace(
      `/invoice/public/placeholder`,
      `/invoice/public/${encodeURIComponent(invoice.id)}`
    );

    return NextResponse.json(
      { ...invoice, shareUrl: finalShareUrl },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
