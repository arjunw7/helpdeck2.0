-- Add notification_settings column to profiles table
ALTER TABLE profiles
ADD COLUMN notification_settings jsonb DEFAULT '{
  "email": true,
  "push": false,
  "weekly": true
}'::jsonb;