/**
 * Security middleware for Astro
 * Implements CSP, security headers, and rate limiting
 */

import type { MiddlewareHandler } from 'astro';
import { env } from '../lib/env';

// Rate limiting store (in-memory for development)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = env.RATE_LIMIT_WINDOW_MS;
const RATE_LIMIT_MAX_REQUESTS = env.RATE_LIMIT_MAX_REQUESTS;

// Content Security Policy
const CSP_POLICY = {
  'default-src': ["'self'"],
  'img-src': [
    "'self'",
    'data:',
    'https://*.supabase.co',
    'https://*.cloudinary.com',
    'https://*.googleapis.com',
    'https://*.gstatic.com',
  ],
  'connect-src': [
    "'self'",
    'https://*.supabase.co',
    'https://*.cometchat.com',
    'https://api.stripe.com',
    'https://app.posthog.com',
    'https://*.posthog.com',
  ],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Astro
    'https://js.stripe.com',
    'https://app.posthog.com',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind
  ],
  'frame-src': [
    'https://js.stripe.com',
    'https://hooks.stripe.com',
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

// Security headers
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': Object.entries(CSP_POLICY)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; '),
};

// Rate limiting function
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = ip;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up expired rate limit records
function cleanupRateLimit() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupRateLimit, 5 * 60 * 1000);

export const securityMiddleware: MiddlewareHandler = async (context, next) => {
  const { request, url } = context;
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';

  // Skip rate limiting for static assets and API routes that don't need it
  const skipRateLimit = url.pathname.startsWith('/_astro/') ||
                       url.pathname.startsWith('/favicon') ||
                       url.pathname.startsWith('/api/health');

  if (!skipRateLimit && !checkRateLimit(ip)) {
    return new Response('Rate limit exceeded', {
      status: 429,
      headers: {
        'Retry-After': Math.ceil(RATE_LIMIT_WINDOW_MS / 1000).toString(),
        ...SECURITY_HEADERS,
      },
    });
  }

  // Add security headers to all responses
  const response = await next();
  
  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
};
