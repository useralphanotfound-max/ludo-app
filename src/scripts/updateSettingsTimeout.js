import mongoose from 'mongoose';
import { connectDB } from '../lib/db.js';

async function run() {
  await connectDB();
  const db = mongoose.connection.db;
  const col = db.collection('gamesettings');

  const existing = await col.find({}).toArray();
  console.log('Existing settings count:', existing.length);
  for (const doc of existing) {
    console.log('Doc:', doc.key, 'roomTimeoutSeconds:', doc.roomTimeoutSeconds);
  }

  const res = await col.updateMany({}, {
    $set: {
      roomTimeoutSeconds: 180,
      adminUpiId: 'royalludo@upi',
      adminUpiPayeeName: 'Royal Ludo Gaming'
    }
  }, { upsert: true });

  console.log('Updated matched:', res.matchedCount, 'modified:', res.modifiedCount, 'upserted:', res.upsertedCount);

  const after = await col.find({}).toArray();
  for (const doc of after) {
    console.log('After update:', doc.key, 'roomTimeoutSeconds:', doc.roomTimeoutSeconds);
  }

  await mongoose.disconnect();
  console.log('Successfully updated settings to 180s.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
