-- Fix Payments Table Structure
-- This SQL matches the existing payments table structure

-- Drop existing table if it has wrong structure
DROP TABLE IF EXISTS payments CASCADE;

-- Create payments table with correct structure
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    tenant_name TEXT NOT NULL,
    room_number TEXT NOT NULL,
    billing_month TEXT NOT NULL, -- Format: YYYY-MM
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_date DATE,
    payment_method TEXT CHECK (payment_method IN ('cash', 'upi', 'bank_transfer', 'cheque')),
    transaction_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'partial')),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT DEFAULT 'admin'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_billing_month ON payments(billing_month);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_room_number ON payments(room_number);

-- Create unique constraint to prevent duplicate bills for same tenant and month
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

-- Trigger to automatically update status
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

-- Enable Row Level Security (RLS)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update payments" ON payments
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete payments" ON payments
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Insert sample data for testing (optional)
-- INSERT INTO payments (tenant_id, tenant_name, room_number, billing_month, amount, status, remarks) VALUES
-- ('sample-tenant-id', 'Sample Tenant', '101', '2025-01', 8000, 'pending', 'Monthly rent for 2025-01');

COMMENT ON TABLE payments IS 'Payments table for bill and payment management';
COMMENT ON COLUMN payments.billing_month IS 'Format: YYYY-MM (e.g., 2025-01)';
COMMENT ON COLUMN payments.amount IS 'Total bill amount in INR';
COMMENT ON COLUMN payments.status IS 'pending, paid, overdue, or partial'; 