import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function diffInDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const allInvoices = await db.invoice.findMany({
    where: { deletedAt: null, userId },
    select: {
      id: true,
      invoiceNumber: true,
      status: true,
      total: true,
      balancePaid: true,
      issuedDate: true,
      dueDate: true,
      createdAt: true,
      updatedAt: true,
      customer: { select: { name: true } },
    },
  });

  const totalRevenue = allInvoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + i.total, 0);

  const outstandingBalance = allInvoices
    .filter((i) => i.status !== "PAID")
    .reduce((sum, i) => sum + (i.total - i.balancePaid), 0);

  const paidCount = allInvoices.filter((i) => i.status === "PAID").length;
  const overdueCount = allInvoices.filter((i) => i.status === "OVERDUE").length;
  const totalCount = allInvoices.length;

  // Average days to pay across all paid invoices using issuedDate → updatedAt
  // (updatedAt is used as a proxy for when the invoice was settled, since the
  // schema has no settlementDate). Falls back to null when no data.
  const paidWithDates = allInvoices.filter((i) => i.status === "PAID");
  const averageDaysToPay =
    paidWithDates.length === 0
      ? null
      : paidWithDates.reduce(
          (sum, i) => sum + Math.abs(diffInDays(i.updatedAt, i.issuedDate)),
          0
        ) / paidWithDates.length;

  // Build last 6 months of revenue from PAID invoices.
  const now = new Date();
  const months: { label: string; year: number; month: number; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(addMonths(now, -i));
    months.push({
      label: MONTH_LABELS[monthStart.getMonth()],
      year: monthStart.getFullYear(),
      month: monthStart.getMonth(),
      value: 0,
    });
  }

  for (const invoice of allInvoices) {
    if (invoice.status !== "PAID") continue;
    const settled = invoice.updatedAt;
    const entry = months.find(
      (m) => m.year === settled.getFullYear() && m.month === settled.getMonth()
    );
    if (entry) entry.value += invoice.total;
  }

  // Compare this calendar month revenue to the previous one for the % change.
  const thisMonth = months[months.length - 1].value;
  const previousMonth = months[months.length - 2].value;
  const revenuePercentChange =
    previousMonth === 0
      ? thisMonth === 0
        ? null
        : null // arbitrarily high; reporting null avoids a misleading "inf%" signal
      : ((thisMonth - previousMonth) / previousMonth) * 100;

  const recentInvoices = allInvoices
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map((i) => ({
      id: i.id,
      invoiceNumber: i.invoiceNumber,
      status: i.status,
      total: i.total,
      dueDate: i.dueDate.toISOString(),
      customer: { name: i.customer.name },
    }));

  return NextResponse.json({
    totalRevenue,
    outstandingBalance,
    paidCount,
    totalCount,
    overdueCount,
    averageDaysToPay,
    revenuePercentChange,
    recentInvoices,
    monthlyRevenue: months.map(({ label, value }) => ({ label, value })),
  });
}
