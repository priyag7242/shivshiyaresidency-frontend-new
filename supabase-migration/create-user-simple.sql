-- Simple user creation for Supabase Auth
-- Run this in SQL Editor

-- First, let's check if user exists
SELECT email FROM auth.users WHERE email = 'admin@shivshiva.com';

-- If no user found, you'll need to create one through Dashboard
-- Go to Authentication → Users → Add user → Create new user