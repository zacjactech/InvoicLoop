import { createHash, randomBytes } from "node:crypto";

/**
 * Generates an unguessable, single-invoice public share token plus its hash.
 *
 * Mechanics:
 *   - The raw 256-bit token (base64url) is what goes into the customer-facing URL.
 *     Anyone holding it can view/settle the invoice from the public portal.
 *   - Only `sha256(token)` is stored in the database, so a DB leak does not
 *     expose active share links. Constant-time comparison is used at verify
 *     time to neutralise length-splicing / hash prefix attacks.
 *   - Tokens can be rotated (re-issued) by the invoice owner to revoke access.
 */
export function issuePublicInvoiceToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("base64url");
  const hash = hashPublicInvoiceToken(raw);
  return { raw, hash };
}

export function hashPublicInvoiceToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function buildPublicInvoiceUrl(
  invoiceId: string,
  rawToken: string
): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  return `${base}/invoice/public/${encodeURIComponent(invoiceId)}?token=${encodeURIComponent(rawToken)}`;
}
