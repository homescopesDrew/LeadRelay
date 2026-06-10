import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="bg-steel-950 text-white">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl font-bold tracking-wide">
          <span className="text-safety-500">LEAD</span>RELAY
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm">
          <Link href="/marketplace" className="px-3 py-2 rounded hover:bg-steel-800 transition-colors">
            Browse leads
          </Link>
          {user ? (
            <>
              <Link href="/post-lead" className="px-3 py-2 rounded hover:bg-steel-800 transition-colors">
                Post a lead
              </Link>
              <Link href="/dashboard" className="px-3 py-2 rounded hover:bg-steel-800 transition-colors">
                Dashboard
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin" className="px-3 py-2 rounded text-safety-400 hover:bg-steel-800 transition-colors">
                  Admin
                </Link>
              )}
              <form action="/api/auth/signout" method="POST">
                <button className="px-3 py-2 rounded text-steel-300 hover:bg-steel-800 transition-colors">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="px-3 py-2 rounded hover:bg-steel-800 transition-colors">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="ml-1 bg-safety-500 hover:bg-safety-600 transition-colors px-4 py-2 rounded font-semibold"
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
