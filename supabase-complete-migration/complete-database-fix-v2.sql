-- Complete Database Fix v2
-- This script fixes all schema issues including the "created_date" column error

-- 1. Fix payments table schema
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'admin';

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS electricity_units INTEGER DEFAULT 0;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS electricity_rate DECIMAL(10,2) DEFAULT 12.00;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS electricity_amount DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS rent_amount DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS other_charges DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS adjustments DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS balance_due DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS generated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Fix tenants table schema
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS last_electricity_reading INTEGER DEFAULT 0;

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS electricity_joining_reading INTEGER DEFAULT 0;

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS monthly_rent DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS security_deposit DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 3. Update existing payments data
UPDATE payments 
SET created_date = NOW() 
WHERE created_date IS NULL;

UPDATE payments 
SET created_by = 'admin' 
WHERE created_by IS NULL;

-- Update payments with existing amount data if available
UPDATE payments 
SET rent_amount = COALESCE(amount, 0),
    total_amount = COALESCE(amount, 0),
    balance_due = COALESCE(amount, 0)
WHERE (rent_amount IS NULL OR rent_amount = 0) AND amount IS NOT NULL;

-- 4. Update existing tenants data
UPDATE tenants 
SET status = 'active' 
WHERE status IS NULL;

-- Note: monthly_rent will be set to 0 by default if not already set

-- 5. Verify the schema
SELECT 'payments' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'payments' 
ORDER BY ordinal_position;

SELECT 'tenants' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'tenants' 
ORDER BY ordinal_position;

-- 6. Check data integrity
SELECT 
    'payments' as table_name,
    COUNT(*) as total_records,
    COUNT(created_date) as with_created_date,
    COUNT(created_by) as with_created_by
FROM payments
UNION ALL
SELECT 
    'tenants' as table_name,
    COUNT(*) as total_records,
    COUNT(status) as with_status,
    COUNT(monthly_rent) as with_rent
FROM tenants; 