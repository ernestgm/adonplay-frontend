import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get('user');
  const isOnSignin = request.nextUrl.pathname === '/signin';

  if (!isAuthenticated && !isOnSignin) {
    const signinUrl = request.nextUrl.clone();
    signinUrl.pathname = '/signin';
    signinUrl.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

// Configura las rutas protegidas (puedes ajustar el matcher según tus necesidades)
export const config = {
  matcher: [
    '/',
    '/users',
    '/business',
    '/slides',
    '/marquees',
    '/qrcodes',
    '/devices',
    // Puedes agregar más rutas si es necesario
  ],
};
