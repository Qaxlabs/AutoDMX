import { NextResponse, type NextRequest } from 'next/server';

async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifySession(request: NextRequest): Promise<boolean> {
  const sessionCookie = request.cookies.get('autodmx_session')?.value;
  if (!sessionCookie) return false;

  const [payload, signature] = sessionCookie.split('.');
  if (!payload || !signature) return false;

  const expiresAt = Number(payload);
  if (isNaN(expiresAt) || expiresAt <= Date.now()) {
    return false;
  }

  const dashboardPassword = process.env.DASHBOARD_PASSWORD;
  if (!dashboardPassword) {
    console.error('[Middleware Error] DASHBOARD_PASSWORD is not configured on host.');
    return false;
  }

  const expectedSignature = await sha256(`${payload}:${dashboardPassword}`);
  return signature === expectedSignature;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = await verifySession(request);

  // Exclude cron and webhook API routes from protection
  const isExcludedApi =
    pathname.startsWith('/api/webhook') || pathname.startsWith('/api/cron');

  // Protect /dashboard/* and /api/* (except webhook and cron)
  if (
    pathname.startsWith('/dashboard') ||
    (pathname.startsWith('/api') && !isExcludedApi)
  ) {
    if (!isAuthenticated) {
      if (pathname.startsWith('/api')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated user away from login page
  if (pathname.startsWith('/login')) {
    if (isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - SVG, images, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
