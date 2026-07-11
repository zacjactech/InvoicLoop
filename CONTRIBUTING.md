# Contributing to InvoicLoop

Thanks for taking the time to contribute! This project is small and
opinionated; please open an issue before opening a non-trivial PR so we can
agree on direction before you sink time into it.

## Development setup

Prerequisites: **Node 20+** and **pnpm 11+** (`corepack enable` will fetch it
for you if it's not installed).

```bash
pnpm install
cp .env.example .env
pnpm db:push
pnpm dev
```

## Workflow

1. Fork & branch from `main` (`feat/<short-name>`, `fix/<short-name>`, etc.).
2. Keep changes focused — one PR per concern.
3. Before pushing:
   ```bash
   pnpm lint
   pnpm build           # also runs tsc
   pnpm audit           # should report 0 vulnerabilities
   ```
4. Write a clear PR description:
   - What changed and why
   - Linked issue (if any)
   - Migration / env-var instructions if behaviour changes
   - Screenshots / recordings for UI changes

## Coding conventions

- **TypeScript everywhere.** No `any` in checked-in code.
- **Validation at the edge** — every API route validates inputs with a Zod
  schema in `src/lib/validators.ts` before touching the DB.
- **Tenant scoping.** Every owner-side query includes `userId: session.user.id`
  in its `where`. The only cross-tenant code paths are admin-gated.
- **Neuter XSS** — never use `dangerouslySetInnerHTML` with dynamic input. The
  one occurrence in `src/app/layout.tsx` writes a hardcoded constant.
- **No raw `console.info` of secrets, tokens, or URLs that embed tokens.**
- **Don't bypass ESLint with `eslint-disable`** without a justification comment.

## Commit messages

Conventional Commits are preferred:

```
feat(invoices): rotate share token endpoint
fix(auth): constant-time login
chore(deps): bump prisma to 7.8
```

## Reporting bugs

Use the [bug report template](./.github/ISSUE_TEMPLATE/bug_report.md).
For security issues, **do not** open a public issue — see
[`SECURITY.md`](./SECURITY.md).

## License

By contributing, you agree that your contributions will be licensed under the
project's [MIT](./LICENSE) license.
