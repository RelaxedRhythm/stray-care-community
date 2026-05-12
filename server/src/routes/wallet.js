import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Case from '../models/Case.js';
import PlatformStats from '../models/PlatformStats.js';
import { authMiddleware, loadUser } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware, loadUser);

router.get('/balance', async (req, res, next) => {
  try {
    const full = await User.findById(req.user._id).select('walletBalance');
    res.json({ balance: full.walletBalance });
  } catch (e) {
    next(e);
  }
});

router.get('/transactions', async (req, res, next) => {
  try {
    const list = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(200);
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.post('/donate-case', async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { caseId, amount } = req.body;
    const amt = Number(amount);
    if (!caseId || !amt || amt < 1) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Invalid amount or case' });
    }
    const c = await Case.findById(caseId).session(session);
    if (!c || c.status !== 'open' || c.raisedFunds >= c.requiredFunds) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Case not accepting donations' });
    }
    const user = await User.findById(req.user._id).session(session);
    if (user.walletBalance < amt) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }
    const remaining = Math.max(0, c.requiredFunds - c.raisedFunds);
    const apply = Math.min(amt, remaining || amt);
    user.walletBalance -= apply;
    c.raisedFunds += apply;
    if (c.raisedFunds >= c.requiredFunds) c.status = 'funded';
    await user.save({ session });
    await c.save({ session });
    let stats = await PlatformStats.findOne({ key: 'global' }).session(session);
    if (!stats) {
      const created = await PlatformStats.create(
        [{ key: 'global', totalCommunityPool: 0, totalCasesRaised: 0 }],
        { session }
      );
      stats = created[0];
    }
    stats.totalCasesRaised += apply;
    await stats.save({ session });
    await Transaction.create(
      [
        {
          userId: user._id,
          type: 'donate_case',
          amount: apply,
          caseId: c._id,
          description: `Donation to case: ${c.title}`,
        },
      ],
      { session }
    );
    await session.commitTransaction();
    res.json({ ok: true, donated: apply, case: c });
  } catch (e) {
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
});

router.post('/donate-community', async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { amount } = req.body;
    const amt = Number(amount);
    if (!amt || amt < 1) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Invalid amount' });
    }
    const user = await User.findById(req.user._id).session(session);
    if (user.walletBalance < amt) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }
    user.walletBalance -= amt;
    await user.save({ session });
    let stats = await PlatformStats.findOne({ key: 'global' }).session(session);
    if (!stats) {
      const created = await PlatformStats.create(
        [{ key: 'global', totalCommunityPool: 0, totalCasesRaised: 0 }],
        { session }
      );
      stats = created[0];
    }
    stats.totalCommunityPool += amt;
    await stats.save({ session });
    await Transaction.create(
      [
        {
          userId: user._id,
          type: 'donate_community',
          amount: amt,
          description: 'Donation to community fund',
        },
      ],
      { session }
    );
    await session.commitTransaction();
    res.json({ ok: true, donated: amt, pool: stats.totalCommunityPool });
  } catch (e) {
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
});

export default router;
