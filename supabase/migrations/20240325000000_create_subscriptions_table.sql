-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  paddle_subscription_id TEXT NOT NULL UNIQUE,
  paddle_customer_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'paused')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  trial_end TIMESTAMP WITH TIME ZONE,
  cancel_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  has_ai_addon BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX idx_subscriptions_paddle_subscription_id ON subscriptions(paddle_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Add RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's subscription"
  ON subscriptions FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM profiles
      WHERE id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add paddle columns to organizations table
ALTER TABLE organizations
ADD COLUMN paddle_customer_id TEXT UNIQUE,
ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE;