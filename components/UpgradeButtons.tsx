"use client";

import { useState } from "react";

export default function UpgradeButtons({ currentPlan }: { currentPlan: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upgrade(plan: "PRO" | "ELITE") {
    setLoading(plan);
    setError(null);
    const res = await fetch("/api/stripe/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Couldn't start checkout.");
      setLoading(null);
      return;
    }
    window.location.href = data.url;
  }

  if (currentPlan === "ELITE") return <p className="text-sm text-steel-500">You&apos;re on the Elite plan — lowest fees, priority alerts.</p>;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {currentPlan === "FREE" && (
        <button onClick={() => upgrade("PRO")} disabled={!!loading} className="btn-ghost !text-base">
          {loading === "PRO" ? "Opening…" : "Upgrade to Pro — $29/mo"}
        </button>
      )}
      <button onClick={() => upgrade("ELITE")} disabled={!!loading} className="btn-secondary !text-base">
        {loading === "ELITE" ? "Opening…" : "Upgrade to Elite — $99/mo"}
      </button>
      {error && <p role="alert" className="text-sm text-safety-600 w-full">{error}</p>}
    </div>
  );
}
