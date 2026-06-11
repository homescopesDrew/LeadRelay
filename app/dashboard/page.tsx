import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { fmtUsd } from "@/lib/marketplace";
import { StatCard, MoneyCard } from "@/components/DashboardCards";
import ProfileForm from "@/components/ProfileForm";
import UpgradeButtons from "@/components/UpgradeButtons";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  AVAILABLE: "bg-success/10 text-green-700 border border-success/20",
  SOLD: "bg-blueprint-500/10 text-blueprint-600 border border-blueprint-500/20",
  EXPIRED: "bg-steel-100 text-steel-500 border border-steel-200",
  REMOVED: "bg-danger/10 text-danger border border-danger/20",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const [myLeads, purchases, earnings] = await Promise.all([
    db.lead.findMany({ where: { sellerId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.lead.findMany({ where: { buyerId: user.id }, orderBy: { soldAt: "desc" }, take: 20 }),
    db.transaction.aggregate({ _sum: { sellerPayout: true }, where: { sellerId: user.id } }),
  ]);
  const sold = myLeads.filter((l) => l.status === "SOLD").length;

  const planLabel: Record<string, string> = {
    FREE: "Free Plan",
    PRO: "Pro Plan",
    ELITE: "Elite Plan",
  };

  return (
    <div>
      {/* Dashboard header */}
      <div className="bg-navy text-white border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-5xl font-bold uppercase tracking-wide">Dashboard</h1>
              <p className="mt-1 text-steel-400 text-sm">Your leads, earnings, and account settings</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider bg-white/10 border border-white/20 text-steel-300 px-3 py-1.5 rounded-lg">
                {planLabel[user.subscriptionPlan] ?? user.subscriptionPlan}
              </span>
              <Link href="/post-lead" className="btn-primary !text-sm !py-2">
                + Post a lead
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 space-y-10">
        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-5">
          <StatCard label="Leads posted" value={String(myLeads.length)} icon="📋" />
          <StatCard label="Leads sold" value={String(sold)} icon="✅" />
          <MoneyCard label="Total earnings" cents={earnings._sum.sellerPayout ?? 0} hint="After marketplace fees" icon="💰" />
        </div>

        {/* Subscription banner */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide">Your plan</h2>
          </div>
          <div className="ticket p-6">
            <UpgradeButtons currentPlan={user.subscriptionPlan} />
          </div>
        </section>

        {/* Profile */}
        <section>
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide mb-4">Profile &amp; lead alerts</h2>
          <div className="ticket p-6">
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

        {/* Purchased leads */}
        <section>
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide mb-4">Leads you bought</h2>
          {purchases.length === 0 ? (
            <div className="ticket p-8 text-center">
              <p className="text-steel-500 text-sm">
                Nothing yet.{" "}
                <Link href="/marketplace" className="text-blueprint-500 font-medium hover:underline">
                  Browse the board
                </Link>{" "}
                to find your next job.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {purchases.map((l) => (
                <li key={l.id} className="ticket p-5 flex items-center justify-between gap-3 flex-wrap hover:shadow-ticket-hover hover:-translate-y-0.5">
                  <div>
                    <Link
                      href={`/lead/${l.id}`}
                      className="font-display text-lg font-semibold uppercase hover:text-blueprint-500 transition-colors"
                    >
                      {l.jobType} — ZIP {l.locationZip}
                    </Link>
                    <div className="text-sm text-steel-500 mt-0.5">{l.contactName} · {l.contactPhone}</div>
                  </div>
                  <span className="font-display text-xl font-bold text-steel-900">{fmtUsd(l.price)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Posted leads */}
        <section>
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide mb-4">Leads you posted</h2>
          {myLeads.length === 0 ? (
            <div className="ticket p-8 text-center">
              <p className="text-steel-500 text-sm">
                No listings yet.{" "}
                <Link href="/post-lead" className="text-blueprint-500 font-medium hover:underline">
                  Post your first lead
                </Link>{" "}
                in under two minutes.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {myLeads.map((l) => (
                <li key={l.id} className="ticket p-5 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <Link
                      href={`/lead/${l.id}`}
                      className="font-display text-lg font-semibold uppercase hover:text-blueprint-500 transition-colors"
                    >
                      {l.jobType} — ZIP {l.locationZip}
                    </Link>
                    <div className="mt-1">
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          STATUS_BADGE[l.status] ?? STATUS_BADGE.AVAILABLE
                        }`}
                      >
                        {l.status}
                      </span>
                    </div>
                  </div>
                  <span className="font-display text-xl font-bold text-steel-900">{fmtUsd(l.price)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
