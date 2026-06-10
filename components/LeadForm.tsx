"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TRADES } from "@/lib/shared";

export default function LeadForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const f = new FormData(e.currentTarget);

    const payload = {
      jobType: String(f.get("jobType")),
      locationZip: String(f.get("locationZip")),
      budgetMin: Math.round(Number(f.get("budgetMin")) * 100),
      budgetMax: Math.round(Number(f.get("budgetMax")) * 100),
      description: String(f.get("description")),
      urgency: String(f.get("urgency")),
      price: Math.round(Number(f.get("price")) * 100),
      contactName: String(f.get("contactName")),
      contactPhone: String(f.get("contactPhone")),
      contactEmail: String(f.get("contactEmail")),
    };

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Check the highlighted fields and try again.");
      return;
    }
    router.push(`/lead/${data.lead.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="ticket p-6 pl-10 space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="jobType">Trade / job type</label>
          <select id="jobType" name="jobType" required className="field">
            {TRADES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="locationZip">Job ZIP code</label>
          <input id="locationZip" name="locationZip" required pattern="\d{5}" placeholder="48080" className="field" />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="label" htmlFor="budgetMin">Job budget min ($)</label>
          <input id="budgetMin" name="budgetMin" type="number" min={0} required placeholder="500" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="budgetMax">Job budget max ($)</label>
          <input id="budgetMax" name="budgetMax" type="number" min={0} required placeholder="2500" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="urgency">Urgency</label>
          <select id="urgency" name="urgency" className="field" defaultValue="MEDIUM">
            <option value="LOW">Low — flexible timing</option>
            <option value="MEDIUM">Medium — within a few weeks</option>
            <option value="HIGH">High — this week</option>
            <option value="EMERGENCY">Emergency — ASAP</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="description">Job description</label>
        <textarea
          id="description"
          name="description"
          required
          minLength={20}
          rows={4}
          className="field"
          placeholder="What the customer needs, scope, materials, access notes — the more detail, the faster it sells."
        />
      </div>

      <fieldset className="border-t border-steel-200 pt-4">
        <legend className="font-mono text-[11px] uppercase tracking-widest text-steel-500 pr-3">
          Customer contact — hidden until purchased
        </legend>
        <div className="grid sm:grid-cols-3 gap-4 mt-2">
          <div>
            <label className="label" htmlFor="contactName">Name</label>
            <input id="contactName" name="contactName" required className="field" />
          </div>
          <div>
            <label className="label" htmlFor="contactPhone">Phone</label>
            <input id="contactPhone" name="contactPhone" required className="field" />
          </div>
          <div>
            <label className="label" htmlFor="contactEmail">Email</label>
            <input id="contactEmail" name="contactEmail" type="email" required className="field" />
          </div>
        </div>
      </fieldset>

      <div className="border-t border-steel-200 pt-4 flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div className="max-w-[200px]">
          <label className="label" htmlFor="price">Your asking price ($5–$1,000)</label>
          <input id="price" name="price" type="number" min={5} max={1000} step="0.01" required placeholder="45" className="field" />
        </div>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Posting…" : "Post lead"}
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-safety-600 bg-safety-400/10 border border-safety-400/40 rounded p-3">
          {error}
        </p>
      )}
    </form>
  );
}
