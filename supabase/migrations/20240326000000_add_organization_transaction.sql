-- Create a function to handle organization creation transaction
CREATE OR REPLACE FUNCTION create_organization(
  p_name TEXT,
  p_logo TEXT,
  p_user_id UUID,
  p_user_email TEXT,
  p_trial_days INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_id UUID;
  v_trial_end TIMESTAMP WITH TIME ZONE;
  v_org JSON;
BEGIN
  -- Calculate trial end date
  v_trial_end := NOW() + (p_trial_days || ' days')::INTERVAL;

  -- Start transaction
  BEGIN
    -- Create organization
    INSERT INTO organizations (
      name,
      logo,
      trial_ends_at,
      created_at
    ) VALUES (
      p_name,
      p_logo,
      v_trial_end,
      NOW()
    )
    RETURNING id INTO v_org_id;

    -- Create owner profile
    INSERT INTO profiles (
      id,
      org_id,
      role,
      email,
      active,
      created_at,
      updated_at
    ) VALUES (
      p_user_id,
      v_org_id,
      'owner',
      p_user_email,
      true,
      NOW(),
      NOW()
    );

    -- Create trial subscription
    INSERT INTO subscriptions (
      org_id,
      paddle_subscription_id,
      paddle_customer_id,
      plan_id,
      status,
      current_period_start,
      current_period_end,
      trial_end,
      has_ai_addon
    ) VALUES (
      v_org_id,
      'trial_' || v_org_id,
      'trial_' || v_org_id,
      'trial',
      'trialing',
      NOW(),
      v_trial_end,
      v_trial_end,
      true
    );

    -- Get organization details
    SELECT json_build_object(
      'id', id,
      'name', name,
      'logo', logo,
      'trial_ends_at', trial_ends_at,
      'created_at', created_at
    ) INTO v_org
    FROM organizations
    WHERE id = v_org_id;

    -- Commit transaction
    RETURN v_org;
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback transaction on any error
      RAISE;
  END;
END;
$$;