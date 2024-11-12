import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const redirectTo = requestUrl.searchParams.get("redirectTo") || "/knowledge-base/analytics";

    if (code) {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      
      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code);

      // Check if user has completed onboarding
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("org_id")
          .eq("id", user.id)
          .single();

        // Redirect to onboarding if user doesn't have an organization
        if (!profile?.org_id) {
          return NextResponse.redirect(new URL("/onboarding", requestUrl.origin));
        }
      }

      // Redirect to the intended destination
      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
    }

    // If no code, redirect to home
    return NextResponse.redirect(new URL("/", requestUrl.origin));
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(new URL("/auth", request.url));
  }
}