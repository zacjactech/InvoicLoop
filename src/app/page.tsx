import Link from "next/link";
import type { Metadata } from "next";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

export const metadata: Metadata = {
  title: "InvoiceLoop | Billing & Invoicing for Modern Merchants",
  description:
    "Track balances, generate professional invoices, and send interactive payment portals. Built for teams that move fast.",
};

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--surface)]/70 backdrop-blur-2xl border-b border-[var(--border)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white shadow-sm shadow-emerald-600/20"
            style={{ transform: "rotate(-12deg)" }}
          >
            I
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            InvoiceLoop
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:shadow-md hover:shadow-emerald-600/25"
          >
            Get started free
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-16 lg:flex-row lg:items-center lg:gap-20">
          {/* Left: copy */}
          <div className="max-w-xl">
            <AnimateOnScroll>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur-sm dark:text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Shipping fast, breaking nothing
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={100}>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
                Your invoices,{" "}
                <br className="hidden sm:block" />
                <span className="text-emerald-600 dark:text-emerald-400">
                  finally organized
                </span>
              </h1>
            </AnimateOnScroll>

            <AnimateOnScroll delay={200}>
              <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
                Stop juggling spreadsheets and email threads. InvoiceLoop gives you
                a single place to create invoices, track payments, and see who owes
                you what, with a customer portal so they can pay in one click.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll delay={300}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-600/25"
                >
                  Create your workspace
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-[var(--surface-elevated)] dark:text-slate-300"
                >
                  Sign in
                </Link>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={400}>
              <p className="mt-5 text-xs text-slate-400 dark:text-slate-500">
                First user becomes admin. Takes 30 seconds.
              </p>
            </AnimateOnScroll>
          </div>

          {/* Right: floating app cards */}
          <div className="relative flex-1">
            <AnimateOnScroll delay={200}>
              {/* Ambient glow */}
              <div className="absolute -inset-8 rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />

              {/* Dashboard screenshot */}
              <div className="relative">
                <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-slate-900/10 dark:shadow-black/30">
                  {/* Fake browser bar */}
                  <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="ml-3 flex-1 rounded-md bg-[var(--background)] px-3 py-1 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                      invoiceloop.app/dashboard
                    </div>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/dashboard-screenshot.png"
                    alt="InvoiceLoop dashboard showing financial summary, revenue chart, and recent invoices"
                    className="w-full"
                    width={1440}
                    height={900}
                  />
                </div>

                {/* Floating stat card */}
                <div className="absolute -bottom-6 -left-6 glass-strong rounded-xl px-4 py-3 shadow-lg dark:shadow-black/20">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Collected this month
                  </p>
                  <p className="mt-0.5 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    $12,480
                  </p>
                </div>

                {/* Floating status badge */}
                <div className="absolute -top-3 -right-3 glass-strong rounded-lg px-3 py-1.5 shadow-lg dark:shadow-black/20">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      3 paid today
                    </span>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Add your customers",
      body: "Name, email, company. Store the basics so you never re-type them. Every customer gets a clean record with their invoice history.",
    },
    {
      step: "02",
      title: "Create an invoice",
      body: "Pick a customer, add line items, set tax and discounts. The preview updates in real time so you see exactly what they'll get.",
    },
    {
      step: "03",
      title: "Share & get paid",
      body: "Send a public link. Your customer views the invoice, downloads a PDF, and pays in one click. You see the status change live.",
    },
  ];

  return (
    <section className="py-32 border-t border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-6">
        <AnimateOnScroll>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            How it works
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Three steps to your first invoice
          </h2>
        </AnimateOnScroll>

        <div className="mt-20 grid gap-12 sm:grid-cols-3">
          {steps.map((s, i) => (
            <AnimateOnScroll key={s.step} delay={i * 120}>
              <div className="relative">
                <span className="text-6xl font-bold text-slate-100 dark:text-zinc-800">
                  {s.step}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {s.body}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function UseCases() {
  const cases = [
    {
      emoji: " freelancers",
      title: "Freelancers",
      body: "Send polished invoices between projects. Get paid faster with a one-click portal instead of chasing via email.",
    },
    {
      emoji: " agencies",
      title: "Small agencies",
      body: "Manage multiple clients with role-based access. Your team creates invoices, you review and export for accounting.",
    },
    {
      emoji: " consultants",
      title: "Consultants",
      body: "Track hours and milestones per engagement. Export CSV for your accountant without the spreadsheet gymnastics.",
    },
  ];

  return (
    <section className="py-32 border-t border-[var(--border)] bg-[var(--surface-elevated)]/50">
      <div className="mx-auto max-w-6xl px-6">
        <AnimateOnScroll>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Built for
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            People who&apos;d rather work than chase payments
          </h2>
        </AnimateOnScroll>

        <div className="mt-20 grid gap-8 sm:grid-cols-3">
          {cases.map((c, i) => (
            <AnimateOnScroll key={c.title} delay={i * 120}>
              <div className="glass rounded-2xl p-8 transition-all hover:shadow-lg hover:shadow-emerald-500/5">
                <div className="text-3xl">{c.emoji}</div>
                <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                  {c.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {c.body}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: "Is there a free tier?",
      a: "Yes. InvoiceLoop is free for a single workspace with unlimited invoices. You only pay if you need multiple team seats or priority support down the line.",
    },
    {
      q: "Can customers pay through the portal?",
      a: "The public portal lets customers view, download PDF, and mark invoices as paid. Real payment processing (Stripe, etc.) is on the roadmap.",
    },
    {
      q: "What about my existing data?",
      a: "InvoiceLoop supports CSV import for invoices and customers. Export from your current tool and import in one batch.",
    },
    {
      q: "Is my data secure?",
      a: "Passwords are bcrypt-hashed, sessions are httpOnly cookies, and every API route requires authentication. The first user becomes the workspace admin with full control.",
    },
  ];

  return (
    <section className="py-32 border-t border-[var(--border)]">
      <div className="mx-auto max-w-2xl px-6">
        <AnimateOnScroll>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            FAQ
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Common questions
          </h2>
        </AnimateOnScroll>

        <div className="mt-14 space-y-8">
          {items.map((item, i) => (
            <AnimateOnScroll key={item.q} delay={i * 80}>
              <div className="border-b border-[var(--border)] pb-8 last:border-0">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  {item.q}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.a}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-32 border-t border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-6">
        <AnimateOnScroll>
          <div className="glass-strong rounded-3xl p-12 text-center sm:p-20">
            <div
              className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-bold text-white shadow-lg shadow-emerald-600/20"
              style={{ transform: "rotate(-12deg)" }}
            >
              I
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              Stop losing track of who owes you
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base text-slate-600 dark:text-slate-400">
              Set up your workspace in under a minute. Add a customer, send an
              invoice, and watch the payments roll in.
            </p>
            <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-600/25"
              >
                Get started, it&apos;s free
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-[10px] font-bold text-white"
            style={{ transform: "rotate(-12deg)" }}
          >
            I
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            InvoiceLoop
          </span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Open source invoicing for modern teams.
        </p>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Nav />
      <Hero />
      <HowItWorks />
      <UseCases />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
