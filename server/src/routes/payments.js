import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { authMiddleware, loadUser } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware, loadUser);

function getRazorpay() {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret) return null;
  return new Razorpay({ key_id: id, key_secret: secret });
}

router.get('/config', (_, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID || '' });
});

router.post('/create-order', async (req, res, next) => {
  try {
    const rz = getRazorpay();
    if (!rz) return res.status(503).json({ message: 'Razorpay not configured' });
    const amountPaise = Math.round(Number(req.body.amount) * 100);
    if (!amountPaise || amountPaise < 100) return res.status(400).json({ message: 'Minimum ₹1' });
    const order = await rz.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `w_${req.user._id}_${Date.now()}`,
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (e) {
    next(e);
  }
});

router.post('/verify', async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return res.status(503).json({ message: 'Razorpay not configured' });
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    if (expected !== razorpay_signature) return res.status(400).json({ message: 'Invalid signature' });
    const dup = await Transaction.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (dup) return res.json({ ok: true, duplicate: true, balance: (await User.findById(req.user._id)).walletBalance });
    const rz = getRazorpay();
    const payment = await rz.payments.fetch(razorpay_payment_id);
    const amountRupees = Number(payment.amount) / 100;
    const user = await User.findById(req.user._id);
    user.walletBalance += amountRupees;
    await user.save();
    await Transaction.create({
      userId: user._id,
      type: 'wallet_topup',
      amount: amountRupees,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      description: 'Wallet top-up via Razorpay',
    });
    res.json({ ok: true, balance: user.walletBalance });
  } catch (e) {
    next(e);
  }
});

export default router;
