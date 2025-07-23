const axios = require('axios');

async function checkSystem() {
  console.log('🔍 Checking Shiv Shiva Residency System...\n');

  try {
    // Test backend health
    console.log('1. 📡 Testing backend health...');
    const healthResponse = await axios.get('http://localhost:5001/api/health', { timeout: 5000 });
    console.log('✅ Backend running:', healthResponse.data.message);

    // Test authentication endpoints
    console.log('\n2. 🔐 Testing authentication...');
    try {
      // Test login with admin credentials
      const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
        username: 'admin',
        password: 'admin123'
      }, { timeout: 5000 });
      
      if (loginResponse.data.token) {
        console.log('✅ Authentication working - Login successful');
        console.log('🎫 Token received:', loginResponse.data.token.substring(0, 20) + '...');
      } else {
        console.log('⚠️  Login response but no token');
      }
    } catch (authError) {
      console.log('⚠️  Auth endpoint issue:', authError.response?.status || authError.message);
    }

    // Test tenants API
    console.log('\n3. 👥 Testing tenants API...');
    const tenantsResponse = await axios.get('http://localhost:5001/api/tenants', { timeout: 10000 });
    const { count, source, message } = tenantsResponse.data;
    
    console.log(`📊 Tenant Count: ${count}`);
    console.log(`🔗 Data Source: ${source}`);
    console.log(`💬 Message: ${message}`);

    if (count === 100 && source === 'mongodb') {
      console.log('🎉 SUCCESS! All 100 tenants loaded from MongoDB Atlas!');
    } else if (count > 0) {
      console.log(`⚠️  Partial data loaded: ${count} tenants from ${source}`);
    } else {
      console.log('❌ No tenants found');
    }

    // Check for port conflicts
    console.log('\n4. 🌐 Checking frontend...');
    try {
      const frontendResponse = await axios.get('http://localhost:3007/', { timeout: 3000 });
      console.log('✅ Frontend accessible on port 3007');
    } catch (frontendError) {
      try {
        const frontendResponse = await axios.get('http://localhost:3008/', { timeout: 3000 });
        console.log('✅ Frontend accessible on port 3008');
      } catch (e) {
        console.log('⚠️  Frontend not accessible on common ports');
      }
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend is not running on port 5001');
      console.log('💡 Try: cd backend && npm run dev');
    } else {
      console.log('❌ Error:', error.message);
    }
  }

  console.log('\n📍 Expected URLs:');
  console.log('🖥️  Frontend: http://localhost:3007/ or http://localhost:3008/');
  console.log('🔧 Backend API: http://localhost:5001/api');
  console.log('🔐 Login: admin / admin123');
}

checkSystem(); 