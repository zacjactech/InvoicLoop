/**
 * Centralised environment-variable validation.
 *
 * Called from request handlers (not from module-load time) so that
 * `next build`'s static collection doesn't have to satisfy every env
 * invariant at compile time. Any weak secret fails fast at the first
 * runtime boundary instead of silently degrading auth or token signing.
 *
 * Rules:
 *   - AUTH_SECRET must always be defined.
 *   - When NODE_ENV === "production", AUTH_SECRET must additionally:
 *       * not be a known placeholder, and
 *       * be at least 32 characters.
 */

const PLACEHOLDER_SECRETS = new Set([
  "replace-me-with-a-secure-random-value",
  "dev-only-replace-in-production-7f3a9b2c1e8d4a6f",
]);

function fail(msg: string): never {
  throw new Error(`[env] ${msg}`);
}

export function assertRuntimeEnv(): void {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    fail(
      "AUTH_SECRET is not configured. Generate one with `openssl rand -base64 32`."
    );
  }
  const isProd = process.env.NODE_ENV === "production";
  if (isProd && PLACEHOLDER_SECRETS.has(value)) {
    fail(
      "AUTH_SECRET is still set to a known placeholder. Replace it before running outside local development."
    );
  }
  if (isProd && value.length < 32) {
    fail("AUTH_SECRET must be at least 32 characters in production.");
  }
}

let bootPromise: Promise<void> | null = null;

export function ensureRuntimeEnv(): Promise<void> {
  if (bootPromise) return bootPromise;
  bootPromise = Promise.resolve().then(() => {
    assertRuntimeEnv();
  });
  return bootPromise;
}
