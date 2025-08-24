// schemas/workshop.schema.ts
import { Schema } from 'mongoose';

export const WorkshopSchema = new Schema({
  workshopId: { type: String, unique: true, index: true },
  scout: { type: Schema.Types.ObjectId, ref: 'Scout', index: true },
  name: String,
  location: String,
  drivers: [{ type: Schema.Types.ObjectId, ref: 'Driver' }],
  qrCodeUrl: String,   // new field to store QR code image link or data URI
  createdAt: { type: Date, default: Date.now },
});
