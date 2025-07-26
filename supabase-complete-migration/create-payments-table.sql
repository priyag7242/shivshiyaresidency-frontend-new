-- Create payments table for bill and payment management
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    tenant_name TEXT NOT NULL,
    room_number TEXT NOT NULL,
    bill_month TEXT NOT NULL, -- Format: YYYY-MM
    due_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    rent_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    electricity_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    food_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    other_charges DECIMAL(10,2) NOT NULL DEFAULT 0,
    balance_due DECIMAL(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'partial')),
    payment_method TEXT CHECK (payment_method IN ('cash', 'upi', 'bank_transfer', 'cheque')),
    payment_date DATE,
    payment_amount DECIMAL(10,2) DEFAULT 0,
    transaction_id TEXT,
    notes TEXT,
    reminder_count INTEGER DEFAULT 0,
    last_reminder_sent TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_bill_month ON payments(bill_month);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_room_number ON payments(room_number);

-- Create unique constraint to prevent duplicate bills for same tenant and month
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_tenant_month_unique 
ON payments(tenant_id, bill_month) 
WHERE status IN ('pending', 'overdue', 'partial');

-- Function to automatically update balance_due when payment_amount changes
CREATE OR REPLACE FUNCTION update_payment_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate new balance due
    NEW.balance_due = GREATEST(0, NEW.total_amount - COALESCE(NEW.payment_amount, 0));
    
    -- Update status based on payment amount
    IF NEW.payment_amount >= NEW.total_amount THEN
        NEW.status = 'paid';
    ELSIF NEW.payment_amount > 0 THEN
        NEW.status = 'partial';
    ELSE
        NEW.status = 'pending';
    END IF;
    
    -- Update updated_at timestamp
    NEW.updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update balance and status
CREATE TRIGGER trigger_update_payment_balance
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_balance();

-- Function to update updated_at timestamp on insert
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on insert
CREATE TRIGGER trigger_update_payments_updated_at
    BEFORE INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_payments_updated_at();

-- Function to automatically mark bills as overdue
CREATE OR REPLACE FUNCTION mark_overdue_bills()
RETURNS void AS $$
BEGIN
    UPDATE payments 
    SET status = 'overdue', updated_at = NOW()
    WHERE status = 'pending' 
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to mark overdue bills (if using pg_cron extension)
-- SELECT cron.schedule('mark-overdue-bills', '0 9 * * *', 'SELECT mark_overdue_bills();');

-- Insert some sample data for testing (optional)
-- INSERT INTO payments (tenant_id, tenant_name, room_number, bill_month, due_date, total_amount, rent_amount, electricity_amount, food_amount, balance_due, status) VALUES
-- ('sample-tenant-id', 'Sample Tenant', '101', '2025-01', '2025-02-05', 8000, 6000, 1000, 1000, 8000, 'pending');

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