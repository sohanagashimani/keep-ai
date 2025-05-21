import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

// Configuration for protected routes
const PROTECTED_ROUTES = ["/chat", "/api"];

const isProtectedRoute = path => {
  return PROTECTED_ROUTES.some(route => path.startsWith(route));
};

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient(
    { req, res },
    {
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    }
  );

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session && isProtectedRoute(req.nextUrl.pathname)) {
      const redirectUrl = new URL("/", req.url);
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    return res;
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
