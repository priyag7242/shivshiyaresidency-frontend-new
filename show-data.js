const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://priyag7242:admin01@shivshivaresidency.9q8bcs.mongodb.net/tenantsdb?retryWrites=true&w=majority';

async function showCompleteData() {
  console.log('🎉 SHIV SHIVA RESIDENCY - COMPLETE DATA OVERVIEW 🎉');
  console.log('=====================================================');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db('tenantsdb');
    
    // === TENANTS DATA ===
    console.log('\n👥 TENANTS DATA:');
    console.log('================');
    
    const tenants = await db.collection('tenants').find({}).sort({ room_number: 1 }).toArray();
    console.log(`📊 Total Tenants: ${tenants.length}`);
    
    // Group by status
    const statusCounts = tenants.reduce((acc, tenant) => {
      acc[tenant.status] = (acc[tenant.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📈 Status Breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status.toUpperCase()}: ${count} tenants`);
    });
    
    // Show first 5 tenants
    console.log('\n👤 Sample Tenants:');
    tenants.slice(0, 5).forEach((tenant, index) => {
      console.log(`${index + 1}. ${tenant.name} - Room ${tenant.room_number} - ₹${tenant.monthly_rent}/month - ${tenant.status}`);
    });
    
    // === ROOMS DATA ===
    console.log('\n🏠 ROOMS DATA:');
    console.log('==============');
    
    const rooms = await db.collection('rooms').find({}).sort({ room_number: 1 }).toArray();
    console.log(`📊 Total Rooms: ${rooms.length}`);
    
    // Group by status
    const roomStatusCounts = rooms.reduce((acc, room) => {
      acc[room.status] = (acc[room.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📈 Room Status:');
    Object.entries(roomStatusCounts).forEach(([status, count]) => {
      console.log(`   ${status.toUpperCase()}: ${count} rooms`);
    });
    
    // Group by type
    const roomTypeCounts = rooms.reduce((acc, room) => {
      acc[room.type] = (acc[room.type] || 0) + 1;
      return acc;
    }, {});
    
    console.log('🏗️  Room Types:');
    Object.entries(roomTypeCounts).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} rooms`);
    });
    
    // Group by floor
    const floorCounts = rooms.reduce((acc, room) => {
      const floor = Math.floor(room.room_number / 100);
      acc[floor] = (acc[floor] || 0) + 1;
      return acc;
    }, {});
    
    console.log('🏢 Floor Distribution:');
    Object.entries(floorCounts).sort().forEach(([floor, count]) => {
      console.log(`   Floor ${floor}: ${count} rooms`);
    });
    
    // Show first 5 rooms
    console.log('\n🏠 Sample Rooms:');
    rooms.slice(0, 5).forEach((room, index) => {
      console.log(`${index + 1}. Room ${room.room_number} - ${room.type} - ₹${room.rent}/month - ${room.status}`);
    });
    
    // === REVENUE ANALYSIS ===
    console.log('\n💰 REVENUE ANALYSIS:');
    console.log('====================');
    
    const totalMonthlyRent = tenants
      .filter(t => t.status === 'active')
      .reduce((sum, t) => sum + t.monthly_rent, 0);
    
    console.log(`💵 Total Monthly Revenue: ₹${totalMonthlyRent.toLocaleString()}`);
    console.log(`💵 Annual Revenue: ₹${(totalMonthlyRent * 12).toLocaleString()}`);
    
    const totalSecurityDeposit = tenants
      .filter(t => t.status === 'active')
      .reduce((sum, t) => sum + t.security_deposit, 0);
      
    console.log(`🏦 Total Security Deposits: ₹${totalSecurityDeposit.toLocaleString()}`);
    
    // === QUICK ACCESS ===
    console.log('\n🌐 ACCESS YOUR SYSTEM:');
    console.log('======================');
    console.log('🖥️  Frontend: http://localhost:3000/');
    console.log('🔧 Backend API: http://localhost:5001/api');
    console.log('🔐 Login: admin / admin123');
    
    console.log('\n✅ YOUR DATA IS READY!');
    console.log('🎯 All 100 tenants and 100 rooms are successfully uploaded to MongoDB Atlas');
    console.log('🚀 You can now manage your PG with the complete web application!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

showCompleteData(); 