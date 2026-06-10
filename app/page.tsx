import Link from "next/link";
import { db } from "@/lib/db";
import LeadCard from "@/components/LeadCard";

export const revalidate = 60;

export default async function LandingPage() {
  const recentLeads = await db.lead
    .findMany({
      where: { status: "AVAILABLE", expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      take: 3,
    })
    .catch(() => []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-steel-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-safety-400">
            The lead board for the trades
          </p>
          <h1 className="mt-4 font-display text-5xl sm:text-7xl font-bold uppercase leading-[0.95] tracking-tight max-w-3xl">
            Too booked to take the job?
            <span className="text-safety-500"> Sell the lead.</span>
          </h1>
          <p className="mt-6 max-w-xl text-steel-300 text-lg">
            LeadRelay is a marketplace where contractors sell job leads they can&apos;t
            take — and other contractors buy them instantly. No junk leads, no monthly
            quotas. Just real customers, posted by real pros.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/marketplace" className="btn-primary">Browse the board</Link>
            <Link href="/signup" className="btn-ghost !border-steel-700 !text-steel-200 hover:!border-steel-400">
              Join free
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold uppercase tracking-wide">How it works</h2>
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          {[
            {
              t: "Post the lead you can't take",
              d: "Job type, ZIP, budget, urgency. Customer contact info stays hidden until purchase.",
            },
            {
              t: "Another pro buys it instantly",
              d: "Stripe checkout, contact info revealed on the spot and emailed to the buyer.",
            },
            {
              t: "You get paid for waste",
              d: "Set your own price. LeadRelay takes a 10–20% fee depending on your plan.",
            },
          ].map((s) => (
            <div key={s.t} className="ticket p-5 pl-9">
              <h3 className="font-display text-xl font-semibold uppercase">{s.t}</h3>
              <p className="mt-2 text-sm text-steel-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fresh leads */}
      {recentLeads.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-3xl font-bold uppercase tracking-wide">Fresh on the board</h2>
            <Link href="/marketplace" className="text-sm text-blueprint-700 hover:underline">See all leads →</Link>
          </div>
          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            {recentLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </section>
      )}

      {/* Pricing */}
      <section className="bg-white border-y border-steel-200">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-display text-3xl font-bold uppercase tracking-wide">Plans</h2>
          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            {[
              { name: "Free", price: "$0", fee: "20% fee on sales", perks: ["Buy up to 3 leads/month", "Post unlimited leads", "Email lead alerts"] },
              { name: "Pro", price: "$29/mo", fee: "15% fee on sales", perks: ["Unlimited lead purchases", "Early access to new leads", "Everything in Free"] },
              { name: "Elite", price: "$99/mo", fee: "10% fee on sales", perks: ["Priority notifications", "Lowest marketplace fee", "Everything in Pro"] },
            ].map((p) => (
              <div key={p.name} className="ticket p-6 pl-10 flex flex-col">
                <h3 className="font-display text-2xl font-bold uppercase">{p.name}</h3>
                <div className="font-display text-4xl font-bold mt-2">{p.price}</div>
                <div className="font-mono text-xs uppercase tracking-widest text-safety-600 mt-1">{p.fee}</div>
                <ul className="mt-4 space-y-2 text-sm text-steel-600 flex-1">
                  {p.perks.map((perk) => (
                    <li key={perk}>— {perk}</li>
                  ))}
                </ul>
                <Link href="/signup" className="btn-secondary !text-base mt-6">Get started</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
