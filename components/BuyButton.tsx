"use client";

import { useState } from "react";

export default function BuyButton({ leadId, priceLabel }: { leadId: string; priceLabel: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Couldn't start checkout. Try again.");
      setLoading(false);
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="space-y-3">
      <button onClick={buy} disabled={loading} className="btn-primary w-full justify-center !py-3">
        {loading ? "Opening checkout…" : `Buy this lead — ${priceLabel}`}
      </button>
      {error && (
        <p role="alert" className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg px-3 py-2.5">
          {error}
        </p>
      )}
    </div>
  );
}
