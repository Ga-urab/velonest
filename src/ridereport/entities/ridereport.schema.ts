// entities/ridereport.schema.ts
import { Schema } from 'mongoose';

export const RideReportSchema = new Schema({
  id: String,
  status: String,
  orderCode: { type: String, index: true },
  driver: String,
  driver2: String,
  vehicle: String,
  vehicle2: String,
  pickupDate: Date,
  completionDate: Date,
  cancellationReason: String,
  address: String,
  serviceClass: String,
  mileageKm: String,
  fareInYangoPro: String,
  cash: String,
  card: String,
  corporatePayment: String,
  tip: String,
  promotion: String,
  bonuses: String,
  serviceFee: String,
  partnerFee: String,
  otherPayments: String,
  partnerRidePayments: String,
}, { timestamps: true });
