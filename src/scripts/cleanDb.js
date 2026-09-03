import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ludo-app';

async function cleanDatabase() {
  console.log('🔄 Connecting to MongoDB for Database Cleanup...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB:', MONGODB_URI);

    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      const name = collection.collectionName;
      if (!name.startsWith('system.')) {
        await collection.deleteMany({});
        console.log(`🧹 Cleaned collection: ${name}`);
      }
    }

    console.log('✨ DATABASE CLEANUP COMPLETE! All collections are 100% empty.');
  } catch (error) {
    console.error('❌ Database Cleanup Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  }
}

cleanDatabase();
