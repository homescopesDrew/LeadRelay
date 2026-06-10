import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { fmtUsd } from "@/lib/marketplace";
import { StatCard, MoneyCard } from "@/components/DashboardCards";
import ProfileForm from "@/components/ProfileForm";
import UpgradeButtons from "@/components/UpgradeButtons";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const [myLeads, purchases, earnings] = await Promise.all([
    db.lead.findMany({ where: { sellerId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.lead.findMany({ where: { buyerId: user.id }, orderBy: { soldAt: "desc" }, take: 20 }),
    db.transaction.aggregate({ _sum: { sellerPayout: true }, where: { sellerId: user.id } }),
  ]);
  const sold = myLeads.filter((l) => l.status === "SOLD").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-10">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h1 className="font-display text-4xl font-bold uppercase tracking-wide">Your dashboard</h1>
        <span className="font-mono text-xs uppercase tracking-widest text-steel-500">
          {user.subscriptionPlan} plan
        </span>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Leads posted" value={String(myLeads.length)} />
        <StatCard label="Leads sold" value={String(sold)} />
        <MoneyCard label="Total earnings" cents={earnings._sum.sellerPayout ?? 0} hint="After marketplace fees" />
      </div>

      <section>
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide mb-3">Plan</h2>
        <div className="ticket p-5 pl-9">
          <UpgradeButtons currentPlan={user.subscriptionPlan} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide mb-3">Profile & lead alerts</h2>
        <div className="ticket p-5 pl-9">
          <ProfileForm
            initial={{
              companyName: user.companyName ?? "",
              phone: user.phone ?? "",
              trade: user.trade ?? "",
              zipCodes: user.zipCodes,
            }}
          />
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide mb-3">Leads you bought</h2>
        {purchases.length === 0 ? (
          <p className="text-sm text-steel-500">
            Nothing yet. <Link href="/marketplace" className="text-blueprint-700 hover:underline">Browse the board</Link> to find your next job.
          </p>
        ) : (
          <ul className="space-y-2">
            {purchases.map((l) => (
              <li key={l.id} className="ticket p-4 pl-8 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <Link href={`/lead/${l.id}`} className="font-display text-lg font-semibold uppercase hover:text-blueprint-700">
                    {l.jobType} — ZIP {l.locationZip}
                  </Link>
                  <div className="text-sm text-steel-600">{l.contactName} · {l.contactPhone}</div>
                </div>
                <span className="font-display text-xl font-bold">{fmtUsd(l.price)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide mb-3">Leads you posted</h2>
        {myLeads.length === 0 ? (
          <p className="text-sm text-steel-500">
            No listings yet. <Link href="/post-lead" className="text-blueprint-700 hover:underline">Post your first lead</Link> in under two minutes.
          </p>
        ) : (
          <ul className="space-y-2">
            {myLeads.map((l) => (
              <li key={l.id} className="ticket p-4 pl-8 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <Link href={`/lead/${l.id}`} className="font-display text-lg font-semibold uppercase hover:text-blueprint-700">
                    {l.jobType} — ZIP {l.locationZip}
                  </Link>
                  <div className="font-mono text-xs uppercase tracking-widest text-steel-500">{l.status}</div>
                </div>
                <span className="font-display text-xl font-bold">{fmtUsd(l.price)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
