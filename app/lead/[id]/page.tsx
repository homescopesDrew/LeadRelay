import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { fmtUsd, maskName } from "@/lib/marketplace";
import BuyButton from "@/components/BuyButton";

export const dynamic = "force-dynamic";

const URGENCY_BADGE: Record<string, string> = {
  EMERGENCY: "bg-danger/10 text-danger border border-danger/20",
  HIGH: "bg-warning/15 text-yellow-700 border border-warning/30",
  MEDIUM: "bg-blueprint-500/10 text-blueprint-600 border border-blueprint-500/20",
  LOW: "bg-steel-100 text-steel-600 border border-steel-200",
};

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await db.lead.findUnique({ where: { id: params.id } });
  if (!lead || lead.status === "REMOVED") notFound();

  const user = await getCurrentUser();
  const isSeller = user?.id === lead.sellerId;
  const isBuyer = user?.id === lead.buyerId;
  const canSeeContact = isSeller || isBuyer || user?.role === "ADMIN";
  const purchasable = lead.status === "AVAILABLE" && lead.expiresAt > new Date() && !isSeller;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-sm font-medium text-blueprint-500 hover:text-blueprint-600 transition-colors mb-6">
        ← Back to the board
      </Link>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Main content — left 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          <div className="ticket p-7">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="font-display text-4xl font-bold uppercase tracking-wide leading-none text-steel-900">
                  {lead.jobType}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-steel-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    ZIP {lead.locationZip}
                  </span>
                  <span>·</span>
                  <span>Posted {lead.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      URGENCY_BADGE[lead.urgency] ?? URGENCY_BADGE.LOW
                    }`}
                  >
                    {lead.urgency}
                  </span>
                </div>
              </div>
              {lead.status !== "AVAILABLE" && (
                <span className="text-xs font-semibold uppercase tracking-wider bg-steel-200 text-steel-600 px-3 py-1 rounded-full">
                  {lead.status === "SOLD" ? "Sold" : "Expired"}
                </span>
              )}
            </div>

            <div className="mt-6">
              <h2 className="label">Job description</h2>
              <p className="text-steel-700 whitespace-pre-line leading-relaxed">{lead.description}</p>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 gap-5">
              <div className="bg-steel-50 rounded-xl p-4 border border-steel-100">
                <h2 className="label">Customer budget</h2>
                <p className="font-display text-2xl font-bold text-steel-900 mt-1">
                  {fmtUsd(lead.budgetMin)} – {fmtUsd(lead.budgetMax)}
                </p>
              </div>
              <div className="bg-steel-50 rounded-xl p-4 border border-steel-100">
                <h2 className="label">Listing expires</h2>
                <p className="font-display text-2xl font-bold text-steel-900 mt-1">
                  {lead.expiresAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          {/* Contact block */}
          <div className="ticket p-7">
            <h2 className="label">
              Customer contact{" "}
              {!canSeeContact && (
                <span className="text-steel-400 normal-case font-normal tracking-normal ml-1">— unlocked after purchase</span>
              )}
            </h2>
            {canSeeContact ? (
              <dl className="grid sm:grid-cols-3 gap-4 mt-3">
                {[
                  { label: "Name", value: lead.contactName },
                  { label: "Phone", value: lead.contactPhone },
                  { label: "Email", value: lead.contactEmail },
                ].map((c) => (
                  <div key={c.label} className="bg-steel-50 rounded-xl p-3 border border-steel-100">
                    <dt className="text-xs text-steel-500 font-medium">{c.label}</dt>
                    <dd className="font-semibold text-steel-900 mt-0.5 text-sm">{c.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <dl className="grid sm:grid-cols-3 gap-4 mt-3 select-none" aria-label="Contact info hidden until purchase">
                {[
                  { label: "Name", value: maskName(lead.contactName) },
                  { label: "Phone", value: "███-███-████" },
                  { label: "Email", value: "████@████.com" },
                ].map((c) => (
                  <div key={c.label} className="bg-steel-50 rounded-xl p-3 border border-steel-100 blur-[2px]">
                    <dt className="text-xs text-steel-500 font-medium">{c.label}</dt>
                    <dd className="font-mono text-steel-700 mt-0.5 text-sm">{c.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>

        {/* Purchase sidebar — right col */}
        <div className="lg:col-span-1">
          <div className="ticket p-7 sticky top-24">
            <div className="text-xs font-semibold uppercase tracking-wider text-steel-500">Lead price</div>
            <div className="font-display text-5xl font-bold text-steel-900 mt-1">{fmtUsd(lead.price)}</div>
            <p className="mt-2 text-sm text-steel-400">One-time purchase. Contact info revealed instantly.</p>

            <div className="mt-6 border-t border-steel-100 pt-6">
              {purchasable ? (
                user ? (
                  <BuyButton leadId={lead.id} priceLabel={fmtUsd(lead.price)} />
                ) : (
                  <Link href={`/login?next=/lead/${lead.id}`} className="btn-primary w-full justify-center">
                    Sign in to buy — {fmtUsd(lead.price)}
                  </Link>
                )
              ) : isSeller ? (
                <div className="bg-blueprint-500/5 border border-blueprint-500/20 rounded-xl p-4 text-sm text-steel-600">
                  This is your listing. You&apos;ll get an email the moment it sells.
                </div>
              ) : lead.status === "SOLD" ? (
                <div className="bg-success/5 border border-success/20 rounded-xl p-4 text-sm text-steel-600">
                  This lead has been sold.
                </div>
              ) : null}
            </div>

            <div className="mt-6 space-y-2.5 text-xs text-steel-400">
              <div className="flex items-center gap-2">
                <span className="text-success">✓</span> Secure checkout via Stripe
              </div>
              <div className="flex items-center gap-2">
                <span className="text-success">✓</span> Contact info delivered instantly
              </div>
              <div className="flex items-center gap-2">
                <span className="text-success">✓</span> Emailed copy for your records
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
