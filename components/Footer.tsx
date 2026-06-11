import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy text-steel-400 text-sm">
      <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col sm:flex-row gap-8 justify-between">
        <div>
          <div className="font-display text-xl font-bold tracking-wide text-white">
            <span className="text-blueprint-500">LEAD</span>RELAY
          </div>
          <p className="mt-2 max-w-xs text-steel-400 text-sm leading-relaxed">
            Turn the jobs you can&apos;t take into money. Built for the trades.
          </p>
        </div>
        <nav className="flex gap-10">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-steel-500">Marketplace</span>
            <Link href="/marketplace" className="hover:text-white transition-colors">Browse leads</Link>
            <Link href="/post-lead" className="hover:text-white transition-colors">Post a lead</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-steel-500">Account</span>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Create account</Link>
          </div>
        </nav>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-steel-600">
        © {new Date().getFullYear()} LeadRelay — All transactions processed by Stripe.
      </div>
    </footer>
  );
}
