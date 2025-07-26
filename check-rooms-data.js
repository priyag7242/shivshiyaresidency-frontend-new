// Script to check all rooms data from Supabase
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://tyiqdifguusvbhaigcxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5aXFkaWZndXVzdmJoYWlnY3hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDIyMTQsImV4cCI6MjA2ODg3ODIxNH0.RdZ2AXTAEoDjnT6qsfS2O7X44f57rOWjhBLE1Q9MAq4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRoomsData() {
  console.log('🔍 CHECKING ALL ROOMS DATA FROM SUPABASE');
  console.log('==========================================');
  
  try {
    // 1. Fetch all rooms
    console.log('\n📋 FETCHING ALL ROOMS...');
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .order('room_number');
    
    if (roomsError) {
      console.error('❌ Error fetching rooms:', roomsError);
      return;
    }
    
    console.log(`✅ Found ${rooms?.length || 0} rooms in database`);
    
    if (rooms && rooms.length > 0) {
      console.log('\n🏠 ROOMS LIST:');
      console.log('==============');
      rooms.forEach((room, index) => {
        console.log(`${index + 1}. Room ${room.room_number}`);
        console.log(`   - ID: ${room.id}`);
        console.log(`   - Floor: ${room.floor}`);
        console.log(`   - Type: ${room.type}`);
        console.log(`   - Status: ${room.status}`);
        console.log(`   - Capacity: ${room.capacity}`);
        console.log(`   - Current Occupancy: ${room.current_occupancy}`);
        console.log(`   - Monthly Rent: ₹${room.monthly_rent}`);
        console.log(`   - Security Deposit: ₹${room.security_deposit}`);
        console.log(`   - Created: ${room.created_date}`);
        console.log(`   - Updated: ${room.updated_date}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No rooms found in database');
    }
    
    // 2. Fetch all tenants
    console.log('\n👥 FETCHING ALL TENANTS...');
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .order('room_number');
    
    if (tenantsError) {
      console.error('❌ Error fetching tenants:', tenantsError);
      return;
    }
    
    console.log(`✅ Found ${tenants?.length || 0} tenants in database`);
    
    if (tenants && tenants.length > 0) {
      console.log('\n👤 TENANTS LIST:');
      console.log('================');
      tenants.forEach((tenant, index) => {
        console.log(`${index + 1}. ${tenant.name}`);
        console.log(`   - Room: ${tenant.room_number}`);
        console.log(`   - Status: ${tenant.status}`);
        console.log(`   - Monthly Rent: ₹${tenant.monthly_rent}`);
        console.log(`   - Security Deposit: ₹${tenant.security_deposit}`);
        console.log(`   - Joining Date: ${tenant.joining_date}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No tenants found in database');
    }
    
    // 3. Check for missing rooms (tenants without corresponding rooms)
    console.log('\n🔍 CHECKING FOR MISSING ROOMS...');
    if (tenants && rooms) {
      const tenantRoomNumbers = [...new Set(tenants.map(t => t.room_number))];
      const roomNumbers = rooms.map(r => r.room_number);
      
      const missingRooms = tenantRoomNumbers.filter(roomNum => !roomNumbers.includes(roomNum));
      const extraRooms = roomNumbers.filter(roomNum => !tenantRoomNumbers.includes(roomNum));
      
      if (missingRooms.length > 0) {
        console.log('❌ MISSING ROOMS (tenants exist but rooms don\'t):');
        missingRooms.forEach(roomNum => {
          const roomTenants = tenants.filter(t => t.room_number === roomNum);
          console.log(`   - Room ${roomNum}: ${roomTenants.length} tenant(s)`);
          roomTenants.forEach(t => console.log(`     * ${t.name} (${t.status})`));
        });
      } else {
        console.log('✅ All tenant rooms exist in rooms table');
      }
      
      if (extraRooms.length > 0) {
        console.log('\n⚠️  EXTRA ROOMS (rooms exist but no tenants):');
        extraRooms.forEach(roomNum => {
          const room = rooms.find(r => r.room_number === roomNum);
          console.log(`   - Room ${roomNum}: ${room?.status || 'unknown status'}`);
        });
      } else {
        console.log('✅ No extra rooms found');
      }
    }
    
    // 4. Summary
    console.log('\n📊 SUMMARY:');
    console.log('============');
    console.log(`Total Rooms: ${rooms?.length || 0}`);
    console.log(`Total Tenants: ${tenants?.length || 0}`);
    console.log(`Active Tenants: ${tenants?.filter(t => t.status === 'active').length || 0}`);
    
    if (rooms && rooms.length > 0) {
      const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
      const availableRooms = rooms.filter(r => r.status === 'available').length;
      console.log(`Occupied Rooms: ${occupiedRooms}`);
      console.log(`Available Rooms: ${availableRooms}`);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkRoomsData().then(() => {
  console.log('\n✅ Data check completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 