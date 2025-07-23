-- Reset password for admin user
-- Run this in Supabase SQL Editor

-- First, confirm user exists and see their details
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'admin@shivshiva.com';

-- Update password to admin123
UPDATE auth.users 
SET 
  encrypted_password = crypt('admin123', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  updated_at = NOW()
WHERE email = 'admin@shivshiva.com';

-- Verify update
SELECT 'Password updated successfully for admin@shivshiva.com' as message;