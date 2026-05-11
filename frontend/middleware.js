import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('attyer_token')?.value;
  const role = request.cookies.get('attyer_role')?.value;
  
  const pathname = request.nextUrl.pathname;
  
  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect /profile routes
  if (pathname.startsWith('/profile')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*'],
};
