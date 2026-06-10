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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h1 className="font-display text-4xl font-bold uppercase tracking-wide">The board</h1>
        <span className="font-mono text-xs uppercase tracking-widest text-steel-500">
          {leads.length} lead{leads.length === 1 ? "" : "s"} available
        </span>
      </div>

      <div className="mt-6 ticket p-4 pl-8">
        <Suspense>
          <MarketplaceFilters />
        </Suspense>
      </div>

      {leads.length === 0 ? (
        <div className="mt-10 text-center py-16 border border-dashed border-steel-300 rounded-lg">
          <p className="font-display text-2xl uppercase text-steel-500">No leads match these filters</p>
          <p className="text-sm text-steel-500 mt-2">Widen the ZIP area or clear a filter to see more.</p>
        </div>
      ) : (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}
