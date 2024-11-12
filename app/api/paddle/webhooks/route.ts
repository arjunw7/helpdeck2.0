import { NextRequest } from 'next/server';
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getPaddleInstance } from '@/lib/paddle-server';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('paddle-signature');
  const rawRequestBody = await request.text();
  
  // Early return if signature is missing
  if (!signature) {
    console.error('Missing Paddle signature');
    return new Response('Missing signature', { status: 401 });
  }

  // Get API key based on environment
  const privateKey = process.env.NODE_ENV === 'production'
    ? process.env.PADDLE_PRODUCTION_API_KEY
    : process.env.PADDLE_SANDBOX_API_KEY;

  // Ensure API key is available
  if (!privateKey) {
    console.error('Missing Paddle API key');
    return new Response('Server configuration error', { status: 500 });
  }

  try {
    const paddle = getPaddleInstance();
    const eventData = paddle.webhooks.unmarshal(rawRequestBody, privateKey, signature);
    
    if (!eventData) {
      return new Response('Invalid webhook payload', { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Handle different webhook events
    switch (eventData.eventType) {
      case "subscription.created":
        await handleSubscriptionCreated(eventData.data, supabase);
        break;
      case "subscription.updated":
        await handleSubscriptionUpdated(eventData.data, supabase);
        break;
      case "subscription.canceled":
        await handleSubscriptionCanceled(eventData.data, supabase);
        break;
      default:
        console.log(`Unhandled event type: ${eventData.eventType}`);
    }

    return Response.json({
      status: 200,
      eventName: eventData.eventType
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      'Webhook processing failed',
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(data: any, supabase: any) {
  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("paddle_customer_id", data.customer_id)
    .single();

  if (!org) {
    console.error('Organization not found for customer:', data.customer_id);
    return;
  }

  await supabase.from("subscriptions").insert({
    org_id: org.id,
    paddle_subscription_id: data.subscription_id,
    paddle_customer_id: data.customer_id,
    plan_id: data.items[0].price_id,
    status: data.status,
    current_period_start: data.current_period.start,
    current_period_end: data.current_period.end,
    trial_end: data.trial_end,
    has_ai_addon: data.items.length > 1,
  });
}

async function handleSubscriptionUpdated(data: any, supabase: any) {
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("paddle_subscription_id", data.subscription_id)
    .single();

  if (!subscription) {
    console.error('Subscription not found:', data.subscription_id);
    return;
  }

  await supabase
    .from("subscriptions")
    .update({
      status: data.status,
      current_period_start: data.current_period.start,
      current_period_end: data.current_period.end,
      trial_end: data.trial_end,
      has_ai_addon: data.items.length > 1,
    })
    .eq("id", subscription.id);
}

async function handleSubscriptionCanceled(data: any, supabase: any) {
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("paddle_subscription_id", data.subscription_id)
    .single();

  if (!subscription) {
    console.error('Subscription not found:', data.subscription_id);
    return;
  }

  await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
    })
    .eq("id", subscription.id);
}