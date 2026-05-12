import express from 'express';
import Transaction from '../models/Transaction.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const list = await Transaction.find({ public: true })
      .sort({ createdAt: -1 })
      .populate('userId', 'name')
      .populate('caseId', 'title')
      .limit(300)
      .select('-razorpayOrderId -razorpayPaymentId');
    res.json(list);
  } catch (e) {
    next(e);
  }
});

export default router;
