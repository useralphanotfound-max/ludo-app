import express from 'express';
import jwt from 'jsonwebtoken';
import { registerUser, loginUser, loginAdmin } from '../controllers/authController.js';
import {
  getDashboardMetrics,
  getUsers,
  adjustUserWallet,
  updateUserStatus,
  getWithdrawals,
  processWithdrawal,
  getDisputes,
  resolveDispute,
  getGameSettings,
  updateGameSettings,
  getAuditLogs
} from '../controllers/adminController.js';

import {
  getMobileDashboard,
  getUserProfile,
  getWalletBalance,
  initiateDeposit,
  initiateWithdrawal,
  getAvailableRooms,
  createRoom,
  checkAppVersion
} from '../controllers/mobileController.js';

const router = express.Router();

// Middleware: Authenticate User or Admin JWT Token
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: false, message: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ status: false, message: 'Invalid or expired token' });
  }
};

// Middleware: Require Superadmin Role
const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
    return res.status(403).json({ status: false, message: 'Superadmin privileges required' });
  }
  next();
};

// -------------------------------------------------------------
// MOBILE APP API ENDPOINTS (Base URL: http://localhost:3000/api/)
// -------------------------------------------------------------
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);

router.get('/dashboard', getMobileDashboard);
router.get('/user/profile', authenticate, getUserProfile);
router.get('/wallet', authenticate, getWalletBalance);
router.post('/wallet/deposit/initiate', authenticate, initiateDeposit);
router.post('/wallet/withdraw/initiate', authenticate, initiateWithdrawal);
router.get('/rooms', getAvailableRooms);
router.post('/rooms', authenticate, createRoom);
router.get('/cms/version-check', checkAppVersion);

// -------------------------------------------------------------
// SUPERADMIN API ENDPOINTS (Base URL: http://localhost:3000/api/admin/)
// -------------------------------------------------------------
router.post('/admin/login', loginAdmin);

router.get('/admin/dashboard', authenticate, requireAdmin, getDashboardMetrics);
router.get('/admin/users', authenticate, requireAdmin, getUsers);
router.post('/admin/users/:id/wallet-adjust', authenticate, requireAdmin, adjustUserWallet);
router.patch('/admin/users/:id/status', authenticate, requireAdmin, updateUserStatus);

router.get('/admin/withdrawals', authenticate, requireAdmin, getWithdrawals);
router.post('/admin/withdrawals/:id/process', authenticate, requireAdmin, processWithdrawal);

router.get('/admin/disputes', authenticate, requireAdmin, getDisputes);
router.post('/admin/disputes/:id/resolve', authenticate, requireAdmin, resolveDispute);

router.get('/admin/settings', authenticate, requireAdmin, getGameSettings);
router.put('/admin/settings', authenticate, requireAdmin, updateGameSettings);

router.get('/admin/audit-logs', authenticate, requireAdmin, getAuditLogs);

export default router;
