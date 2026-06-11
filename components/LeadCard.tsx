import Link from "next/link";
import { fmtUsd } from "@/lib/shared";

const URGENCY_STYLES: Record<string, string> = {
  EMERGENCY: "bg-danger/10 text-danger border border-danger/20",
  HIGH: "bg-warning/15 text-yellow-700 border border-warning/30",
  MEDIUM: "bg-blueprint-500/10 text-blueprint-600 border border-blueprint-500/20",
  LOW: "bg-steel-100 text-steel-600 border border-steel-200",
};

const URGENCY_DOT: Record<string, string> = {
  EMERGENCY: "bg-danger",
  HIGH: "bg-warning",
  MEDIUM: "bg-blueprint-500",
  LOW: "bg-steel-400",
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
    <Link
      href={`/lead/${lead.id}`}
      className="ticket block p-5 hover:shadow-ticket-hover hover:-translate-y-0.5 hover:border-blueprint-500/40 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-display text-xl font-semibold uppercase tracking-wide leading-tight text-steel-900 group-hover:text-blueprint-600 transition-colors">
            {lead.jobType}
          </div>
          <div className="text-xs text-steel-400 mt-1 flex items-center gap-1.5">
            <span>ZIP {lead.locationZip}</span>
            <span>·</span>
            <span>{posted}</span>
          </div>
        </div>
        <span
          className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
            URGENCY_STYLES[lead.urgency] ?? URGENCY_STYLES.LOW
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${URGENCY_DOT[lead.urgency] ?? URGENCY_DOT.LOW}`} />
          {lead.urgency}
        </span>
      </div>
      <p className="mt-3 text-sm text-steel-500 line-clamp-2 leading-relaxed">{lead.description}</p>
      <div className="mt-4 pt-4 border-t border-steel-100 flex items-center justify-between">
        <span className="text-xs text-steel-400">
          Budget {fmtUsd(lead.budgetMin)}–{fmtUsd(lead.budgetMax)}
        </span>
        <span className="font-display text-2xl font-bold text-steel-900">{fmtUsd(lead.price)}</span>
      </div>
    </Link>
  );
}
