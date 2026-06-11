"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TRADES } from "@/lib/shared";

type Props = {
  initial: { companyName: string; phone: string; trade: string; zipCodes: string[] };
};

export default function ProfileForm({ initial }: Props) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false);
    setError(null);
    const f = new FormData(e.currentTarget);
    const zipCodes = String(f.get("zipCodes") ?? "")
      .split(/[,\s]+/)
      .map((z) => z.trim())
      .filter(Boolean);

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: String(f.get("companyName") ?? ""),
        phone: String(f.get("phone") ?? ""),
        trade: String(f.get("trade") ?? ""),
        zipCodes,
      }),
    });
    if (!res.ok) {
      setError("ZIP codes must be 5 digits, separated by commas.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={save} className="grid sm:grid-cols-2 gap-5">
      <div>
        <label className="label" htmlFor="companyName">Company name</label>
        <input id="companyName" name="companyName" defaultValue={initial.companyName} className="field" placeholder="Acme Contracting" />
      </div>
      <div>
        <label className="label" htmlFor="phone">Phone</label>
        <input id="phone" name="phone" defaultValue={initial.phone} className="field" placeholder="(555) 000-0000" />
      </div>
      <div>
        <label className="label" htmlFor="trade">Primary trade</label>
        <select id="trade" name="trade" defaultValue={initial.trade} className="field">
          <option value="">Select a trade</option>
          {TRADES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="zipCodes">Service area ZIPs</label>
        <input
          id="zipCodes"
          name="zipCodes"
          defaultValue={initial.zipCodes.join(", ")}
          placeholder="48080, 48081, 48082"
          className="field"
        />
        <p className="mt-1 text-xs text-steel-400">Comma-separated 5-digit codes for lead alerts</p>
      </div>
      <div className="sm:col-span-2 flex items-center gap-4 pt-2">
        <button type="submit" className="btn-primary !text-sm !py-2">Save profile</button>
        {saved && (
          <span role="status" className="text-sm text-success font-medium flex items-center gap-1.5">
            <span>✓</span> Profile saved — lead alerts updated
          </span>
        )}
        {error && (
          <span role="alert" className="text-sm text-danger">{error}</span>
        )}
      </div>
    </form>
  );
}
