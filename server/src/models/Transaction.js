import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'wallet_topup',
        'donate_case',
        'donate_community',
        'community_payout',
        'community_refund',
      ],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
    fundRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityFundRequest' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    description: { type: String, default: '' },
    public: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', transactionSchema);
