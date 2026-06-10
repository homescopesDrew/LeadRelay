import Link from "next/link";
import { fmtUsd } from "@/lib/shared";

const URGENCY_STYLES: Record<string, string> = {
  EMERGENCY: "bg-safety-500 text-white",
  HIGH: "bg-safety-400/20 text-safety-600",
  MEDIUM: "bg-blueprint-500/15 text-blueprint-700",
  LOW: "bg-steel-200 text-steel-600",
};

export type LeadCardData = {
  id: string;
  jobType: string;
  locationZip: string;
  budgetMin: number;
  budgetMax: number;
  description: string;
  urgency: string;
  price: number;
  createdAt: string | Date;
};

export default function LeadCard({ lead }: { lead: LeadCardData }) {
  const posted = new Date(lead.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return (
    <Link href={`/lead/${lead.id}`} className="ticket block p-4 pl-8 hover:border-blueprint-500 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-display text-xl font-semibold uppercase tracking-wide leading-tight">
            {lead.jobType}
          </div>
          <div className="font-mono text-xs text-steel-500 mt-0.5">
            ZIP {lead.locationZip} · posted {posted}
          </div>
        </div>
        <span className={`text-[11px] font-mono uppercase tracking-widest px-2 py-1 rounded ${URGENCY_STYLES[lead.urgency] ?? URGENCY_STYLES.LOW}`}>
          {lead.urgency}
        </span>
      </div>
      <p className="mt-3 text-sm text-steel-600 line-clamp-2">{lead.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-steel-500">
          Job budget {fmtUsd(lead.budgetMin)}–{fmtUsd(lead.budgetMax)}
        </span>
        <span className="font-display text-2xl font-bold text-steel-900">{fmtUsd(lead.price)}</span>
      </div>
    </Link>
  );
}
