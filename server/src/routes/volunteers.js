import express from 'express';
import User from '../models/User.js';
import { authMiddleware, loadUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/apply', authMiddleware, loadUser, async (req, res, next) => {
  try {
    if (req.user.role === 'admin') return res.status(400).json({ message: 'Admins use admin tools' });
    if (req.user.role === 'volunteer' && req.user.volunteerStatus === 'approved') {
      return res.status(400).json({ message: 'Already an approved volunteer' });
    }
    const { message } = req.body;
    req.user.role = 'volunteer';
    req.user.volunteerStatus = 'pending';
    req.user.volunteerNote = message || '';
    await req.user.save();
    res.json(req.user);
  } catch (e) {
    next(e);
  }
});

router.get('/pending', authMiddleware, loadUser, requireAdmin, async (req, res, next) => {
  try {
    const list = await User.find({ volunteerStatus: 'pending', role: 'volunteer' }).select('-passwordHash');
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/review', authMiddleware, loadUser, requireAdmin, async (req, res, next) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: 'Not found' });
    const { action } = req.body;
    if (action === 'approve') u.volunteerStatus = 'approved';
    else if (action === 'reject') {
      u.volunteerStatus = 'rejected';
      u.role = 'user';
    }
    await u.save();
    const out = u.toObject();
    delete out.passwordHash;
    res.json(out);
  } catch (e) {
    next(e);
  }
});

export default router;
