import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { authMiddleware, loadUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware, loadUser);

router.patch('/profile', async (req, res, next) => {
  try {
    const { name, phone, avatarUrl } = req.body;
    if (name) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    if (avatarUrl !== undefined) req.user.avatarUrl = avatarUrl;
    await req.user.save();
    const u = req.user.toObject();
    delete u.passwordHash;
    res.json(u);
  } catch (e) {
    next(e);
  }
});

router.post('/change-password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const full = await User.findById(req.user._id);
    if (!full || !(await bcrypt.compare(currentPassword || '', full.passwordHash))) {
      return res.status(400).json({ message: 'Current password incorrect' });
    }
    full.passwordHash = await bcrypt.hash(newPassword || 'x', 10);
    await full.save();
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.get('/donations', async (req, res, next) => {
  try {
    const txs = await Transaction.find({
      userId: req.user._id,
      type: { $in: ['donate_case', 'donate_community'] },
    })
      .sort({ createdAt: -1 })
      .populate('caseId', 'title status')
      .limit(200);
    res.json(txs);
  } catch (e) {
    next(e);
  }
});

export default router;
