import Link from "next/link";

export default function PurchaseSuccessPage({ searchParams }: { searchParams: { lead?: string } }) {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="font-display text-5xl font-bold uppercase tracking-wide text-safety-500">Sold to you</div>
      <p className="mt-4 text-steel-600">
        Payment received. The customer&apos;s contact info is unlocking now and a copy is on its way to your inbox.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        {searchParams.lead && (
          <Link href={`/lead/${searchParams.lead}`} className="btn-primary">View contact info</Link>
        )}
        <Link href="/dashboard" className="btn-ghost">Go to dashboard</Link>
      </div>
      <p className="mt-6 text-xs text-steel-500">
        Contact info appears within a few seconds of payment confirmation. Refresh the lead page if it still shows as masked.
      </p>
    </div>
  );
}
