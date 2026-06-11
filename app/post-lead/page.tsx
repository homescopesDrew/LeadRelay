import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LeadForm from "@/components/LeadForm";

export default async function PostLeadPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/post-lead");

  return (
    <div>
      <div className="bg-navy text-white border-b border-white/10">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <h1 className="font-display text-5xl font-bold uppercase tracking-wide">Post a lead</h1>
          <p className="mt-2 text-steel-400 text-sm max-w-lg">
            Customer contact info stays hidden until another contractor buys the lead. Listings run for 14 days.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <LeadForm />
      </div>
    </div>
  );
}
