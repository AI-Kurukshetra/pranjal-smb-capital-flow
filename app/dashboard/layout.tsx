import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

type NavItem = {
  href: string
  label: string
  icon: string
}

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  async function logout() {
    "use server"
    const logoutClient = await createClient()
    await logoutClient.auth.signOut()
    redirect("/")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  const canAccessCompliance = profile?.role === "compliance"

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: "[DB]" },
    { href: "/apply", label: "Apply for Loan", icon: "[AP]" },
    { href: "/apply/calculator", label: "Loan Calculator", icon: "[LC]" },
    { href: "/dashboard/support", label: "Help & Support", icon: "[HS]" }
  ]

  if (canAccessCompliance) {
    navItems.push({ href: "/dashboard/compliance", label: "Compliance", icon: "[CP]" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-cyan-50/20">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-600" />
            </span>
            <h1 className="text-xl font-bold">
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                SMB Capital Flow
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              Welcome, {user.user_metadata?.full_name || "User"}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex gap-8">
          <aside className="w-56 shrink-0 max-lg:hidden">
            <nav className="sticky top-24 space-y-2 rounded-2xl border-2 border-teal-200 bg-gradient-to-b from-teal-50 to-cyan-50 p-4 shadow-colored">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-teal-100 hover:text-teal-800"
                >
                  <span className="text-xs font-semibold text-slate-500">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-slate-200 bg-white/95 backdrop-blur-md lg:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 px-4 py-3 text-xs font-medium text-slate-600"
            >
              <span className="text-[10px] font-semibold">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="h-20 lg:hidden" aria-hidden />
      </div>
    </div>
  )
}
