import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Get hostname (e.g. demo.helpdeck.app, helpdeck.app)
  const hostname = req.headers.get('host') || '';
  const isProd = process.env.NODE_ENV === 'production';
  const isPublicDomain = hostname.endsWith('.helpdeck.app') && hostname !== 'helpdeck.app';

  // Special case for localhost or development
  if (!isProd && req.headers.get('x-public-preview') === 'true') {
    // Allow preview in development
    return await handlePublicKnowledgeBase(req, res, supabase);
  }

  // Handle public knowledge base domains
  if (isPublicDomain) {
    return await handlePublicKnowledgeBase(req, res, supabase);
  }

  // Refresh session if it exists
  const { data: { session } } = await supabase.auth.getSession();

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth', '/features', '/pricing', '/ai'];
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname === route);

  // If the route is public, allow access
  if (isPublicRoute) {
    return res;
  }

  // Protected routes
  const protectedRoutes = ['/knowledge-base', '/settings'];
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  // If accessing a protected route and no session, redirect to login
  // if (isProtectedRoute && !session) {
  //   const redirectUrl = new URL('/auth', req.url);
  //   redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
  //   return NextResponse.redirect(redirectUrl);
  // }

  // Check trial status for protected routes
  if (isProtectedRoute) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('trial_end, status')
      .single();

    const trialEnded = subscription?.trial_end && new Date(subscription.trial_end) < new Date();
    const noActiveSubscription = !subscription?.status || subscription.status !== 'active';

    if (trialEnded && noActiveSubscription) {
      // Redirect to pricing page if trial ended and no active subscription
      return NextResponse.redirect(new URL('/pricing', req.url));
    }
  }

  return res;
}

async function handlePublicKnowledgeBase(
  req: NextRequest,
  res: NextResponse,
  supabase: any
) {
  try {
    // For local development, use a test organization slug
    const hostname = req.headers.get('host') || '';
    const slug = process.env.NODE_ENV === 'development' ? 'procuzy' : hostname.split('.')[0];

    console.log('hostname slug', hostname, slug);
    
    // Fetch organization and verify it's published
    const { data: org } = await supabase
      .from('organizations')
      .select(`
        *,
        customize_settings (settings)
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (!org) {
      // Return 404 if org not found or not published
      return NextResponse.rewrite(new URL('/not-found', req.url));
    }

    // Create base response
    const response = NextResponse.next();

    // Add org data and settings to headers
    response.headers.set('x-organization-id', org.id);
    response.headers.set('x-kb-settings', JSON.stringify(org.customize_settings?.settings || {}));

    // Rewrite to public knowledge base pages
    const path = req.nextUrl.pathname;

    const rewriteUrl = path === '/' ? '/kb' : `${path}`;
    const url = new URL(rewriteUrl, req.url);

    // Clone the response and rewrite the URL
    const rewrittenResponse = NextResponse.rewrite(url, {
      headers: response.headers,
    });

    return rewrittenResponse;
  } catch (error) {
    console.error('Error in public knowledge base middleware:', error);
    return NextResponse.rewrite(new URL('/not-found', req.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};