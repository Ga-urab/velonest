import { Schema } from 'mongoose';

export const DriverSchema = new Schema({
  fullName: String,
  phoneNumber: { type: String, index: true },
  workshop: { type: Schema.Types.ObjectId, ref: 'Workshop', index: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  vehicle: {
    type: { type: String, enum: ['bike', 'taxi'], required: true },
    condition: { type: String, enum: ['new', 'old'], required: true },
  },
  createdAt: { type: Date, default: Date.now },
});
