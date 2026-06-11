"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ModerateLeadButton({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!confirm("Remove this lead from the marketplace?")) return;
    setBusy(true);
    await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "REMOVED" }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      onClick={remove}
      disabled={busy}
      className="btn-danger !text-sm !py-1.5 !px-4"
    >
      {busy ? "Removing…" : "Remove lead"}
    </button>
  );
}
