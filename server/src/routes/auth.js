import bcrypt from 'bcryptjs';
import express from 'express';
import User from '../models/User.js';
import { signToken, authMiddleware, loadUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password || !name) return res.status(400).json({ message: 'Missing fields' });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
    const anyAdmin = await User.findOne({ role: 'admin' });
    const count = await User.countDocuments();
    const role =
      !anyAdmin && adminEmail && email.toLowerCase() === adminEmail
        ? 'admin'
        : count === 0
          ? 'admin'
          : 'user';
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name,
      phone: phone || '',
      role,
    });
    const token = signToken(user._id);
    const u = user.toObject();
    delete u.passwordHash;
    res.status(201).json({ token, user: u });
  } catch (e) {
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = signToken(user._id);
    const u = user.toObject();
    delete u.passwordHash;
    res.json({ token, user: u });
  } catch (e) {
    next(e);
  }
});

router.get('/me', authMiddleware, loadUser, (req, res) => {
  res.json(req.user);
});

export default router;
