import express from 'express';
import mongoose from 'mongoose';
import CommunityFundRequest from '../models/CommunityFundRequest.js';
import PlatformStats from '../models/PlatformStats.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { authMiddleware, loadUser, requireVolunteer, requireAdmin } from '../middleware/auth.js';
import { upload, publicUploadPath } from '../middleware/upload.js';

const router = express.Router();

async function getStats() {
  let s = await PlatformStats.findOne({ key: 'global' });
  if (!s) s = await PlatformStats.create({ key: 'global', totalCommunityPool: 0, totalCasesRaised: 0 });
  return s;
}

router.get('/pool', async (req, res, next) => {
  try {
    const s = await getStats();
    res.json({ totalCommunityPool: s.totalCommunityPool, totalCasesRaised: s.totalCasesRaised });
  } catch (e) {
    next(e);
  }
});

router.post('/requests', authMiddleware, loadUser, requireVolunteer, upload.array('proof', 6), async (req, res, next) => {
  try {
    const { category, amount, narrative } = req.body;
    const amt = Number(amount);
    if (!category || !amt || !narrative) return res.status(400).json({ message: 'Missing fields' });
    const proofUrls = (req.files || []).map((f) => publicUploadPath(f.filename));
    const r = await CommunityFundRequest.create({
      volunteerId: req.user._id,
      category,
      amount: amt,
      narrative,
      proofUrls,
    });
    res.status(201).json(r);
  } catch (e) {
    next(e);
  }
});

router.get('/requests/mine', authMiddleware, loadUser, requireVolunteer, async (req, res, next) => {
  try {
    const list = await CommunityFundRequest.find({ volunteerId: req.user._id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.get('/requests/pending', authMiddleware, loadUser, requireAdmin, async (req, res, next) => {
  try {
    const list = await CommunityFundRequest.find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .populate('volunteerId', 'name email');
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.patch('/requests/:id/review', authMiddleware, loadUser, requireAdmin, async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { action, adminNote } = req.body;
    const r = await CommunityFundRequest.findById(req.params.id).session(session);
    if (!r || r.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Invalid request' });
    }
    let stats = await PlatformStats.findOne({ key: 'global' }).session(session);
    if (!stats) stats = await PlatformStats.create([{ key: 'global', totalCommunityPool: 0, totalCasesRaised: 0 }], { session }).then((a) => a[0]);
    if (action === 'reject') {
      r.status = 'rejected';
      r.adminNote = adminNote || '';
      await r.save({ session });
      await session.commitTransaction();
      return res.json(r);
    }
    if (action !== 'approve') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Bad action' });
    }
    if (stats.totalCommunityPool < r.amount) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Insufficient community pool' });
    }
    stats.totalCommunityPool -= r.amount;
    await stats.save({ session });
    const vol = await User.findById(r.volunteerId).session(session);
    vol.walletBalance += r.amount;
    await vol.save({ session });
    r.status = 'paid';
    r.adminNote = adminNote || '';
    await r.save({ session });
    await Transaction.create(
      [
        {
          userId: vol._id,
          type: 'community_payout',
          amount: r.amount,
          fundRequestId: r._id,
          description: `Community fund payout (${r.category})`,
        },
      ],
      { session }
    );
    await session.commitTransaction();
    res.json(r);
  } catch (e) {
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
});

export default router;
