import express from 'express';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Case from '../models/Case.js';
import CommunityFundRequest from '../models/CommunityFundRequest.js';
import PlatformStats from '../models/PlatformStats.js';
import { authMiddleware, loadUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware, loadUser, requireAdmin);

router.get('/summary', async (req, res, next) => {
  try {
    const [users, volunteersPending, casesPending, fundReqPending, stats, txSum] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ volunteerStatus: 'pending', role: 'volunteer' }),
      Case.countDocuments({ status: 'pending_approval' }),
      CommunityFundRequest.countDocuments({ status: 'pending' }),
      PlatformStats.findOne({ key: 'global' }),
      Transaction.aggregate([
        { $match: { type: { $in: ['wallet_topup', 'donate_case', 'donate_community'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);
    res.json({
      users,
      volunteersPending,
      casesPending,
      fundRequestsPending: fundReqPending,
      pool: stats?.totalCommunityPool ?? 0,
      totalTrackedDonations: txSum[0]?.total ?? 0,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const { q, role } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { email: new RegExp(String(q), 'i') },
        { name: new RegExp(String(q), 'i') },
      ];
    }
    if (role) filter.role = role;
    const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).limit(500);
    res.json(users);
  } catch (e) {
    next(e);
  }
});

router.patch('/users/:id', async (req, res, next) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: 'Not found' });
    if (req.body.role && ['user', 'volunteer', 'admin'].includes(req.body.role)) u.role = req.body.role;
    if (req.body.volunteerStatus) u.volunteerStatus = req.body.volunteerStatus;
    await u.save();
    const out = u.toObject();
    delete out.passwordHash;
    res.json(out);
  } catch (e) {
    next(e);
  }
});

export default router;
