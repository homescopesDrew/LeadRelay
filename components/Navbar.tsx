import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 bg-navy border-b border-white/10 shadow-sm backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl font-bold tracking-wide text-white">
          <span className="text-blueprint-500">LEAD</span>RELAY
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm font-medium text-steel-300">
          <Link
            href="/marketplace"
            className="px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
          >
            Browse leads
          </Link>
          {user ? (
            <>
              <Link
                href="/post-lead"
                className="px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
              >
                Post a lead
              </Link>
              <Link
                href="/dashboard"
                className="px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="px-3 py-2 rounded-lg text-safety-400 hover:bg-white/10 transition-colors"
                >
                  Admin
                </Link>
              )}
              <form action="/api/auth/signout" method="POST">
                <button className="px-3 py-2 rounded-lg text-steel-400 hover:bg-white/10 hover:text-white transition-colors">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="ml-1 bg-blueprint-500 hover:bg-blueprint-600 transition-colors px-4 py-2 rounded-lg font-semibold text-white shadow-sm"
              >
                Join free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
