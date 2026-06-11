import Link from "next/link";

export default function PurchaseSuccessPage({ searchParams }: { searchParams: { lead?: string } }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-20 bg-gradient-to-b from-steel-100/50 to-white">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-success/10 border-2 border-success/30 flex items-center justify-center mx-auto mb-6">
          <span className="text-success text-3xl">✓</span>
        </div>
        <h1 className="font-display text-5xl font-bold uppercase tracking-wide text-steel-900">Sold to you</h1>
        <p className="mt-4 text-steel-500 text-base leading-relaxed max-w-sm mx-auto">
          Payment received. The customer&apos;s contact info is unlocking now and a copy is on its way to your inbox.
        </p>

        <div className="mt-8 ticket p-5 text-left space-y-2.5 text-sm text-steel-500">
          <div className="flex items-center gap-2.5">
            <span className="text-success">✓</span> Contact info available on the lead page
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-success">✓</span> Confirmation email sent to your inbox
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-success">✓</span> Lead saved to your dashboard
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-3 flex-wrap">
          {searchParams.lead && (
            <Link href={`/lead/${searchParams.lead}`} className="btn-primary !px-6">
              View contact info
            </Link>
          )}
          <Link href="/dashboard" className="btn-secondary !px-6">Go to dashboard</Link>
        </div>

        <p className="mt-6 text-xs text-steel-400">
          Contact info appears within seconds of payment confirmation. Refresh the lead page if it still shows as masked.
        </p>
      </div>
    </div>
  );
}
