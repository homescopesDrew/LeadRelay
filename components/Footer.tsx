import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-steel-950 text-steel-400 text-sm">
      <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col sm:flex-row gap-6 justify-between">
        <div>
          <div className="font-display text-xl font-bold tracking-wide text-white">
            <span className="text-safety-500">LEAD</span>RELAY
          </div>
          <p className="mt-2 max-w-xs">
            Turn the jobs you can&apos;t take into money. Built for the trades.
          </p>
        </div>
        <nav className="flex gap-8">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-widest text-steel-500">Marketplace</span>
            <Link href="/marketplace" className="hover:text-white">Browse leads</Link>
            <Link href="/post-lead" className="hover:text-white">Post a lead</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-widest text-steel-500">Account</span>
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link href="/signup" className="hover:text-white">Create account</Link>
          </div>
        </nav>
      </div>
      <div className="border-t border-steel-800 py-4 text-center text-xs text-steel-500">
        © {new Date().getFullYear()} LeadRelay. All transactions processed by Stripe.
      </div>
    </footer>
  );
}
