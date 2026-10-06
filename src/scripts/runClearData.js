import mongoose from 'mongoose';
import dns from 'dns';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

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

async function wipeDatabaseData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    const resolved = await resolveMongodbSrv(mongodbUri);
    await mongoose.connect(resolved, { serverSelectionTimeoutMS: 15000, connectTimeoutMS: 15000 });
    console.log('✅ Connected to MongoDB!');

    const db = mongoose.connection.db;

    const collectionsToWipe = [
      'users',
      'wallets',
      'deposits',
      'withdrawalrequests',
      'transactions',
      'rooms',
      'matches',
      'matchresults',
      'disputes',
      'chatmessages',
      'tasks',
      'scratchcards',
      'supporttickets',
      'securityalerts',
      'loginhistories',
      'adminauditlogs'
    ];

    for (const collName of collectionsToWipe) {
      try {
        const res = await db.collection(collName).deleteMany({});
        console.log(`🧹 Wiped collection '${collName}': ${res.deletedCount} records deleted.`);
      } catch (err) {
        console.log(`ℹ️ Collection '${collName}' skipped: ${err.message}`);
      }
    }

    // Seed default Superadmin for Admin Console login
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Admin@1234', salt);

    await db.collection('users').insertOne({
      username: 'superadmin',
      mobile: '9999999999',
      passwordHash,
      rawPassword: 'Admin@1234',
      role: 'SUPERADMIN',
      status: 'ACTIVE',
      referralCode: 'ADMIN01',
      avatarId: 'av1',
      avatarUrl: 'https://cdn.royalludo.com/avatars/av1.png',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('👑 Re-seeded Master SuperAdmin account: mobile="9999999999", username="superadmin", password="Admin@1234"');

    // Ensure GameSettings exists
    const existingSettings = await db.collection('gamesettings').findOne({ key: 'global_settings' });
    if (!existingSettings) {
      await db.collection('gamesettings').insertOne({
        key: 'global_settings',
        roomTimeoutSeconds: 45,
        useDefaultOtp: true,
        defaultOtpCode: '1234',
        otpLength: 4,
        adminUpiId: 'royalludo@upi',
        adminUpiQrImageUrl: 'https://cdn.royalludo.com/qr/admin_upi_qr.png',
        depositTimerMinutes: 10,
        platformCommissionPct: 10,
        minDepositRs: 50,
        maxDepositRs: 50000,
        minWithdrawRs: 100,
        maxWithdrawRs: 25000,
        referralBonusRs: 50,
        maintenanceMode: false,
        isLeaderboardEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('⚙️ Initialized default Global Game Settings.');
    }

    console.log('✨ ALL DATABASE TEST/MOCK DATA HAS BEEN COMPLETELY REMOVED!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Wipe failed:', err.message);
    process.exit(1);
  }
}

wipeDatabaseData();
