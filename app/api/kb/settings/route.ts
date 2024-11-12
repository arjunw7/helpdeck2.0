import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  const headersList = headers();
  
  try {
    const settings = headersList.get('x-kb-settings');
    const organizationId = headersList.get('x-organization-id');

    if (!settings || !organizationId) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }

    return NextResponse.json({
      settings: JSON.parse(settings),
      organizationId
    });
  } catch (error) {
    console.error('Error getting KB settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}