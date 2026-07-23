import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';
import { AdminAuditLog } from '../models/AdminAuditLog.js';
import { getClientIp } from '../utils/ipHelper.js';

const generateToken = (id, role, username) => {
  return jwt.sign({ id, role, username }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

// POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { username, mobile, password, referralCode } = req.body;

    if (!username || !mobile || !password) {
      return res.status(400).json({ status: false, message: 'Username, mobile, and password are required', errorCode: 'MALFORMED_BODY' });
    }

    const existingUser = await User.findOne({ $or: [{ mobile }, { username: username.toLowerCase() }] });
    if (existingUser) {
      if (existingUser.mobile === mobile) {
        return res.status(409).json({ status: false, message: 'Mobile number already exists', errorCode: 'MOBILE_ALREADY_EXISTS' });
      }
      return res.status(409).json({ status: false, message: 'Username already taken', errorCode: 'USERNAME_TAKEN' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userRefCode = 'RL' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const user = await User.create({
      username,
      mobile,
      passwordHash,
      referralCode: userRefCode,
      referredBy: referralCode || null,
      status: 'ACTIVE'
    });

    // Create wallet with default balances
    await Wallet.create({
      userId: user._id,
      depositBalance: 10000, // ₹100 welcome bonus in deposit
      bonusBalance: 5000     // ₹50 bonus
    });

    const token = generateToken(user._id, user.role, user.username);

    return res.status(201).json({
      status: true,
      message: 'Account created successfully',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          mobile: user.mobile,
          avatarUrl: user.avatarUrl,
          referralCode: user.referralCode
        }
      }
    });
  } catch (error) {
    console.error('[Register Error]', error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// POST /api/auth/login (Mobile App User Login)
export const loginUser = async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({ status: false, message: 'Mobile and password required' });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(401).json({ status: false, message: 'Invalid mobile or password', errorCode: 'INVALID_CREDENTIALS' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ status: false, message: 'Invalid mobile or password', errorCode: 'INVALID_CREDENTIALS' });
    }

    if (user.status === 'BANNED') {
      return res.status(403).json({ status: false, message: 'Account is banned by administrator', errorCode: 'ACCOUNT_BANNED' });
    }

    user.lastLoginAt = new Date();
    user.lastLoginIp = getClientIp(req);
    await user.save();

    const wallet = await Wallet.findOne({ userId: user._id });
    const token = generateToken(user._id, user.role, user.username);

    return res.json({
      status: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          mobile: user.mobile,
          avatarUrl: user.avatarUrl,
          role: user.role,
          wallet: {
            depositBalance: wallet ? wallet.depositBalance : 0,
            winningBalance: wallet ? wallet.winningBalance : 0,
            bonusBalance: wallet ? wallet.bonusBalance : 0,
            totalBalance: wallet ? (wallet.depositBalance + wallet.winningBalance + wallet.bonusBalance) : 0
          }
        }
      }
    });
  } catch (error) {
    console.error('[Login Error]', error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// POST /api/admin/login (Superadmin Panel Login with exact IP logging)
export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const clientIp = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'Unknown Browser';

    if (!username || !password) {
      return res.status(400).json({ status: false, message: 'Username/Email and password required' });
    }

    // Lookup user by username or mobile or admin role
    const user = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { mobile: username }
      ]
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      // Audit failed login attempt
      await AdminAuditLog.create({
        adminUsername: username,
        action: 'ADMIN_LOGIN',
        details: 'FAILED: Invalid admin username or non-admin user',
        ipAddress: clientIp,
        userAgent
      });
      return res.status(401).json({ status: false, message: 'Invalid admin credentials or unauthorized' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      // Audit failed login attempt
      await AdminAuditLog.create({
        adminId: user._id,
        adminUsername: user.username,
        action: 'ADMIN_LOGIN',
        details: 'FAILED: Password mismatch',
        ipAddress: clientIp,
        userAgent
      });
      return res.status(401).json({ status: false, message: 'Invalid admin credentials' });
    }

    user.lastLoginAt = new Date();
    user.lastLoginIp = clientIp;
    await user.save();

    // Audit SUCCESSFUL admin login
    await AdminAuditLog.create({
      adminId: user._id,
      adminUsername: user.username,
      action: 'ADMIN_LOGIN',
      details: `SUCCESSFUL Superadmin Login from IP: ${clientIp}`,
      ipAddress: clientIp,
      userAgent
    });

    const token = generateToken(user._id, user.role, user.username);

    return res.json({
      status: true,
      message: 'Superadmin authenticated successfully',
      data: {
        token,
        admin: {
          id: user._id,
          username: user.username,
          role: user.role,
          avatarUrl: user.avatarUrl,
          lastLoginIp: clientIp,
          lastLoginAt: user.lastLoginAt
        }
      }
    });
  } catch (error) {
    console.error('[Admin Login Error]', error);
    return res.status(500).json({ status: false, message: error.message });
  }
};
