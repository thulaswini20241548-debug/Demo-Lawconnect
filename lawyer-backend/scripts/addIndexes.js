const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function addIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Connected to MongoDB');
    
    // Get Lawyer collection
    const db = mongoose.connection.db;
    const lawyers = db.collection('lawyers');
    
    // Create indexes for faster queries
    await lawyers.createIndex({ email: 1 }, { unique: true });
    await lawyers.createIndex({ barCouncilId: 1 }, { unique: true });
    await lawyers.createIndex({ licenseNumber: 1 }, { unique: true });
    await lawyers.createIndex({ verificationStatus: 1 });
    await lawyers.createIndex({ specializations: 1 });
    await lawyers.createIndex({ district: 1 });
    await lawyers.createIndex({ city: 1 });
    await lawyers.createIndex({ averageRating: -1 });
    await lawyers.createIndex({ consultationFee: 1 });
    
    console.log('✅ All indexes created successfully');
    
    // List all indexes to verify
    const indexes = await lawyers.indexes();
    console.log('\nCurrent indexes:');
    indexes.forEach(index => {
      console.log('-', JSON.stringify(index.key));
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  }
}

addIndexes();