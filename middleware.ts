import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/((?!auth|api|_next/static|_next/image|favicon.ico).*)',
]);

// Define public API routes (don't require auth)
const isPublicApiRoute = createRouteMatcher([
  '/api/webhooks/clerk',
  '/api/auth/callback',
]);

export default clerkMiddleware(async (auth, req) => {
  // Skip auth for public API routes
  if (isPublicApiRoute(req)) {
    return;
  }
  
  // Protect all routes except auth pages
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/clerk-middleware
  // for more information about configuring your Middleware
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!.+\\.[\\w]+$|_next).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 