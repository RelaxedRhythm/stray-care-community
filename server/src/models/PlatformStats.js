import mongoose from 'mongoose';

const platformStatsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'global' },
    totalCommunityPool: { type: Number, default: 0, min: 0 },
    totalCasesRaised: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('PlatformStats', platformStatsSchema);
