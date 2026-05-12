import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    caption: { type: String, default: '' },
    kind: { type: String, enum: ['image', 'video'], default: 'image' },
  },
  { _id: true }
);

const caseUpdateSchema = new mongoose.Schema(
  {
    body: { type: String, required: true },
    media: [mediaSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const caseSchema = new mongoose.Schema(
  {
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: {
      address: { type: String, default: '' },
      lat: { type: Number },
      lng: { type: Number },
    },
    images: [{ type: String }],
    requiredFunds: { type: Number, required: true, min: 1 },
    raisedFunds: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['pending_approval', 'open', 'funded', 'completed', 'rejected'],
      default: 'pending_approval',
    },
    adminNote: { type: String, default: '' },
    updates: [caseUpdateSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Case', caseSchema);
