import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// HIPAA-compliant middleware
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Security headers for all requests
  const response = NextResponse.next()
  
  // HIPAA Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'")
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // No caching for PHI data
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }

  // Rate limiting for API endpoints
  if (pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    
    // Simple rate limiting (in production, use Redis or similar)
    const rateLimitKey = `rate_limit_${ip}`
    const rateLimitData = request.cookies.get(rateLimitKey)
    const now = Date.now()
    const windowMs = 15 * 60 * 1000 // 15 minutes
    const maxRequests = 100
    
    if (rateLimitData) {
      const { count, timestamp } = JSON.parse(rateLimitData.value)
      
      if (now - timestamp < windowMs && count >= maxRequests) {
        return new NextResponse('Rate limit exceeded', { status: 429 })
      }
    }
    
    // Set rate limit cookie for tracking
    response.cookies.set(rateLimitKey, JSON.stringify({
      count: rateLimitData ? JSON.parse(rateLimitData.value).count + 1 : 1,
      timestamp: now
    }), {
      maxAge: windowMs / 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    })
  }

  // Authentication for protected routes
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    const token = await getToken({ req: request })
    
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }

  // Admin-only routes
  if (pathname.startsWith('/api/admin/')) {
    const token = await getToken({ req: request })
    
    if (!token || token.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/patients/:path*'
  ]
}
