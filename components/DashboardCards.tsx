import { fmtUsd } from "@/lib/shared";

export function StatCard({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon?: string }) {
  return (
    <div className="ticket p-5">
      <div className="flex items-start justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-steel-500">{label}</div>
        {icon && (
          <span className="text-lg" role="img" aria-hidden>
            {icon}
          </span>
        )}
      </div>
      <div className="font-display text-3xl font-bold mt-2 text-steel-900">{value}</div>
      {hint && <div className="text-xs text-steel-400 mt-1">{hint}</div>}
    </div>
  );
}

export function MoneyCard({ label, cents, hint, icon }: { label: string; cents: number; hint?: string; icon?: string }) {
  return <StatCard label={label} value={fmtUsd(cents)} hint={hint} icon={icon} />;
}
