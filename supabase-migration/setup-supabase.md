# Supabase Setup for Shiv Shiva Residency

## Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub

## Step 2: Create New Project
- Project name: `shiv-shiva-residency`
- Database Password: Generate a strong one (save it!)
- Region: Select closest to you (Mumbai/Singapore for India)

## Step 3: Database Schema Setup

### Users Table
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert admin user
INSERT INTO users (username, email, password_hash, full_name, phone, role) 
VALUES (
  'admin', 
  'admin@shivshiva.com', 
  crypt('admin123', gen_salt('bf')), 
  'Administrator',
  '9999999999',
  'admin'
);
```

### Rooms Table
```sql
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_number TEXT UNIQUE NOT NULL,
  floor INTEGER NOT NULL,
  room_type TEXT NOT NULL,
  status TEXT DEFAULT 'vacant',
  rent_amount DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2),
  amenities JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### Tenants Table  
```sql
CREATE TABLE tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  emergency_contact TEXT,
  aadhar_number TEXT,
  occupation TEXT,
  permanent_address TEXT,
  move_in_date DATE NOT NULL,
  move_out_date DATE,
  deposit_paid DECIMAL(10,2),
  rent_amount DECIMAL(10,2),
  payment_day INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### Payments Table
```sql
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  room_id UUID REFERENCES rooms(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_month TEXT NOT NULL,
  payment_year INTEGER NOT NULL,
  payment_method TEXT,
  transaction_id TEXT,
  status TEXT DEFAULT 'pending',
  late_fee DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### Maintenance Table
```sql
CREATE TABLE maintenance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  tenant_id UUID REFERENCES tenants(id),
  issue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  reported_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  resolved_date TIMESTAMP WITH TIME ZONE,
  assigned_to TEXT,
  cost DECIMAL(10,2),
  notes TEXT
);
```

### Visitors Table
```sql
CREATE TABLE visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  room_id UUID REFERENCES rooms(id),
  visitor_name TEXT NOT NULL,
  visitor_phone TEXT,
  purpose TEXT,
  check_in_time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  check_out_time TIMESTAMP WITH TIME ZONE,
  id_proof_type TEXT,
  id_proof_number TEXT
);
```

## Step 4: Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow all for authenticated users)
CREATE POLICY "Allow all for authenticated users" ON users
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON rooms
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON tenants
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON payments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON maintenance
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON visitors
  FOR ALL USING (auth.role() = 'authenticated');
```

## Step 5: Get API Keys
1. Go to Settings → API
2. Copy:
   - Project URL
   - anon/public key
   - service_role key (keep secret!)

## Step 6: Edge Functions Setup

We'll create Edge Functions for our API endpoints:

1. Authentication
2. Dashboard stats
3. CRUD operations for all entities