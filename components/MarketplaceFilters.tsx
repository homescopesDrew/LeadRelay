"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TRADES } from "@/lib/shared";

export default function MarketplaceFilters() {
  const router = useRouter();
  const params = useSearchParams();

  function apply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const q = new URLSearchParams();
    for (const key of ["trade", "zip", "maxPrice", "urgency"]) {
      const v = String(f.get(key) ?? "").trim();
      if (v) q.set(key, v);
    }
    router.push(`/marketplace?${q.toString()}`);
  }

  return (
    <form onSubmit={apply} className="grid grid-cols-2 lg:grid-cols-5 gap-3 items-end">
      <div>
        <label className="label" htmlFor="trade">Trade</label>
        <select id="trade" name="trade" defaultValue={params.get("trade") ?? ""} className="field">
          <option value="">All trades</option>
          {TRADES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="zip">ZIP area</label>
        <input id="zip" name="zip" defaultValue={params.get("zip") ?? ""} placeholder="480xx" className="field" />
      </div>
      <div>
        <label className="label" htmlFor="maxPrice">Max lead price ($)</label>
        <input id="maxPrice" name="maxPrice" type="number" min={5} defaultValue={params.get("maxPrice") ?? ""} className="field" />
      </div>
      <div>
        <label className="label" htmlFor="urgency">Urgency</label>
        <select id="urgency" name="urgency" defaultValue={params.get("urgency") ?? ""} className="field">
          <option value="">Any</option>
          <option value="EMERGENCY">Emergency</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>
      <button type="submit" className="btn-secondary !text-base !py-2">Filter</button>
    </form>
  );
}
