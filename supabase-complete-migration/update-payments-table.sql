-- Update Existing Payments Table Structure
-- This SQL updates the existing table without dropping it

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add payment_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payments' AND column_name = 'payment_date') THEN
        ALTER TABLE payments ADD COLUMN payment_date DATE;
    END IF;

    -- Add payment_method column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payments' AND column_name = 'payment_method') THEN
        ALTER TABLE payments ADD COLUMN payment_method TEXT CHECK (payment_method IN ('cash', 'upi', 'bank_transfer', 'cheque'));
    END IF;

    -- Add transaction_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payments' AND column_name = 'transaction_id') THEN
        ALTER TABLE payments ADD COLUMN transaction_id TEXT;
    END IF;

    -- Add remarks column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payments' AND column_name = 'remarks') THEN
        ALTER TABLE payments ADD COLUMN remarks TEXT;
    END IF;

    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payments' AND column_name = 'created_by') THEN
        ALTER TABLE payments ADD COLUMN created_by TEXT DEFAULT 'admin';
    END IF;

    -- Update status column constraint if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'payments' AND column_name = 'status') THEN
        -- Drop existing constraint if it exists
        BEGIN
            ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
        EXCEPTION
            WHEN OTHERS THEN NULL;
        END;
        
        -- Add new constraint
        ALTER TABLE payments ADD CONSTRAINT payments_status_check 
        CHECK (status IN ('pending', 'paid', 'overdue', 'partial'));
    END IF;

END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_billing_month ON payments(billing_month);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_room_number ON payments(room_number);

-- Create unique constraint if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_tenant_month_unique 
ON payments(tenant_id, billing_month) 
WHERE status IN ('pending', 'overdue', 'partial');

-- Function to automatically update status when payment is recorded
CREATE OR REPLACE FUNCTION update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update status based on payment
    IF NEW.payment_date IS NOT NULL AND NEW.payment_method IS NOT NULL THEN
        NEW.status = 'paid';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_payment_status ON payments;

-- Create trigger to automatically update status
CREATE TRIGGER trigger_update_payment_status
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_status();

-- Function to automatically mark bills as overdue
CREATE OR REPLACE FUNCTION mark_overdue_bills()
RETURNS void AS $$
BEGIN
    UPDATE payments 
    SET status = 'overdue'
    WHERE status = 'pending' 
    AND billing_month < to_char(CURRENT_DATE, 'YYYY-MM');
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL ON payments TO authenticated;
GRANT ALL ON payments TO service_role;

-- Enable Row Level Security (RLS) if not already enabled
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert payments" ON payments;
DROP POLICY IF EXISTS "Users can update payments" ON payments;
DROP POLICY IF EXISTS "Users can delete payments" ON payments;

-- Create RLS policies
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update payments" ON payments
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete payments" ON payments
    FOR DELETE USING (auth.uid() IS NOT NULL);

COMMENT ON TABLE payments IS 'Payments table for bill and payment management';
COMMENT ON COLUMN payments.billing_month IS 'Format: YYYY-MM (e.g., 2025-01)';
COMMENT ON COLUMN payments.amount IS 'Total bill amount in INR';
COMMENT ON COLUMN payments.status IS 'pending, paid, overdue, or partial'; 