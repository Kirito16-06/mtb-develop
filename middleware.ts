import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.role === "ADMIN";
    const path = req.nextUrl.pathname;


    // Redirect non-admin users from /admin
    if (path.startsWith("/dashboard") && isAdmin) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    if (path.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Allow authenticated users to continue to the requested route
    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/signin", // Redirect unauthenticated users to sign-in page
    },
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
  }
);

// Specify the routes that should be protected by this middleware
export const config = {
  matcher: ["/dashboard/:path*", "/leaderboard", "/admin/:path*"], // Protect specific pages
};
