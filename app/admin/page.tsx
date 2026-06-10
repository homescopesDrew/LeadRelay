import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { StatCard, MoneyCard } from "@/components/DashboardCards";
import { BarChart } from "@/components/AdminCharts";
import ModerateLeadButton from "@/components/ModerateLeadButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const [
    totalUsers,
    leadsPosted,
    leadsSold,
    feeRevenue,
    subCounts,
    topTrades,
    topZips,
    lastCron,
    lastWebhook,
    recentErrors,
    recentUsers,
    flaggableLeads,
  ] = await Promise.all([
    db.user.count(),
    db.lead.count(),
    db.lead.count({ where: { status: "SOLD" } }),
    db.transaction.aggregate({ _sum: { fee: true } }),
    db.user.groupBy({ by: ["subscriptionPlan"], _count: true }),
    db.lead.groupBy({ by: ["jobType"], _count: true, orderBy: { _count: { jobType: "desc" } }, take: 6 }),
    db.lead.groupBy({ by: ["locationZip"], _count: true, orderBy: { _count: { locationZip: "desc" } }, take: 6 }),
    db.systemEvent.findFirst({ where: { type: { startsWith: "CRON_" } }, orderBy: { createdAt: "desc" } }),
    db.systemEvent.findFirst({ where: { type: "STRIPE_WEBHOOK" }, orderBy: { createdAt: "desc" } }),
    db.systemEvent.findMany({ where: { type: { in: ["ERROR", "PAYMENT_FAILED"] } }, orderBy: { createdAt: "desc" }, take: 10 }),
    db.user.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    db.lead.findMany({ where: { status: "AVAILABLE" }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  const proCount = subCounts.find((s) => s.subscriptionPlan === "PRO")?._count ?? 0;
  const eliteCount = subCounts.find((s) => s.subscriptionPlan === "ELITE")?._count ?? 0;
  const mrr = proCount * 2900 + eliteCount * 9900;

  const fmtTime = (d?: Date | null) =>
    d ? d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "never";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-10">
      <h1 className="font-display text-4xl font-bold uppercase tracking-wide">Owner console</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total users" value={String(totalUsers)} />
        <StatCard label="Leads posted" value={String(leadsPosted)} />
        <StatCard label="Leads sold" value={String(leadsSold)} />
        <MoneyCard label="Fee revenue (all-time)" cents={feeRevenue._sum.fee ?? 0} />
        <MoneyCard label="Subscription MRR" cents={mrr} hint={`${proCount} Pro · ${eliteCount} Elite`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <BarChart title="Top trades" rows={topTrades.map((t) => ({ label: t.jobType, value: t._count }))} />
        <BarChart title="Top ZIP codes" rows={topZips.map((z) => ({ label: z.locationZip, value: z._count }))} />
      </div>

      <section>
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide mb-3">System health</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard label="Last cron run" value={fmtTime(lastCron?.createdAt)} hint={lastCron?.type ?? undefined} />
          <StatCard label="Last Stripe webhook" value={fmtTime(lastWebhook?.createdAt)} />
          <StatCard
            label="Errors (last 10 shown)"
            value={String(recentErrors.length)}
            hint={recentErrors.length ? "Review the log below" : "All clear"}
          />
        </div>
        {recentErrors.length > 0 && (
          <div className="ticket mt-4 p-4 pl-8 overflow-x-auto">
            <h3 className="label">Error log</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left font-mono text-[11px] uppercase tracking-widest text-steel-500">
                  <th className="py-1 pr-4">When</th>
                  <th className="py-1 pr-4">Type</th>
                  <th className="py-1">Detail</th>
                </tr>
              </thead>
              <tbody>
                {recentErrors.map((e) => (
                  <tr key={e.id} className="border-t border-steel-100 align-top">
                    <td className="py-2 pr-4 whitespace-nowrap text-steel-500">{fmtTime(e.createdAt)}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{e.type}</td>
                    <td className="py-2 text-steel-600 break-all">{JSON.stringify(e.metadata)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide mb-3">Newest users</h2>
        <div className="ticket p-4 pl-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[11px] uppercase tracking-widest text-steel-500">
                <th className="py-1 pr-4">Email</th>
                <th className="py-1 pr-4">Trade</th>
                <th className="py-1 pr-4">Plan</th>
                <th className="py-1">Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id} className="border-t border-steel-100">
                  <td className="py-2 pr-4">{u.email}</td>
                  <td className="py-2 pr-4">{u.trade ?? "—"}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{u.subscriptionPlan}</td>
                  <td className="py-2 text-steel-500">{fmtTime(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide mb-3">Lead moderation</h2>
        <ul className="space-y-2">
          {flaggableLeads.map((l) => (
            <li key={l.id} className="ticket p-4 pl-8 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-display text-lg font-semibold uppercase">{l.jobType} — ZIP {l.locationZip}</div>
                <div className="text-sm text-steel-600 line-clamp-1 max-w-xl">{l.description}</div>
              </div>
              <ModerateLeadButton leadId={l.id} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
