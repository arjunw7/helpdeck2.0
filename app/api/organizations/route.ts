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
    const { name, timezone, logo } = body;

    // Insert organization
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert([
        {
          name,
          timezone,
          logo,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (orgError) throw orgError;

    return NextResponse.json(org);
  } catch (error) {
    console.error("Error creating organization:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}