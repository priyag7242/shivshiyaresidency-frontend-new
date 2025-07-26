-- Step 1: Add due_date column to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS due_date DATE;

-- Step 2: Update existing bills with due dates based on tenant joining dates
UPDATE payments p
SET due_date = (
  SELECT 
    CASE 
      WHEN t.joining_date IS NOT NULL THEN
        -- Calculate due date based on joining date day
        -- Use EXTRACT to get the day from joining date and apply to billing month
        (p.billing_month || '-01')::DATE + 
        (EXTRACT(DAY FROM t.joining_date::DATE) - 1) * INTERVAL '1 day'
      ELSE
        -- Fallback: end of billing month
        (p.billing_month || '-01')::DATE + INTERVAL '1 month' - INTERVAL '1 day'
    END
  FROM tenants t 
  WHERE t.id = p.tenant_id
)
WHERE due_date IS NULL;

-- Step 3: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);

-- Step 4: Show results
SELECT 
  p.id,
  p.tenant_name,
  p.room_number,
  p.billing_month,
  p.due_date,
  t.joining_date
FROM payments p
LEFT JOIN tenants t ON t.id = p.tenant_id
WHERE p.due_date IS NOT NULL
ORDER BY p.due_date
LIMIT 10; 