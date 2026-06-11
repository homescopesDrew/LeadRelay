import { Suspense } from "react";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16 bg-gradient-to-b from-steel-100/50 to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide">Welcome back</h1>
          <p className="mt-2 text-steel-500 text-sm">Sign in to access the board</p>
        </div>
        <div className="ticket p-8">
          <Suspense>
            <AuthForm mode="login" />
          </Suspense>
          <div className="mt-6 pt-6 border-t border-steel-100 text-center text-sm text-steel-500">
            New here?{" "}
            <Link href="/signup" className="text-blueprint-500 font-medium hover:underline">
              Create a free account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
