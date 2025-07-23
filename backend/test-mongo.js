const { MongoClient } = require('mongodb');

// MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://priyag7242:admin01@shivshivaresidency.9q8bcs.mongodb.net/?retryWrites=true&w=majority';

async function testConnection() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // List all databases
    const adminDb = client.db().admin();
    const dbList = await adminDb.listDatabases();
    console.log('🗄️  All databases:', dbList.databases.map(db => `${db.name} (${db.sizeOnDisk} bytes)`));
    
    // Check the tenantsdb database specifically (where the data likely is)
    console.log(`\n📖 Checking database: tenantsdb`);
    const db = client.db('tenantsdb');
    
    const collections = await db.listCollections().toArray();
    console.log(`📋 Collections in tenantsdb:`, collections.map(c => c.name));
    
    // Check each collection for tenant-like data
    for (const collection of collections) {
      const coll = db.collection(collection.name);
      const count = await coll.countDocuments();
      console.log(`📊 Documents in '${collection.name}': ${count}`);
      
      if (count > 0) {
        // Get first document to see structure
        const sample = await coll.findOne({});
        console.log(`🔍 Sample document from '${collection.name}':`, Object.keys(sample));
        
        // If it looks like tenant data
        if (sample.name && sample.room_number) {
          console.log(`👤 Sample tenant: ${sample.name} - Room ${sample.room_number}`);
          
          // Get a few more samples
          const sampleTenants = await coll.find({}).limit(5).toArray();
          console.log('👥 First 5 tenants:');
          sampleTenants.forEach((tenant, index) => {
            console.log(`${index + 1}. ${tenant.name} - Room ${tenant.room_number} - Mobile: ${tenant.mobile}`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

testConnection(); 