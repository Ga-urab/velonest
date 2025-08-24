// schemas/driver.schema.ts
import { Schema } from 'mongoose';

export const DriverSchema = new Schema({
  driverId: { type: String, unique: true, index: true },
  fullName: String,
  phoneNumber: { type: String, index: true },
  workshop: { type: Schema.Types.ObjectId, ref: 'Workshop', index: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  vehicle: {
    type: { type: String, enum: ['bike', 'taxi'], required: true },
    plateNumber: { type: String, unique: true, index: true },
    model: String,
    color: String,
  },
  createdAt: { type: Date, default: Date.now },
});
