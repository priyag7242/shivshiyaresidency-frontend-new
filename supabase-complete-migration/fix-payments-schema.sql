-- Fix Payments Table Schema Issues
-- This script addresses the "Could not find the 'created_date' column" error

-- 1. Add missing columns to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'admin';

-- 2. Update existing records to have created_date
UPDATE payments 
SET created_date = NOW() 
WHERE created_date IS NULL;

-- 3. Update existing records to have created_by
UPDATE payments 
SET created_by = 'admin' 
WHERE created_by IS NULL;

-- 4. Ensure all required columns exist
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS electricity_units INTEGER DEFAULT 0;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS electricity_rate DECIMAL(10,2) DEFAULT 12.00;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS electricity_amount DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS rent_amount DECIMAL(10,2) DEFAULT 0.00;

-- 5. Verify the schema
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'payments' 
ORDER BY ordinal_position;

-- 6. Check for any remaining issues
SELECT COUNT(*) as total_payments,
       COUNT(created_date) as with_created_date,
       COUNT(created_by) as with_created_by
FROM payments; 