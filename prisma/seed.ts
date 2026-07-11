import "dotenv/config";

/**
 * Seed file is intentionally a no-op.
 *
 * The application no longer ships with hardcoded demo accounts. To get started:
 *   1. Run `pnpm db:push` to apply the schema to dev.db.
 *   2. Visit /signup in the running dev server to create the first account.
 *
 * Re-running `pnpm db:seed` with this script does nothing — there are no
 * fixture users, customers, or invoices to wipe out. The only way data gets
 * into the database is by signing up and using the app.
 */

async function main() {
  console.log("No-op seed: InvoiceLoop does not pre-load fixture data.");
  console.log("Create an account at /signup to get started.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
