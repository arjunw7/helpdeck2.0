import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { full_name, avatar_url, org_id } = body;

    // Update user profile
    const { error: userError } = await supabase
      .from("users")
      .insert([
        {
          id: user.id,
          full_name,
          avatar_url,
          org_id,
          created_at: new Date().toISOString(),
        },
      ]);

    if (userError) throw userError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating user profile:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}