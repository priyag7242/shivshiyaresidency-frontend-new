-- Fix Payments Table Schema
-- Add missing fields for electricity and payment calculations

-- Add missing columns to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS electricity_units INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS electricity_rate DECIMAL(10,2) DEFAULT 12.00,
ADD COLUMN IF NOT EXISTS electricity_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS rent_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS other_charges DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS adjustments DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance_due DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to have proper values
UPDATE payments 
SET 
  rent_amount = COALESCE(amount, 0),
  total_amount = COALESCE(amount, 0),
  balance_due = COALESCE(amount, 0),
  electricity_amount = 0,
  electricity_units = 0
WHERE rent_amount IS NULL OR rent_amount = 0;

-- Add comments for clarity
COMMENT ON COLUMN payments.electricity_units IS 'Electricity units consumed';
COMMENT ON COLUMN payments.electricity_rate IS 'Rate per electricity unit (₹/unit)';
COMMENT ON COLUMN payments.electricity_amount IS 'Total electricity amount (units * rate)';
COMMENT ON COLUMN payments.rent_amount IS 'Monthly rent amount';
COMMENT ON COLUMN payments.other_charges IS 'Other charges (if any)';
COMMENT ON COLUMN payments.adjustments IS 'Adjustments (discounts/additions)';
COMMENT ON COLUMN payments.total_amount IS 'Total bill amount (rent + electricity + other - adjustments)';
COMMENT ON COLUMN payments.amount_paid IS 'Amount paid by tenant';
COMMENT ON COLUMN payments.balance_due IS 'Remaining balance to be paid';
COMMENT ON COLUMN payments.generated_date IS 'Date when bill was generated'; 