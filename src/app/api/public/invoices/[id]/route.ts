import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
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

export async function GET(
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

  const invoice = await db.invoice.findFirst({
    where: { id, deletedAt: null, publicTokenHash: { not: null } },
    include: {
      customer: true,
      items: { orderBy: { id: "asc" } },
    },
  });

  if (!invoice || !invoice.publicTokenHash) return notFound();
  if (!safeEqualHex(presentedHash, invoice.publicTokenHash)) {
    return notFound();
  }

  return NextResponse.json({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    total: invoice.total,
    balancePaid: invoice.balancePaid,
    taxRate: invoice.taxRate,
    discount: invoice.discount,
    currency: invoice.currency,
    issuedDate: invoice.issuedDate,
    dueDate: invoice.dueDate,
    notes: invoice.notes,
    customer: {
      name: invoice.customer.name,
      company: invoice.customer.company,
      email: invoice.customer.email,
      address: invoice.customer.address,
    },
    items: invoice.items.map((it) => ({
      id: it.id,
      description: it.description,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      amount: it.amount,
    })),
  });
}
