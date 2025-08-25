// attendance.schema.ts
import { Schema } from 'mongoose';

export const AttendanceSchema = new Schema({
  name: { type: String, required: true },
  checkIn: { type: Date },
  checkOut: { type: Date },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
});

// Create geospatial index
AttendanceSchema.index({ location: '2dsphere' });
