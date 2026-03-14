import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const protectedPrefixes = ["/dashboard", "/apply"]
const guestOnlyPaths = ["/", "/login", "/register"]
const publicPaths = ["/", "/login", "/register", "/auth/callback", "/api/stripe/webhook"]

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value, ...(options || {}) })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...(options || {}) })
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value: "", ...(options || {}) })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: "", ...(options || {}) })
        }
      }
    }
  )

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const requiresAuth = protectedPrefixes.some((prefix) => pathname.startsWith(prefix))
  const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))
  const isGuestOnlyPath = guestOnlyPaths.some((path) => pathname === path)

  if (requiresAuth && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(url)
  }

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(url)
  }

  if (user && isGuestOnlyPath) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    url.search = ""
    return NextResponse.redirect(url)
  }

  return response
}
