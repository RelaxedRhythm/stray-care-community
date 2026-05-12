import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    role: { type: String, enum: ['user', 'volunteer', 'admin'], default: 'user' },
    volunteerStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none',
    },
    volunteerNote: { type: String, default: '' },
    walletBalance: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
