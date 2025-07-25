-- Migration to create payments table for bills and payments
-- Run this in your Supabase SQL editor

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  tenant_name TEXT NOT NULL,
  room_number TEXT NOT NULL,
  billing_month TEXT NOT NULL, -- Format: YYYY-MM
  rent_amount DECIMAL(10,2) DEFAULT 0,
  electricity_units INTEGER DEFAULT 0,
  electricity_rate DECIMAL(10,2) DEFAULT 0,
  electricity_amount DECIMAL(10,2) DEFAULT 0,
  other_charges DECIMAL(10,2) DEFAULT 0,
  adjustments DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  balance_due DECIMAL(10,2) DEFAULT 0,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('paid', 'partial', 'pending', 'overdue')),
  payment_method TEXT DEFAULT 'pending' CHECK (payment_method IN ('cash', 'upi', 'bank_transfer', 'card', 'pending')),
  payment_date DATE,
  transaction_id TEXT,
  notes TEXT,
  generated_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_room_number ON payments(room_number);
CREATE INDEX IF NOT EXISTS idx_payments_billing_month ON payments(billing_month);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_payments_updated_at ON payments;
CREATE TRIGGER trigger_update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_updated_at();

-- Create function to automatically calculate balance_due
CREATE OR REPLACE FUNCTION calculate_payment_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate balance: total_amount - amount_paid
  NEW.balance_due = NEW.total_amount - NEW.amount_paid;
  
  -- Update status based on balance
  IF NEW.balance_due <= 0 THEN
    NEW.status = 'paid';
  ELSIF NEW.amount_paid > 0 THEN
    NEW.status = 'partial';
  ELSE
    NEW.status = 'pending';
  END IF;
  
  -- Update the updated_at timestamp
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate balance when amount_paid changes
DROP TRIGGER IF EXISTS trigger_calculate_payment_balance ON payments;
CREATE TRIGGER trigger_calculate_payment_balance
  BEFORE INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION calculate_payment_balance();

-- Add comments to document the table
COMMENT ON TABLE payments IS 'Table to store bills and payments for tenants';
COMMENT ON COLUMN payments.tenant_id IS 'Reference to the tenant who owes/is paying';
COMMENT ON COLUMN payments.tenant_name IS 'Name of the tenant (denormalized for performance)';
COMMENT ON COLUMN payments.room_number IS 'Room number where tenant stays';
COMMENT ON COLUMN payments.billing_month IS 'Billing month in YYYY-MM format';
COMMENT ON COLUMN payments.rent_amount IS 'Monthly rent amount';
COMMENT ON COLUMN payments.electricity_units IS 'Electricity units consumed';
COMMENT ON COLUMN payments.electricity_rate IS 'Rate per electricity unit';
COMMENT ON COLUMN payments.electricity_amount IS 'Total electricity cost';
COMMENT ON COLUMN payments.other_charges IS 'Any other charges (maintenance, etc.)';
COMMENT ON COLUMN payments.adjustments IS 'Any adjustments (positive or negative)';
COMMENT ON COLUMN payments.total_amount IS 'Total bill amount (rent + electricity + other + adjustments)';
COMMENT ON COLUMN payments.amount_paid IS 'Amount that has been paid';
COMMENT ON COLUMN payments.balance_due IS 'Remaining amount to be paid (calculated automatically)';
COMMENT ON COLUMN payments.due_date IS 'Date when payment is due';
COMMENT ON COLUMN payments.status IS 'Payment status: paid, partial, pending, overdue';
COMMENT ON COLUMN payments.payment_method IS 'Method used for payment: cash, upi, bank_transfer, card, pending';
COMMENT ON COLUMN payments.payment_date IS 'Date when payment was made';
COMMENT ON COLUMN payments.transaction_id IS 'Transaction ID for digital payments';
COMMENT ON COLUMN payments.notes IS 'Additional notes about the payment';
COMMENT ON COLUMN payments.generated_date IS 'Date when the bill was generated'; 