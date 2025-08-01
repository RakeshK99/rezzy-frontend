import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    /*
     * Protect these routes:
     * - everything under /dashboard
     * - future /api routes
     */
    '/dashboard(.*)',
    '/api/(.*)',
  ],
};
