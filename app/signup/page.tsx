import { Suspense } from "react";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl font-bold uppercase tracking-wide">Join LeadRelay</h1>
      <p className="mt-2 text-steel-600 text-sm mb-6">
        Free to join. Post unlimited leads, buy up to 3 a month on the free plan.
      </p>
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
      <p className="mt-4 text-sm text-steel-600">
        Already have an account? <Link href="/login" className="text-blueprint-700 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
