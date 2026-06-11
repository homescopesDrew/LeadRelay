export function BarChart({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: number }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="ticket p-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-steel-500 mb-4">{title}</h3>
      {rows.length === 0 && <p className="text-sm text-steel-400">No data yet.</p>}
      <ul className="space-y-3">
        {rows.map((r, i) => (
          <li key={r.label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-sm text-steel-700">{r.label}</span>
            <div className="flex-1 h-5 bg-steel-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(4, (r.value / max) * 100)}%`,
                  background: i % 2 === 0 ? "#1A73E8" : "#FF7A00",
                }}
                aria-hidden
              />
            </div>
            <span className="text-xs font-mono text-steel-500 w-6 text-right">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
