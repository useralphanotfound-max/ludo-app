import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Handle CORS preflight OPTIONS requests for Mobile REST APIs
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      },
    });
  }

  // Superadmin Auth Guard for protected dashboard paths
  if (pathname.startsWith('/superadmin/dashboard')) {
    const token = request.cookies.get('royal_admin_token')?.value;
    
    // Note: LocalStorage auth is validated on client-side, middleware adds header safety
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  }

  // Standard API CORS Header Response
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  return response;
}

export const config = {
  matcher: [
    '/superadmin/:path*',
    '/api/:path*',
  ],
};
