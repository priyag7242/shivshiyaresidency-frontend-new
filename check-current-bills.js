const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tyiqdifguusvbhaigcxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5aXFkaWZndXVzdmJoYWlnY3hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDIyMTQsImV4cCI6MjA2ODg3ODIxNH0.RdZ2AXTAEoDjnT6qsfS2O7X44f57rOWjhBLE1Q9MAq4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCurrentBills() {
  try {
    console.log('🔍 Checking current bills status...\n');

    // Get all bills grouped by month
    const { data: bills, error } = await supabase
      .from('payments')
      .select('billing_month, status, amount')
      .order('billing_month', { ascending: false });

    if (error) {
      console.log('❌ Error fetching bills:', error.message);
      return;
    }

    console.log(`✅ Found ${bills?.length || 0} total bills`);

    // Group bills by month
    const billsByMonth = {};
    bills?.forEach(bill => {
      if (!billsByMonth[bill.billing_month]) {
        billsByMonth[bill.billing_month] = {
          total: 0,
          pending: 0,
          paid: 0,
          overdue: 0,
          partial: 0,
          totalAmount: 0
        };
      }
      billsByMonth[bill.billing_month].total++;
      billsByMonth[bill.billing_month][bill.status]++;
      billsByMonth[bill.billing_month].totalAmount += bill.amount || 0;
    });

    console.log('\n📊 Bills by Month:');
    Object.keys(billsByMonth).sort().reverse().forEach(month => {
      const monthData = billsByMonth[month];
      console.log(`\n📅 ${month}:`);
      console.log(`   Total Bills: ${monthData.total}`);
      console.log(`   Pending: ${monthData.pending}`);
      console.log(`   Paid: ${monthData.paid}`);
      console.log(`   Overdue: ${monthData.overdue}`);
      console.log(`   Partial: ${monthData.partial}`);
      console.log(`   Total Amount: ₹${monthData.totalAmount.toLocaleString()}`);
    });

    // Check current month
    const currentMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
    const nextMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 2).padStart(2, '0');
    
    console.log(`\n🎯 Current Month: ${currentMonth}`);
    console.log(`🎯 Next Month: ${nextMonth}`);

    if (billsByMonth[currentMonth]) {
      console.log(`✅ Bills already exist for ${currentMonth}`);
      console.log(`📋 Status: ${billsByMonth[currentMonth].pending} pending, ${billsByMonth[currentMonth].paid} paid`);
    } else {
      console.log(`❌ No bills exist for ${currentMonth}`);
    }

    if (billsByMonth[nextMonth]) {
      console.log(`✅ Bills already exist for ${nextMonth}`);
    } else {
      console.log(`❌ No bills exist for ${nextMonth} - can generate`);
    }

    // Check active tenants count
    const { data: activeTenants, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('status', 'active');

    if (tenantError) {
      console.log('❌ Error fetching tenants:', tenantError.message);
    } else {
      console.log(`\n👥 Active Tenants: ${activeTenants?.length || 0}`);
      
      if (billsByMonth[currentMonth]) {
        const expectedBills = activeTenants?.length || 0;
        const actualBills = billsByMonth[currentMonth].total;
        console.log(`📊 Bills for ${currentMonth}: ${actualBills}/${expectedBills}`);
        
        if (actualBills < expectedBills) {
          console.log(`⚠️ Missing ${expectedBills - actualBills} bills for ${currentMonth}`);
        } else if (actualBills > expectedBills) {
          console.log(`⚠️ Extra ${actualBills - expectedBills} bills for ${currentMonth}`);
        } else {
          console.log(`✅ All bills generated for ${currentMonth}`);
        }
      }
    }

    console.log('\n💡 Recommendations:');
    if (billsByMonth[currentMonth] && billsByMonth[currentMonth].total > 0) {
      console.log('1. Bills already exist for current month');
      console.log('2. Try generating bills for next month');
      console.log('3. Or check if some tenants are missing bills');
    } else {
      console.log('1. Generate bills for current month');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkCurrentBills(); 