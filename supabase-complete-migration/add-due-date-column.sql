-- Add due_date column to payments table
-- This column will store the due date for each bill based on tenant joining date

DO $$ 
BEGIN
    -- Add due_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' 
        AND column_name = 'due_date'
    ) THEN
        ALTER TABLE payments ADD COLUMN due_date DATE;
        RAISE NOTICE 'Added due_date column to payments table';
    ELSE
        RAISE NOTICE 'due_date column already exists in payments table';
    END IF;
END $$;

-- Update existing bills to have due dates (end of billing month as fallback)
UPDATE payments 
SET due_date = (
    CASE 
        WHEN billing_month IS NOT NULL THEN
            (billing_month || '-01')::DATE + INTERVAL '1 month' - INTERVAL '1 day'
        ELSE
            created_at::DATE + INTERVAL '1 month' - INTERVAL '1 day'
    END
)::DATE
WHERE due_date IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);

-- Add comment to document the column
COMMENT ON COLUMN payments.due_date IS 'Due date for the bill, calculated based on tenant joining date'; 