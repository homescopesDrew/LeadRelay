import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LeadForm from "@/components/LeadForm";

export default async function PostLeadPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/post-lead");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl font-bold uppercase tracking-wide">Post a lead</h1>
      <p className="mt-2 text-steel-600 text-sm mb-6">
        Customer contact info stays hidden until another contractor buys the lead. Listings run for 14 days.
      </p>
      <LeadForm />
    </div>
  );
}
