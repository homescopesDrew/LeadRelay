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
    <form onSubmit={save} className="grid sm:grid-cols-2 gap-4">
      <div>
        <label className="label" htmlFor="companyName">Company name</label>
        <input id="companyName" name="companyName" defaultValue={initial.companyName} className="field" />
      </div>
      <div>
        <label className="label" htmlFor="phone">Phone</label>
        <input id="phone" name="phone" defaultValue={initial.phone} className="field" />
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
        <label className="label" htmlFor="zipCodes">Service area ZIPs (comma-separated)</label>
        <input id="zipCodes" name="zipCodes" defaultValue={initial.zipCodes.join(", ")} placeholder="48080, 48081, 48082" className="field" />
      </div>
      <div className="sm:col-span-2 flex items-center gap-3">
        <button type="submit" className="btn-secondary !text-base">Save profile</button>
        {saved && <span role="status" className="text-sm text-blueprint-700">Profile saved. Lead alerts now use these settings.</span>}
        {error && <span role="alert" className="text-sm text-safety-600">{error}</span>}
      </div>
    </form>
  );
}
