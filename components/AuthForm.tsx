"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    const password = String(f.get("password"));
    const supabase = createSupabaseBrowserClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
      });
      setLoading(false);
      if (error) return setError(error.message);
      setNotice("Check your email to confirm your account, then sign in.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    router.push(params.get("next") ?? "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="label" htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="field"
          placeholder="you@company.com"
        />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className="field"
          placeholder={mode === "signup" ? "Min 8 characters" : "••••••••"}
        />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full justify-center !py-3">
        {loading ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg px-3 py-2.5">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-sm text-blueprint-600 bg-blueprint-500/5 border border-blueprint-500/20 rounded-lg px-3 py-2.5">
          {notice}
        </p>
      )}
    </form>
  );
}
