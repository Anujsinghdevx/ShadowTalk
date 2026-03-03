import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (token && (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up') || pathname.startsWith('/verify'))) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

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
