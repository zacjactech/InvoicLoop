import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function safeEqualHex(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "hex");
  const bBuf = Buffer.from(b, "hex");
  if (aBuf.length !== bBuf.length || aBuf.length === 0) return false;
  return timingSafeEqual(aBuf, bBuf);
}

/**
 * Generates a fresh reset token plus its hash + expiry.
 * Returns the raw token once: only its hash is persisted in the DB.
 */
export function issueResetToken(): { raw: string; hash: string; expiresAt: Date } {
  const raw = randomBytes(32).toString("base64url");
  const hash = hashToken(raw);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  return { raw, hash, expiresAt };
}

export function buildResetUrl(rawToken: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  return `${base}/reset-password?token=${encodeURIComponent(rawToken)}`;
}

/**
 * Used by email integrations. Never leaks the raw token to the client other
 * than the URL above. Tokens are single-use; reset password route checks
 * `usedAt` and `expiresAt`.
 */
export const RESET_TOKEN_TTL_MS = TOKEN_TTL_MS;
