import { Suspense } from "react";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16 bg-gradient-to-b from-steel-100/50 to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide">Join LeadRelay</h1>
          <p className="mt-2 text-steel-500 text-sm">
            Free to join. Post unlimited leads, buy up to 3 a month on the free plan.
          </p>
        </div>
        <div className="ticket p-8">
          <Suspense>
            <AuthForm mode="signup" />
          </Suspense>
          <div className="mt-6 pt-6 border-t border-steel-100 text-center text-sm text-steel-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blueprint-500 font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
        <div className="mt-6 flex justify-center gap-6 text-xs text-steel-400">
          <span className="flex items-center gap-1.5"><span className="text-success">✓</span> No credit card needed</span>
          <span className="flex items-center gap-1.5"><span className="text-success">✓</span> Cancel anytime</span>
          <span className="flex items-center gap-1.5"><span className="text-success">✓</span> Secure checkout</span>
        </div>
      </div>
    </div>
  );
}
