import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { fmtUsd, maskName } from "@/lib/marketplace";
import BuyButton from "@/components/BuyButton";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await db.lead.findUnique({ where: { id: params.id } });
  if (!lead || lead.status === "REMOVED") notFound();

  const user = await getCurrentUser();
  const isSeller = user?.id === lead.sellerId;
  const isBuyer = user?.id === lead.buyerId;
  const canSeeContact = isSeller || isBuyer || user?.role === "ADMIN";
  const purchasable = lead.status === "AVAILABLE" && lead.expiresAt > new Date() && !isSeller;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/marketplace" className="text-sm text-blueprint-700 hover:underline">← Back to the board</Link>

      <div className="ticket mt-4 p-6 sm:p-8 sm:pl-12 pl-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-4xl font-bold uppercase tracking-wide leading-none">
              {lead.jobType}
            </h1>
            <p className="font-mono text-xs text-steel-500 mt-2">
              ZIP {lead.locationZip} · urgency {lead.urgency} · posted{" "}
              {lead.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
          <div className="text-right">
            <div className="font-mono text-[11px] uppercase tracking-widest text-steel-500">Lead price</div>
            <div className="font-display text-4xl font-bold">{fmtUsd(lead.price)}</div>
          </div>
        </div>

        {lead.status !== "AVAILABLE" && (
          <p className="mt-4 inline-block font-mono text-xs uppercase tracking-widest bg-steel-200 text-steel-600 px-2 py-1 rounded">
            {lead.status === "SOLD" ? "Sold" : "Expired"}
          </p>
        )}

        <div className="mt-6">
          <h2 className="label">Job description</h2>
          <p className="text-steel-700 whitespace-pre-line">{lead.description}</p>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div>
            <h2 className="label">Customer budget</h2>
            <p className="font-display text-2xl font-semibold">
              {fmtUsd(lead.budgetMin)} – {fmtUsd(lead.budgetMax)}
            </p>
          </div>
          <div>
            <h2 className="label">Listing expires</h2>
            <p className="font-display text-2xl font-semibold">
              {lead.expiresAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* Contact block — masked until purchase */}
        <div className="mt-8 rounded-md border border-steel-200 bg-steel-50 p-4">
          <h2 className="label">Customer contact {canSeeContact ? "" : "— unlocked after purchase"}</h2>
          {canSeeContact ? (
            <dl className="grid sm:grid-cols-3 gap-3 text-sm">
              <div><dt className="text-steel-500">Name</dt><dd className="font-semibold">{lead.contactName}</dd></div>
              <div><dt className="text-steel-500">Phone</dt><dd className="font-semibold">{lead.contactPhone}</dd></div>
              <div><dt className="text-steel-500">Email</dt><dd className="font-semibold">{lead.contactEmail}</dd></div>
            </dl>
          ) : (
            <dl className="grid sm:grid-cols-3 gap-3 text-sm select-none" aria-label="Contact info hidden until purchase">
              <div><dt className="text-steel-500">Name</dt><dd className="font-mono">{maskName(lead.contactName)}</dd></div>
              <div><dt className="text-steel-500">Phone</dt><dd className="font-mono">███-███-████</dd></div>
              <div><dt className="text-steel-500">Email</dt><dd className="font-mono">████@████.com</dd></div>
            </dl>
          )}
        </div>

        <div className="mt-8">
          {purchasable ? (
            user ? (
              <BuyButton leadId={lead.id} priceLabel={fmtUsd(lead.price)} />
            ) : (
              <Link href={`/login?next=/lead/${lead.id}`} className="btn-primary">
                Sign in to buy — {fmtUsd(lead.price)}
              </Link>
            )
          ) : isSeller ? (
            <p className="text-sm text-steel-500">This is your listing. You&apos;ll get an email the moment it sells.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
