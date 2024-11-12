import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    if (!session?.user) {
      return NextResponse.json(
        { error: "No authenticated user" },
        { status: 401 }
      );
    }

    // First, get the user's organization ID
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("org_id")
      .eq("id", session.user.id)
      .single();

    if (userError) {
      if (userError.code === "PGRST116") {
        // No user record found
        return NextResponse.json({ needsOnboarding: true });
      }
      throw userError;
    }

    if (!userData?.org_id) {
      return NextResponse.json({ needsOnboarding: true });
    }

    // Then get the organization details
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", userData.org_id)
      .single();

    if (orgError) {
      throw orgError;
    }

    if (!organization) {
      return NextResponse.json({ needsOnboarding: true });
    }

    return NextResponse.json({
      organization,
      needsOnboarding: false,
    });
  } catch (error) {
    console.error("Organization check error:", error);
    return NextResponse.json(
      { error: "Failed to check organization status" },
      { status: 500 }
    );
  }
}