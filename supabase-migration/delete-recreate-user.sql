-- Delete existing user and recreate
-- CAUTION: This will delete the user completely

-- First delete the user
DELETE FROM auth.users WHERE email = 'admin@shivshiva.com';

-- Now create new user through Dashboard:
-- Go to Authentication → Users → Add user → Create new user
-- Email: admin@shivshiva.com
-- Password: admin123
-- Auto Confirm: ✅