import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ludo-app';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  role: { type: String, enum: ['USER', 'ADMIN', 'SUPERADMIN'], default: 'USER' },
  status: { type: String, default: 'ACTIVE' },
  kycStatus: { type: String, default: 'VERIFIED' },
  riskScore: { type: String, default: 'LOW' }
}, { timestamps: true });

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  depositBalance: { type: Number, default: 0 },
  winningBalance: { type: Number, default: 0 },
  bonusBalance: { type: Number, default: 0 },
  lockedBalance: { type: Number, default: 0 }
}, { timestamps: true });

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  previousBalance: { type: Number, default: 0 },
  newBalance: { type: Number, default: 0 },
  status: { type: String, default: 'SUCCESS' },
  referenceId: { type: String }
}, { timestamps: true });

const roomSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  roomCode: { type: String, required: true },
  entryFee: { type: Number, required: true },
  status: { type: String, default: 'IN_PROGRESS' },
  joinedPlayers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Wallet = mongoose.models.Wallet || mongoose.model('Wallet', walletSchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);

async function seedData() {
  console.log('🌱 Connecting to MongoDB to Seed Fresh Users & Data...');
  try {
    await mongoose.connect(MONGODB_URI);

    // Create Super Admin User
    await User.create({
      username: 'admin@royalludo.com',
      mobileNumber: '9999999999',
      role: 'SUPERADMIN',
      status: 'ACTIVE'
    });

    // Create Test Players
    const player1 = await User.create({ username: 'kingplayer', mobileNumber: '9876543210', role: 'USER', status: 'ACTIVE', kycStatus: 'VERIFIED', riskScore: 'LOW' });
    const player2 = await User.create({ username: 'ludomaster', mobileNumber: '9876543211', role: 'USER', status: 'ACTIVE', kycStatus: 'VERIFIED', riskScore: 'LOW' });
    const player3 = await User.create({ username: 'priya_nair', mobileNumber: '9876543212', role: 'USER', status: 'ACTIVE', kycStatus: 'VERIFIED', riskScore: 'LOW' });
    const player4 = await User.create({ username: 'rahul_kumar', mobileNumber: '9876543213', role: 'USER', status: 'ACTIVE', kycStatus: 'PENDING', riskScore: 'MEDIUM' });

    console.log('👥 Created 5 Users (1 Superadmin + 4 Players)');

    // Create Wallets
    await Wallet.create({ userId: player1._id, depositBalance: 250000, winningBalance: 500000, bonusBalance: 5000, lockedBalance: 0 });
    await Wallet.create({ userId: player2._id, depositBalance: 100000, winningBalance: 300000, bonusBalance: 2000, lockedBalance: 0 });
    await Wallet.create({ userId: player3._id, depositBalance: 500000, winningBalance: 150000, bonusBalance: 10000, lockedBalance: 0 });
    await Wallet.create({ userId: player4._id, depositBalance: 50000, winningBalance: 0, bonusBalance: 1000, lockedBalance: 0 });

    console.log('💳 Created Wallets with balances');

    // Create Transactions
    await Transaction.create({ userId: player1._id, type: 'DEPOSIT', amount: 250000, previousBalance: 0, newBalance: 250000, status: 'SUCCESS', referenceId: 'TXN-90101' });
    await Transaction.create({ userId: player1._id, type: 'MATCH_WIN', amount: 90000, previousBalance: 250000, newBalance: 340000, status: 'SUCCESS', referenceId: 'TXN-90142' });
    await Transaction.create({ userId: player2._id, type: 'DEPOSIT', amount: 100000, previousBalance: 0, newBalance: 100000, status: 'SUCCESS', referenceId: 'TXN-88210' });

    console.log('💲 Created Financial Transactions');

    // Create Live Room
    await Room.create({
      creatorId: player1._id,
      roomCode: 'ROOM-4892',
      entryFee: 50000,
      status: 'IN_PROGRESS',
      joinedPlayers: [player1._id, player2._id]
    });

    console.log('🎮 Created Live Room MATCH #ROOM-4892');
    console.log('✨ SEED COMPLETE! Fresh database ready for testing.');
  } catch (error) {
    console.error('❌ Seeding Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedData();
