// schemas/scout.schema.ts
import { Schema } from 'mongoose';

export const ScoutSchema = new Schema({
  scoutId: { type: String, unique: true, index: true },
  fullName: String,
  phoneNumber: { type: String, index: true },
  email: String,
  workshops: [{ type: Schema.Types.ObjectId, ref: 'Workshop' }],
  createdAt: { type: Date, default: Date.now },
});
