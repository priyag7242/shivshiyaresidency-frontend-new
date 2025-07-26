-- Fix missing created_date column in payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to have created_date
UPDATE payments 
SET created_date = NOW() 
WHERE created_date IS NULL;

-- Also ensure other potentially missing columns exist
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'admin';

-- Check if the column was added successfully
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payments' AND column_name = 'created_date'; 