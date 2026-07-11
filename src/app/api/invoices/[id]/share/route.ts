import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import {
  buildPublicInvoiceUrl,
  issuePublicInvoiceToken,
} from "@/lib/public-token";

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

  const existing = await db.invoice.findFirst({
    where: { id, deletedAt: null, userId: session.user.id },
  });
  if (!existing) return notFound();

  const { raw, hash } = issuePublicInvoiceToken();
  await db.invoice.update({
    where: { id: existing.id },
    data: { publicTokenHash: hash },
  });

  await db.activityLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE",
      entity: "INVOICE",
      entityId: existing.id,
      details: "Rotated public share token",
    },
  });

  return NextResponse.json({
    shareUrl: buildPublicInvoiceUrl(existing.id, raw),
  });
}
