// Script to restore all deactivated tenants and fix room assignments properly
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://tyiqdifguusvbhaigcxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5aXFkaWZndXVzdmJoYWlnY3hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDIyMTQsImV4cCI6MjA2ODg3ODIxNH0.RdZ2AXTAEoDjnT6qsfS2O7X44f57rOWjhBLE1Q9MAq4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreTenantData() {
  console.log('🔄 RESTORING ORIGINAL TENANT DATA');
  console.log('==================================');
  
  try {
    // 1. First, get all tenants (including inactive ones)
    console.log('\n👥 Getting all tenants (including inactive)...');
    const { data: allTenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .order('room_number');
    
    if (tenantsError) {
      console.error('❌ Error fetching tenants:', tenantsError);
      return;
    }
    
    console.log(`✅ Found ${allTenants?.length || 0} total tenants`);
    
    // 2. Get all rooms
    console.log('\n📋 Getting all rooms...');
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
    
    // 3. Find all inactive tenants that need to be restored
    const inactiveTenants = allTenants.filter(t => t.status === 'inactive');
    console.log(`\n🔍 Found ${inactiveTenants.length} inactive tenants to restore`);
    
    // 4. Create a mapping of original room assignments
    const originalRoomAssignments = {
      // These are the original room assignments that were working
      '001': ['sheetal', 'Tanish Bist', 'Jasmine'],
      '101': ['DAISY KRISHNA', 'SHRESTH GAHLOT'],
      '111': ['PRANJAL TARIYAL', 'ARYAN'],
      '113': ['PRACHI', 'DR KRISHNA'],
      '117': ['VISHAL M', 'DESIGNAR', 'ANIKET'],
      '201': ['PRIYA GOYAL', 'SHIVANGI SAHU', 'DHRITI SHARMA'],
      '202': ['SHAIL', 'SACHIN RAIKAR', 'CHIRAG BANSAL', 'SACHIN RAIKWAR'],
      '203': ['SHIV NANDAN', 'HARSHITA NEGI', 'SHIV NANDAN'],
      '204': ['ARUSHI', 'RASHI GUPTA'],
      '207': ['RAJEEV SINGH', 'ADITYA'],
      '208': ['SHIVAM KUMAR', 'AMAN'],
      '214': ['RAHUL RANGAR', 'KULDEEP CHOUDHRY'],
      '216': ['HARSH VARDHAN', 'PRACHI VERMA'],
      '217': ['AVINESH KUMAR', 'SHIVAM VARMA', 'SAGAR SINGH'],
      '218': ['SHAMBHAVI', 'MUSKAN', 'PRIYA BHATT'],
      '219': ['AMAN SINGH', 'JATIN KUMAR'],
      '301': ['SONAM CHOUDHRY', 'NITU TIWARI', 'ANUSHKA'],
      '302': ['DEVENDRA', 'HIMANSHU', 'RISHAB'],
      '317': ['VIKASH TYAGI', 'KIRTIPAL'],
      '318': ['VIVEK', 'ARYAN GOYAL'],
      '319': ['MAIMA GARG', 'TANUJA RAJE'],
      '401': ['CHETAN PANT', 'NIKHIL', 'ROHIT SENWAR'],
      '402': ['PARSHANT', 'PANKAJ KUMAR'],
      '403': ['AISHWARYA', 'ARYAN'],
      '411': ['divyansh', 'yuvraj'],
      '417': ['SHIVANI SINGH', 'MEENAKSHI TIWARI', 'AKANSHA GUPTA'],
      '418': ['AL TANZEEN KHAN', 'KHUSHI VERMA'],
      '419': ['JYOTI', 'TANPREET KAUR'],
      '502': ['SHAIL SINGH', 'HARSH VARMA', 'KARTIK'],
      // These tenants were assigned to non-existent rooms, need to find proper rooms
      '120': ['CHIRAG BANSAL'],
      '412': ['AMANDEEP SINGH'],
      '420': ['MEENAKSHI TIWARI'],
      '503': ['RAJEEV SINGH'],
      '504': ['DESIGANAR'],
      '505': ['AKANKSHA GUPTA'],
      '506': ['DHRITI SHARMA'],
      '507': ['TANUJA RAJE'],
      '508': ['AMAN SINGH'],
      '509': ['JOYATI']
    };
    
    // 5. Find available rooms for tenants that were in non-existent rooms
    const availableRooms = rooms.filter(room => {
      const roomTenants = allTenants.filter(t => t.room_number === room.room_number && t.status === 'active');
      return roomTenants.length === 0;
    });
    
    console.log(`✅ Found ${availableRooms.length} available rooms for reassignment`);
    
    // 6. Restore all inactive tenants to their original rooms
    console.log('\n🔄 Restoring inactive tenants...');
    
    let restoredCount = 0;
    let reassignedCount = 0;
    
    for (const tenant of inactiveTenants) {
      try {
        let targetRoom = tenant.room_number;
        
        // If tenant was in a non-existent room, find an available room
        if (!existingRoomNumbers.includes(targetRoom)) {
          const availableRoom = availableRooms.find(room => {
            const roomTenants = allTenants.filter(t => t.room_number === room.room_number && t.status === 'active');
            return roomTenants.length === 0;
          });
          
          if (availableRoom) {
            targetRoom = availableRoom.room_number;
            console.log(`🔄 Reassigning ${tenant.name} from non-existent room ${tenant.room_number} to available room ${targetRoom}`);
            reassignedCount++;
          } else {
            console.log(`⚠️  No available room found for ${tenant.name} (was in room ${tenant.room_number})`);
            continue;
          }
        }
        
        // Restore tenant to active status
        const { error: updateError } = await supabase
          .from('tenants')
          .update({
            room_number: targetRoom,
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', tenant.id);
        
        if (updateError) {
          console.error(`❌ Failed to restore tenant ${tenant.name}:`, updateError);
        } else {
          console.log(`✅ Restored ${tenant.name} to room ${targetRoom}`);
          restoredCount++;
        }
        
      } catch (error) {
        console.error(`❌ Error restoring tenant ${tenant.name}:`, error);
      }
    }
    
    // 7. Fix the overcrowded room 118 by redistributing tenants
    console.log('\n🏠 Fixing overcrowded room 118...');
    
    const room118Tenants = allTenants.filter(t => t.room_number === '118' && t.status === 'active');
    if (room118Tenants.length > 1) {
      console.log(`⚠️  Room 118 has ${room118Tenants.length} tenants, redistributing...`);
      
      // Find available rooms
      const availableForRedistribution = rooms.filter(room => {
        const roomTenants = allTenants.filter(t => t.room_number === room.room_number && t.status === 'active');
        return roomTenants.length === 0 && room.room_number !== '118';
      });
      
      // Redistribute tenants from room 118
      for (let i = 1; i < room118Tenants.length && i < availableForRedistribution.length; i++) {
        const tenant = room118Tenants[i];
        const newRoom = availableForRedistribution[i - 1];
        
        const { error: updateError } = await supabase
          .from('tenants')
          .update({
            room_number: newRoom.room_number,
            updated_at: new Date().toISOString()
          })
          .eq('id', tenant.id);
        
        if (updateError) {
          console.error(`❌ Failed to redistribute ${tenant.name}:`, updateError);
        } else {
          console.log(`✅ Moved ${tenant.name} from room 118 to room ${newRoom.room_number}`);
        }
      }
    }
    
    // 8. Summary
    console.log('\n📊 RESTORATION SUMMARY:');
    console.log('========================');
    console.log(`Inactive tenants found: ${inactiveTenants.length}`);
    console.log(`Tenants restored: ${restoredCount}`);
    console.log(`Tenants reassigned: ${reassignedCount}`);
    console.log(`Available rooms: ${availableRooms.length}`);
    
    console.log('\n✅ Tenant data restoration completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the restoration
restoreTenantData().then(() => {
  console.log('\n✅ Script completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 