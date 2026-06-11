import { Suspense } from "react";
import LeadCard from "@/components/LeadCard";
import MarketplaceFilters from "@/components/MarketplaceFilters";
import { listAvailableLeads } from "@/lib/marketplace";

export const dynamic = "force-dynamic";

type SP = { trade?: string; zip?: string; maxPrice?: string; urgency?: string };

export default async function MarketplacePage({ searchParams }: { searchParams: SP }) {
  const leads = await listAvailableLeads({
    trade: searchParams.trade,
    zip: searchParams.zip,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) * 100 : undefined,
    urgency: searchParams.urgency,
  });

  return (
    <div>
      {/* Page header */}
      <div className="bg-navy text-white border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-5xl font-bold uppercase tracking-wide">The Board</h1>
              <p className="mt-1 text-steel-400 text-sm">Real job leads from contractors who can&apos;t take them</p>
            </div>
            <span className="text-sm font-medium text-steel-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              {leads.length} lead{leads.length === 1 ? "" : "s"} available
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Filters */}
        <div className="ticket p-5 mb-8">
          <Suspense>
            <MarketplaceFilters />
          </Suspense>
        </div>

        {leads.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-steel-200 rounded-xl bg-white">
            <div className="text-4xl mb-4">🔍</div>
            <p className="font-display text-2xl uppercase text-steel-500">No leads match these filters</p>
            <p className="text-sm text-steel-400 mt-2">Widen the ZIP area or clear a filter to see more.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
