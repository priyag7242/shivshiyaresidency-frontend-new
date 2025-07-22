// 🏠 Shiv Shiva Residency - Complete Data Import Script
// This script imports all tenant data to MongoDB Atlas for production

const mongoose = require('mongoose');

// Complete Tenant Data (64 tenants with electricity readings)
const completeTenantsData = [
  // Sample data structure - this will be expanded with your actual 64 tenants
  {
    id: "pradyum-303",
    name: "PRADYUM",
    mobile: "9761019937",
    room_number: "303",
    joining_date: "2024-05-01",
    monthly_rent: 8500,
    security_deposit: 9500,
    electricity_joining_reading: 900,
    last_electricity_reading: 950,
    status: 'active',
    created_date: "2025-07-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "suman-108",
    name: "SUMAN DAS",
    mobile: "8448949159",
    room_number: "108",
    joining_date: "2022-11-12",
    monthly_rent: 15900,
    security_deposit: 0,
    electricity_joining_reading: 2982,
    last_electricity_reading: 3050,
    status: 'active',
    created_date: "2025-07-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "anish-114",
    name: "ANISH KUMAR",
    mobile: "9546257643",
    room_number: "114",
    joining_date: "2025-01-07",
    monthly_rent: 16200,
    security_deposit: 16200,
    electricity_joining_reading: 2650,
    last_electricity_reading: 2720,
    status: 'active',
    created_date: "2025-07-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  }
  // Add your remaining 61 tenants here...
];

// Tenant Schema
const tenantSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  room_number: { type: String, required: true },
  joining_date: { type: String, required: true },
  monthly_rent: { type: Number, required: true },
  security_deposit: { type: Number, default: 0 },
  electricity_joining_reading: { type: Number, default: 0 },
  last_electricity_reading: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['active', 'adjust', 'inactive'], 
    default: 'active' 
  },
  created_date: { type: String, required: true },
  has_food: { type: Boolean, default: false },
  category: { 
    type: String, 
    enum: ['new', 'existing'], 
    default: 'existing' 
  },
  departure_date: { type: String, default: null },
  stay_duration: { type: String, default: null },
  notice_given: { type: Boolean, default: false },
  notice_date: { type: String, default: null },
  security_adjustment: { type: Number, default: 0 }
}, {
  timestamps: true
});

const Tenant = mongoose.model('Tenant', tenantSchema);

// Import function
async function importData() {
  try {
    // Connect to MongoDB Atlas
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shivshiva_residency';
    
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB successfully!');

    // Clear existing data
    console.log('🗑️ Clearing existing tenant data...');
    await Tenant.deleteMany({});
    console.log('✅ Existing data cleared!');

    // Insert complete tenant data
    console.log('📥 Importing complete tenant dataset...');
    const result = await Tenant.insertMany(completeTenantsData);
    
    console.log(`✅ Successfully imported ${result.length} tenants!`);
    console.log('📊 Tenant Summary:');
    console.log(`   - Total Tenants: ${result.length}`);
    console.log(`   - Active Tenants: ${result.filter(t => t.status === 'active').length}`);
    console.log(`   - With Food: ${result.filter(t => t.has_food).length}`);
    console.log(`   - Total Monthly Rent: ₹${result.reduce((sum, t) => sum + t.monthly_rent, 0).toLocaleString()}`);
    
    // Sample tenant data
    console.log('\n📋 Sample Imported Tenants:');
    result.slice(0, 3).forEach(tenant => {
      console.log(`   - ${tenant.name} (Room ${tenant.room_number}) - ₹${tenant.monthly_rent}/month`);
    });

    console.log('\n🎉 Data import completed successfully!');
    console.log('💡 Next steps:');
    console.log('   1. Deploy your backend to Railway');
    console.log('   2. Deploy your frontend to Vercel');
    console.log('   3. Generate bills using: POST /api/payments/bills/generate');
    console.log('   4. Test the WhatsApp bill feature');

  } catch (error) {
    console.error('❌ Error importing data:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your MongoDB Atlas connection string');
    console.log('   2. Ensure your IP is whitelisted in MongoDB Atlas');
    console.log('   3. Verify your database credentials');
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Usage instructions
if (require.main === module) {
  console.log('🏠 Shiv Shiva Residency - Data Import Script');
  console.log('===========================================\n');
  
  console.log('📝 Instructions:');
  console.log('1. Set your MongoDB Atlas connection string:');
  console.log('   export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/shivshiva_residency"');
  console.log('2. Run this script: node importCompleteData.js');
  console.log('3. Wait for import completion\n');
  
  // Check if MongoDB URI is provided
  if (!process.env.MONGODB_URI) {
    console.log('⚠️  Please set MONGODB_URI environment variable first!');
    console.log('   Example: export MONGODB_URI="your-atlas-connection-string"');
    process.exit(1);
  }
  
  importData();
}

module.exports = { importData, completeTenantsData, Tenant };

/* 
🚀 PRODUCTION DEPLOYMENT STEPS:

1. MongoDB Atlas Setup:
   - Create cluster at https://cloud.mongodb.com
   - Create database user
   - Get connection string
   - Replace <password> with actual password

2. Railway Backend:
   - Connect GitHub repo
   - Set environment variables (MONGODB_URI, JWT_SECRET, etc.)
   - Deploy backend

3. Vercel Frontend:
   - Connect GitHub repo
   - Set VITE_API_BASE_URL to Railway backend URL
   - Deploy frontend

4. Import Data:
   - Use the /api/tenants/import/complete endpoint
   - Or run this script with production MongoDB URI

5. Generate Bills:
   - POST /api/payments/bills/generate
   - Test WhatsApp bill sharing

6. Go Live! 🎉
   Your PG management system is now live with:
   ✅ Professional bills
   ✅ Auto-fetch phone numbers
   ✅ WhatsApp integration
   ✅ Complete tenant management
*/ 