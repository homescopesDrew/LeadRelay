import { Suspense } from "react";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl font-bold uppercase tracking-wide">Sign in</h1>
      <p className="mt-2 text-steel-600 text-sm mb-6">Back to the board.</p>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
      <p className="mt-4 text-sm text-steel-600">
        New here? <Link href="/signup" className="text-blueprint-700 hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
