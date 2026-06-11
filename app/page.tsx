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
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-[#0d2240] to-steel-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(26,115,232,0.15)_0%,_transparent_60%)] pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blueprint-500 bg-blueprint-500/10 border border-blueprint-500/20 rounded-full px-3 py-1">
            The lead board for the trades
          </p>
          <h1 className="mt-6 font-display text-5xl sm:text-7xl font-bold uppercase leading-[0.92] tracking-tight max-w-3xl">
            Too booked to take the job?
            <span className="text-blueprint-500"> Sell the lead.</span>
          </h1>
          <p className="mt-6 max-w-xl text-steel-300 text-lg leading-relaxed">
            LeadRelay is a marketplace where contractors sell job leads they can&apos;t
            take — and other contractors buy them instantly. No junk leads, no monthly
            quotas. Just real customers, posted by real pros.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/marketplace" className="btn-primary !text-base !px-6 !py-3">
              Browse the board
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-all duration-150"
            >
              Join free
            </Link>
          </div>
          <div className="mt-12 flex gap-8 text-sm text-steel-400">
            <div><span className="text-white font-bold text-lg">500+</span><br />leads sold</div>
            <div><span className="text-white font-bold text-lg">$120K+</span><br />paid to sellers</div>
            <div><span className="text-white font-bold text-lg">48 hrs</span><br />avg. time to sale</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold uppercase tracking-wide">How it works</h2>
          <p className="mt-3 text-steel-500 text-base max-w-lg mx-auto">
            Three steps from surplus lead to money in your pocket.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              num: "01",
              t: "Post the lead you can't take",
              d: "Job type, ZIP, budget, urgency. Customer contact info stays hidden until purchase.",
              color: "text-blueprint-500",
            },
            {
              num: "02",
              t: "Another pro buys it instantly",
              d: "Stripe checkout in seconds. Contact info revealed on the spot and emailed to the buyer.",
              color: "text-safety-500",
            },
            {
              num: "03",
              t: "You get paid for what you couldn't take",
              d: "Set your own price. LeadRelay takes a 10–20% fee depending on your plan.",
              color: "text-success",
            },
          ].map((s) => (
            <div key={s.t} className="ticket p-6 pl-8 group hover:shadow-ticket-hover hover:-translate-y-0.5">
              <div className={`font-display text-4xl font-bold ${s.color} mb-3`}>{s.num}</div>
              <h3 className="font-display text-xl font-semibold uppercase leading-tight">{s.t}</h3>
              <p className="mt-2 text-sm text-steel-500 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fresh leads */}
      {recentLeads.length > 0 && (
        <section className="bg-steel-100/60 border-y border-steel-200">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="flex items-baseline justify-between mb-8">
              <div>
                <h2 className="font-display text-4xl font-bold uppercase tracking-wide">Fresh on the board</h2>
                <p className="mt-1 text-sm text-steel-500">Just posted by contractors in your area</p>
              </div>
              <Link href="/marketplace" className="text-sm font-medium text-blueprint-500 hover:text-blueprint-600 transition-colors">
                See all leads →
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {recentLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="font-display text-4xl font-bold uppercase tracking-wide text-center mb-12">
          Trusted by contractors
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              quote: "Sold a $4,500 roofing lead in under 3 hours. Best 15 minutes of admin work I've ever done.",
              name: "Mike T.",
              trade: "Roofing — Metro Detroit",
            },
            {
              quote: "I was skeptical but the leads are legit. Bought two HVAC calls last month, closed both.",
              name: "Sarah L.",
              trade: "HVAC — Columbus, OH",
            },
            {
              quote: "Finally a way to monetize the overflow. Posted 6 leads this quarter, made $400+ in fees.",
              name: "Carlos M.",
              trade: "Plumbing — Phoenix, AZ",
            },
          ].map((t) => (
            <div key={t.name} className="ticket p-6 pl-8">
              <p className="text-steel-700 text-sm leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blueprint-500/10 flex items-center justify-center text-blueprint-500 font-bold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-sm text-steel-900">{t.name}</div>
                  <div className="text-xs text-steel-500">{t.trade}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gradient-to-b from-steel-100/60 to-white border-t border-steel-200">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold uppercase tracking-wide">Simple pricing</h2>
            <p className="mt-3 text-steel-500 max-w-md mx-auto">
              Free to join. Upgrade when you need more firepower.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                sub: "Always free",
                fee: "20% fee on sales",
                perks: ["Buy up to 3 leads/month", "Post unlimited leads", "Email lead alerts"],
                cta: "Get started",
                highlight: false,
              },
              {
                name: "Pro",
                price: "$29",
                sub: "per month",
                fee: "15% fee on sales",
                perks: ["Unlimited lead purchases", "Early access to new leads", "Everything in Free"],
                cta: "Start Pro",
                highlight: true,
              },
              {
                name: "Elite",
                price: "$99",
                sub: "per month",
                fee: "10% fee on sales",
                perks: ["Priority notifications", "Lowest marketplace fee", "Everything in Pro"],
                cta: "Go Elite",
                highlight: false,
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`ticket p-7 flex flex-col relative ${
                  p.highlight
                    ? "border-blueprint-500 shadow-[0_0_0_2px_#1A73E8,0_8px_30px_-6px_rgba(26,115,232,0.25)]"
                    : ""
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blueprint-500 text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="font-display text-2xl font-bold uppercase">{p.name}</h3>
                <div className="mt-3 flex items-end gap-1">
                  <span className="font-display text-4xl font-bold">{p.price}</span>
                  <span className="text-sm text-steel-500 mb-1">{p.sub}</span>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-safety-500 mt-1">{p.fee}</div>
                <ul className="mt-5 space-y-2.5 text-sm text-steel-600 flex-1">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-success/15 text-success flex items-center justify-center text-[10px] font-bold flex-shrink-0">✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-7 ${p.highlight ? "btn-primary w-full justify-center" : "btn-secondary w-full justify-center"}`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
