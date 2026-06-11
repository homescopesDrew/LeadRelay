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

  if (currentPlan === "ELITE") {
    return (
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-full bg-safety-500/10 flex items-center justify-center text-safety-500 text-sm">★</span>
        <div>
          <div className="font-semibold text-steel-900 text-sm">You&apos;re on the Elite plan</div>
          <div className="text-xs text-steel-500">Lowest fees, priority alerts — you&apos;re maxed out.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        {currentPlan === "FREE" && (
          <div className="border border-steel-200 rounded-xl p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-steel-500 mb-1">Pro — $29/mo</div>
            <div className="text-sm text-steel-600 mb-3">Unlimited purchases · 15% fee · Early access</div>
            <button
              onClick={() => upgrade("PRO")}
              disabled={!!loading}
              className="btn-secondary !text-sm !py-2 w-full justify-center"
            >
              {loading === "PRO" ? "Opening…" : "Upgrade to Pro"}
            </button>
          </div>
        )}
        <div className="border-2 border-blueprint-500 rounded-xl p-4 bg-blueprint-500/3">
          <div className="text-xs font-semibold uppercase tracking-wider text-blueprint-600 mb-1">Elite — $99/mo</div>
          <div className="text-sm text-steel-600 mb-3">Priority alerts · Lowest 10% fee · All Pro perks</div>
          <button
            onClick={() => upgrade("ELITE")}
            disabled={!!loading}
            className="btn-primary !text-sm !py-2 w-full justify-center"
          >
            {loading === "ELITE" ? "Opening…" : "Upgrade to Elite"}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg px-3 py-2.5">
          {error}
        </p>
      )}
    </div>
  );
}
