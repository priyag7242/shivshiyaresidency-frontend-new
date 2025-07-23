const axios = require('axios');

async function testSetup() {
  console.log('🧪 Testing Shiv Shiva Residency Setup...\n');

  try {
    // Test backend health
    console.log('📡 Testing backend health...');
    const healthResponse = await axios.get('http://localhost:5001/api/health', { timeout: 5000 });
    console.log('✅ Backend is running:', healthResponse.data.message);

    // Test tenants API
    console.log('\n👥 Testing tenants API...');
    const tenantsResponse = await axios.get('http://localhost:5001/api/tenants', { timeout: 10000 });
    const { count, source, message } = tenantsResponse.data;
    
    console.log(`📊 Tenant Count: ${count}`);
    console.log(`🔗 Data Source: ${source}`);
    console.log(`💬 Message: ${message}`);

    if (count === 100 && source === 'mongodb') {
      console.log('\n🎉 SUCCESS! All 100 tenants loaded from MongoDB Atlas!');
      
      // Show some sample tenants
      const tenants = tenantsResponse.data.tenants;
      console.log('\n👥 Sample tenants:');
      tenants.slice(0, 5).forEach((tenant, index) => {
        console.log(`${index + 1}. ${tenant.name} - Room ${tenant.room_number} - Rent: ₹${tenant.monthly_rent}`);
      });

      // Test tenant stats
      console.log('\n📈 Testing tenant statistics...');
      try {
        const statsResponse = await axios.get('http://localhost:5001/api/tenants/stats', { timeout: 5000 });
        console.log('✅ Stats API working:', statsResponse.data);
      } catch (error) {
        console.log('⚠️  Stats API issue (normal - endpoint might not exist yet)');
      }

    } else if (count > 0 && source === 'memory') {
      console.log('\n⚠️  Using fallback data (in-memory storage)');
      console.log('💡 Check MongoDB connection in backend logs');
    } else {
      console.log('\n❌ No tenants found - check configuration');
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend is not running on port 5001');
      console.log('💡 Start backend with: cd backend && npm run dev');
    } else if (error.code === 'ENOTFOUND') {
      console.log('❌ Network connection issue');
    } else {
      console.log('❌ Error:', error.message);
    }
  }

  console.log('\n📍 Application URLs:');
  console.log('🖥️  Frontend: http://localhost:3005/ (or next available port)');
  console.log('🔧 Backend API: http://localhost:5001/api');
  console.log('📊 Health Check: http://localhost:5001/api/health');
}

testSetup(); 