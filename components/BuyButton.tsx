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
    <div>
      <button onClick={buy} disabled={loading} className="btn-primary w-full sm:w-auto">
        {loading ? "Opening checkout…" : `Buy this lead — ${priceLabel}`}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-safety-600">{error}</p>
      )}
    </div>
  );
}
