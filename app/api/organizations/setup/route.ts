import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const body = await request.json();
    const { name, logo, user } = body;

    // Start a transaction
    const { data: org, error: txError } = await supabase.rpc('create_organization', {
      p_name: name,
      p_logo: logo,
      p_user_id: user.id,
      p_user_email: user.email,
      p_trial_days: 14
    });

    if (txError) {
      throw txError;
    }

    return NextResponse.json(org);
  } catch (error) {
    console.error("Error creating organization:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to create organization" 
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}