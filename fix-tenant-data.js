// Script to fix tenant data issues
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://tyiqdifguusvbhaigcxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5aXFkaWZndXVzdmJoYWlnY3hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDIyMTQsImV4cCI6MjA2ODg3ODIxNH0.RdZ2AXTAEoDjnT6qsfS2O7X44f57rOWjhBLE1Q9MAq4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTenantData() {
  console.log('🔧 FIXING TENANT DATA ISSUES');
  console.log('=============================');
  
  try {
    // 1. First, get all rooms to know what rooms actually exist
    console.log('\n📋 Getting all existing rooms...');
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .order('room_number');
    
    if (roomsError) {
      console.error('❌ Error fetching rooms:', roomsError);
      return;
    }
    
    const existingRoomNumbers = rooms.map(r => r.room_number);
    console.log(`✅ Found ${existingRoomNumbers.length} existing rooms`);
    
    // 2. Get all tenants
    console.log('\n👥 Getting all tenants...');
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .order('room_number');
    
    if (tenantsError) {
      console.error('❌ Error fetching tenants:', tenantsError);
      return;
    }
    
    console.log(`✅ Found ${tenants?.length || 0} tenants`);
    
    // 3. Identify issues
    console.log('\n🔍 Identifying tenant data issues...');
    
    const issues = [];
    const tenantsToFix = [];
    
    tenants.forEach(tenant => {
      const roomNumber = tenant.room_number;
      
      // Check if tenant's room exists
      if (!existingRoomNumbers.includes(roomNumber)) {
        issues.push({
          tenant: tenant,
          issue: 'ROOM_NOT_EXISTS',
          message: `Tenant ${tenant.name} assigned to non-existent room ${roomNumber}`
        });
        tenantsToFix.push(tenant);
      }
      
      // Check for duplicate tenants in same room
      const sameRoomTenants = tenants.filter(t => t.room_number === roomNumber && t.id !== tenant.id);
      if (sameRoomTenants.length > 0) {
        issues.push({
          tenant: tenant,
          issue: 'DUPLICATE_ROOM',
          message: `Multiple tenants in room ${roomNumber}: ${tenant.name} + ${sameRoomTenants.map(t => t.name).join(', ')}`
        });
      }
      
      // Check for suspicious rent amounts
      if (tenant.monthly_rent <= 0 || tenant.monthly_rent > 50000) {
        issues.push({
          tenant: tenant,
          issue: 'SUSPICIOUS_RENT',
          message: `Suspicious rent amount: ₹${tenant.monthly_rent} for ${tenant.name}`
        });
      }
    });
    
    // 4. Display issues
    console.log(`\n❌ Found ${issues.length} issues:`);
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.message}`);
    });
    
    // 5. Find available rooms for reassignment
    console.log('\n🏠 Finding available rooms for reassignment...');
    const availableRooms = rooms.filter(room => {
      const roomTenants = tenants.filter(t => t.room_number === room.room_number);
      return roomTenants.length === 0 || room.status === 'available';
    });
    
    console.log(`✅ Found ${availableRooms.length} available rooms for reassignment`);
    
    // 6. Fix tenant data
    console.log('\n🔧 Starting tenant data fixes...');
    
    let fixedCount = 0;
    let reassignedCount = 0;
    
    for (const tenant of tenantsToFix) {
      try {
        // Find an available room for this tenant
        const availableRoom = availableRooms.find(room => {
          const roomTenants = tenants.filter(t => t.room_number === room.room_number);
          return roomTenants.length === 0;
        });
        
        if (availableRoom) {
          // Update tenant to use available room
          const { error: updateError } = await supabase
            .from('tenants')
            .update({
              room_number: availableRoom.room_number,
              updated_at: new Date().toISOString()
            })
            .eq('id', tenant.id);
          
          if (updateError) {
            console.error(`❌ Failed to update tenant ${tenant.name}:`, updateError);
          } else {
            console.log(`✅ Reassigned ${tenant.name} from room ${tenant.room_number} to room ${availableRoom.room_number}`);
            reassignedCount++;
          }
        } else {
          console.log(`⚠️  No available room found for ${tenant.name} (currently in room ${tenant.room_number})`);
        }
        
        fixedCount++;
      } catch (error) {
        console.error(`❌ Error fixing tenant ${tenant.name}:`, error);
      }
    }
    
    // 7. Fix duplicate tenants in same room
    console.log('\n🔧 Fixing duplicate tenants in same room...');
    
    const roomGroups = {};
    tenants.forEach(tenant => {
      if (!roomGroups[tenant.room_number]) {
        roomGroups[tenant.room_number] = [];
      }
      roomGroups[tenant.room_number].push(tenant);
    });
    
    for (const [roomNumber, roomTenants] of Object.entries(roomGroups)) {
      if (roomTenants.length > 1) {
        console.log(`⚠️  Room ${roomNumber} has ${roomTenants.length} tenants: ${roomTenants.map(t => t.name).join(', ')}`);
        
        // Keep the first tenant, mark others as inactive
        for (let i = 1; i < roomTenants.length; i++) {
          const tenant = roomTenants[i];
          const { error: updateError } = await supabase
            .from('tenants')
            .update({
              status: 'inactive',
              updated_at: new Date().toISOString()
            })
            .eq('id', tenant.id);
          
          if (updateError) {
            console.error(`❌ Failed to deactivate duplicate tenant ${tenant.name}:`, updateError);
          } else {
            console.log(`✅ Deactivated duplicate tenant ${tenant.name} in room ${roomNumber}`);
          }
        }
      }
    }
    
    // 8. Summary
    console.log('\n📊 FIX SUMMARY:');
    console.log('===============');
    console.log(`Total issues found: ${issues.length}`);
    console.log(`Tenants reassigned: ${reassignedCount}`);
    console.log(`Tenants fixed: ${fixedCount}`);
    console.log(`Available rooms remaining: ${availableRooms.length - reassignedCount}`);
    
    console.log('\n✅ Tenant data fix completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixTenantData().then(() => {
  console.log('\n✅ Script completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 