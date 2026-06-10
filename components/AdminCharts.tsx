/**
 * Dependency-free bar charts for the admin dashboard.
 * Pure CSS so the admin page works without a charting library.
 */
export function BarChart({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: number }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="ticket p-4 pl-8">
      <h3 className="font-mono text-[11px] uppercase tracking-widest text-steel-500 mb-3">{title}</h3>
      {rows.length === 0 && <p className="text-sm text-steel-500">No data yet.</p>}
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-3">
            <span className="w-32 shrink-0 truncate text-sm text-steel-700">{r.label}</span>
            <span
              className="h-4 rounded-sm bg-blueprint-500"
              style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }}
              aria-hidden
            />
            <span className="font-mono text-xs text-steel-600">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
