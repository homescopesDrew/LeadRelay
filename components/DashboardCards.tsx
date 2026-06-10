import { fmtUsd } from "@/lib/shared";

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="ticket p-4 pl-8">
      <div className="font-mono text-[11px] uppercase tracking-widest text-steel-500">{label}</div>
      <div className="font-display text-3xl font-bold mt-1">{value}</div>
      {hint && <div className="text-xs text-steel-500 mt-1">{hint}</div>}
    </div>
  );
}

export function MoneyCard({ label, cents, hint }: { label: string; cents: number; hint?: string }) {
  return <StatCard label={label} value={fmtUsd(cents)} hint={hint} />;
}
