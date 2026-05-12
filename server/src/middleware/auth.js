import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '14d' });
}

export function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  const token = h?.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export async function loadUser(req, res, next) {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
}

/** Approved volunteer or admin */
export function requireVolunteer(req, res, next) {
  const ok =
    req.user?.role === 'admin' ||
    (req.user?.role === 'volunteer' && req.user?.volunteerStatus === 'approved');
  if (!ok) return res.status(403).json({ message: 'Approved volunteer access required' });
  next();
}
