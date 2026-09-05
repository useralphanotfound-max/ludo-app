import jwt from 'jsonwebtoken';
import { User } from '@/lib/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'royal-ludo-super-secret-jwt-key-2026';
const FALLBACK_SECRET = 'royalludosecretkey123_superadmin_auth_9988';

export async function getAuthUser(req) {
  try {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      let decoded = null;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (e) {
        try {
          decoded = jwt.verify(token, FALLBACK_SECRET);
        } catch (err) {
          decoded = null;
        }
      }
      
      const userId = decoded?.userId || decoded?.id;
      if (userId) {
        const user = await User.findById(userId);
        if (user) return user;
      }
    }
  } catch (e) {
    // Fail silently
  }
  return null;
}

