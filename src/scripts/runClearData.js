import mongoose from 'mongoose';
import dns from 'dns';
import fs from 'fs';
import path from 'path';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

let mongodbUri = process.env.MONGODB_URI;

if (!mongodbUri) {
  try {
    const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf-8');
    const match = envContent.match(/MONGODB_URI=(.*)/);
    if (match) {
      mongodbUri = match[1].trim();
    }
  } catch (e) {}
}

if (!mongodbUri) {
  mongodbUri = 'mongodb+srv://royaluseralpha83993:royaluseralphapass83993@cluster0.xmyjibo.mongodb.net/royalludo?retryWrites=true&w=majority';
}

async function resolveMongodbSrv(uri) {
  if (!uri.startsWith('mongodb+srv://')) return uri;
  try {
    const urlMatch = uri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)?(.*)$/);
    if (!urlMatch) return uri;
    const [_, user, pass, host, db, query] = urlMatch;
    const resolver = new dns.promises.Resolver();
    resolver.setServers(['8.8.8.8', '1.1.1.1']);
    const addresses = await resolver.resolveSrv(`_mongodb._tcp.${host}`);
    if (!addresses || addresses.length === 0) return uri;
    const nodeAddresses = addresses.map(addr => `${addr.name}:${addr.port}`).join(',');
    const cleanQuery = query || '';
    const sslOpt = cleanQuery.includes('ssl=') ? '' : '&ssl=true';
    const authSrc = cleanQuery.includes('authSource=') ? '' : '&authSource=admin';
    const retryW = cleanQuery.includes('retryWrites=') ? '' : '&retryWrites=true';
    return `mongodb://${user}:${pass}@${nodeAddresses}/${db || ''}${cleanQuery}${sslOpt}${authSrc}${retryW}`;
  } catch (e) {
    return uri;
  }
}

async function wipeTestData() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    const resolved = await resolveMongodbSrv(mongodbUri);
    await mongoose.connect(resolved, { serverSelectionTimeoutMS: 15000, connectTimeoutMS: 15000 });
    console.log('Connected to MongoDB Atlas!');

    const db = mongoose.connection.db;

    const collectionsToClear = [
      'users',
      'wallets',
      'deposits',
      'withdrawalrequests',
      'transactions',
      'rooms',
      'matches',
      'disputes',
      'securityalerts',
      'loginhistories',
      'adminauditlogs'
    ];

    for (const collName of collectionsToClear) {
      try {
        if (collName === 'users') {
          const res = await db.collection('users').deleteMany({ role: 'USER' });
          console.log(`Cleared test users (role=USER): ${res.deletedCount} deleted.`);
        } else {
          const res = await db.collection(collName).deleteMany({});
          console.log(`Cleared collection ${collName}: ${res.deletedCount} deleted.`);
        }
      } catch (err) {
        console.log(`Note: Collection ${collName} not cleared: ${err.message}`);
      }
    }

    console.log('✅ TEST DATA CLEAR COMPLETE! Super Admin accounts and System Settings preserved.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Wipe failed:', err.message);
    process.exit(1);
  }
}

wipeTestData();
