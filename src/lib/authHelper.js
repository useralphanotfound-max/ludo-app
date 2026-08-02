import jwt from 'jsonwebtoken';
import { User } from '@/lib/models/User';

export async function getAuthUser(req) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'royalludosecretkey123_superadmin_auth_9988');
      if (decoded && decoded.id) {
        const user = await User.findById(decoded.id);
        if (user) return user;
      }
    }
  } catch (e) {
    // Fail silently to allow fallback to mock/first user
  }
  return null;
}
