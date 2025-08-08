// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // redirect logged-in users away from auth/verify
    if (token && (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up') || pathname.startsWith('/verify'))) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // redirect logged-out users away from dashboard
    if (!token && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: { authorized: () => true }, // let all through; we handle redirects ourselves
  }
);

export const config = {
  matcher: ['/', '/sign-in', '/sign-up', '/dashboard/:path*', '/verify/:path*'],
};
