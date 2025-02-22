import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 获取认证token
  const authToken = request.cookies.get('auth_token');

  // 检查是否访问管理员页面
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // 管理员验证将在 API 路由中处理
    return NextResponse.next();
  }

  // allow API routes to pass
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // exclude news related routes
  if (request.nextUrl.pathname.startsWith('/news') || 
      request.nextUrl.pathname.startsWith('/api/news')) {
    return NextResponse.next();
  }

  // protected paths
  const protectedPaths = ['/dashboard', '/profile', '/chat', '/news'];
  
  // public paths
  const publicPaths = ['/', '/login', '/register'];
  
  // get current path
  const path = request.nextUrl.pathname;
  
  // if public path, allow access
  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }
  
  // check if current path requires authentication
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path.startsWith(protectedPath)
  );

  if (isProtectedPath && !authToken) {
    // if requires authentication but not logged in, redirect to login page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // exclude static files and specific API routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 