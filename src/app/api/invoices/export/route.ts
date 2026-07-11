import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import type { Invoice, Customer } from "@/generated/prisma/client";

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Neutralise formula-injection vectors (`=`, `+`, `-`, `@`, `\t`, `\r`)
  // and CSV structural delimiters (`,`, `"`, newline). A leading single
  // quote ensures the cell is treated as a literal string by Excel/Sheets.
  const needsQuoting = /["\r\n,]/.test(str);
  const escapedQuotes = str.replace(/"/g, '""');
  const body = /^[=+\-@\t\r]/.test(str) ? `'${escapedQuotes}` : escapedQuotes;
  return needsQuoting || /^[=+\-@\t\r]/.test(str) ? `"${body}"` : body;
}

export async function GET() {
  const session = await getSession();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MEMBER")) {
    return new Response("Forbidden", { status: 403 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(
          "Invoice Number,Customer,Company,Status,Issued Date,Due Date,Total,Balance Paid\r\n"
        )
      );

      let cursor: string | undefined = undefined;
      let hasMore = true;

      while (hasMore) {
        const batch: Array<Invoice & { customer: Customer }> = await db.invoice.findMany({
          take: 100,
          skip: cursor ? 1 : 0,
          cursor: cursor ? { id: cursor } : undefined,
          where: { deletedAt: null, userId: session.user.id },
          include: { customer: true },
          orderBy: { createdAt: "desc" },
        });

        if (batch.length === 0) {
          hasMore = false;
          break;
        }

        for (const invoice of batch) {
          const row = [
            csvEscape(invoice.invoiceNumber),
            csvEscape(invoice.customer.name),
            csvEscape(invoice.customer.company ?? ""),
            csvEscape(invoice.status),
            csvEscape(invoice.issuedDate.toISOString().split("T")[0]),
            csvEscape(invoice.dueDate.toISOString().split("T")[0]),
            csvEscape(invoice.total),
            csvEscape(invoice.balancePaid),
          ].join(",") + "\r\n";

          controller.enqueue(encoder.encode(row));
        }

        cursor = batch[batch.length - 1].id;
        if (batch.length < 100) hasMore = false;
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="invoices_export_${Date.now()}.csv"`,
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
