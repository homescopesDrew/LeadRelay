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
    <div>
      {/* Admin header */}
      <div className="bg-steel-900 text-white border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <h1 className="font-display text-5xl font-bold uppercase tracking-wide">Owner Console</h1>
          </div>
          <p className="mt-1 text-steel-400 text-sm">System metrics, moderation, and user management</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 space-y-10">
        {/* Metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Total users" value={String(totalUsers)} icon="👥" />
          <StatCard label="Leads posted" value={String(leadsPosted)} icon="📋" />
          <StatCard label="Leads sold" value={String(leadsSold)} icon="✅" />
          <MoneyCard label="Fee revenue" cents={feeRevenue._sum.fee ?? 0} icon="💵" />
          <MoneyCard label="Subscription MRR" cents={mrr} hint={`${proCount} Pro · ${eliteCount} Elite`} icon="📈" />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-5">
          <BarChart title="Top trades" rows={topTrades.map((t) => ({ label: t.jobType, value: t._count }))} />
          <BarChart title="Top ZIP codes" rows={topZips.map((z) => ({ label: z.locationZip, value: z._count }))} />
        </div>

        {/* System health */}
        <section>
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide mb-4 text-steel-900">System health</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <StatCard label="Last cron run" value={fmtTime(lastCron?.createdAt)} hint={lastCron?.type ?? undefined} icon="⏱" />
            <StatCard label="Last Stripe webhook" value={fmtTime(lastWebhook?.createdAt)} icon="🔔" />
            <StatCard
              label="Errors (last 10)"
              value={String(recentErrors.length)}
              hint={recentErrors.length ? "Review the log below" : "All clear"}
              icon={recentErrors.length ? "🚨" : "✅"}
            />
          </div>
          {recentErrors.length > 0 && (
            <div className="ticket mt-4 overflow-x-auto">
              <div className="p-4 border-b border-steel-100">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-steel-500">Error log</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-steel-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-steel-500">
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {recentErrors.map((e) => (
                    <tr key={e.id} className="border-t border-steel-100 align-top hover:bg-steel-50/60">
                      <td className="px-4 py-3 whitespace-nowrap text-steel-500 text-xs">{fmtTime(e.createdAt)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-danger">{e.type}</td>
                      <td className="px-4 py-3 text-steel-600 text-xs break-all max-w-xs">{JSON.stringify(e.metadata)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Newest users */}
        <section>
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide mb-4 text-steel-900">Newest users</h2>
          <div className="ticket overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-steel-50 border-b border-steel-100">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-steel-500">
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Trade</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id} className="border-t border-steel-100 hover:bg-steel-50/60">
                    <td className="px-4 py-3 font-medium text-steel-900">{u.email}</td>
                    <td className="px-4 py-3 text-steel-600">{u.trade ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          u.subscriptionPlan === "ELITE"
                            ? "bg-safety-500/10 text-safety-600 border border-safety-500/20"
                            : u.subscriptionPlan === "PRO"
                            ? "bg-blueprint-500/10 text-blueprint-600 border border-blueprint-500/20"
                            : "bg-steel-100 text-steel-500 border border-steel-200"
                        }`}
                      >
                        {u.subscriptionPlan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-steel-500 text-xs">{fmtTime(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Lead moderation */}
        <section>
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide mb-4 text-steel-900">Lead moderation</h2>
          {flaggableLeads.length === 0 ? (
            <div className="ticket p-8 text-center text-sm text-steel-400">No leads to review.</div>
          ) : (
            <ul className="space-y-3">
              {flaggableLeads.map((l) => (
                <li key={l.id} className="ticket p-5 flex items-center justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="font-display text-lg font-semibold uppercase text-steel-900">{l.jobType} — ZIP {l.locationZip}</div>
                    <div className="text-sm text-steel-500 line-clamp-1 max-w-xl mt-0.5">{l.description}</div>
                  </div>
                  <ModerateLeadButton leadId={l.id} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
