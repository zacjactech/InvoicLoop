import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const userId = session.user.id;

  const [invoices, customers] = await Promise.all([
    q
      ? db.invoice.findMany({
          where: {
            deletedAt: null,
            userId,
            OR: [
              { invoiceNumber: { contains: q } },
              { customer: { name: { contains: q } } },
            ],
          },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, invoiceNumber: true, customer: { select: { name: true } } },
        })
      : db.invoice.findMany({
          where: { deletedAt: null, userId },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, invoiceNumber: true, customer: { select: { name: true } } },
        }),
    q
      ? db.customer.findMany({
          where: {
            deletedAt: null,
            userId,
            OR: [
              { name: { contains: q } },
              { email: { contains: q } },
              { company: { contains: q } },
            ],
          },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true, email: true, company: true },
        })
      : db.customer.findMany({
          where: { deletedAt: null, userId },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true, email: true, company: true },
        }),
  ]);

  const results = [
    ...invoices.map((i) => ({
      id: i.id,
      label: i.invoiceNumber,
      href: `/dashboard/invoices/${i.id}`,
      meta: i.customer.name,
    })),
    ...customers.map((c) => ({
      id: c.id,
      label: c.name,
      href: `/dashboard/customers`,
      meta: c.company || c.email,
    })),
  ];

  return NextResponse.json({ results });
}