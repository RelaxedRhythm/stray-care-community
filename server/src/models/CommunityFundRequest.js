import mongoose from 'mongoose';

const communityFundRequestSchema = new mongoose.Schema(
  {
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      enum: ['rescue', 'treatment', 'feeding', 'other'],
      required: true,
    },
    amount: { type: Number, required: true, min: 1 },
    narrative: { type: String, required: true },
    proofUrls: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid'],
      default: 'pending',
    },
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('CommunityFundRequest', communityFundRequestSchema);
