// transactions.schema.ts
import { Schema } from 'mongoose';

export const TransactionSchema = new Schema({
  date: Date,
  driverId: { type: String, required: true },
  driver: String,
  categoryId: String,
  category: String,
  amount: String,
  document: String,
  initiatedBy: String,
  comment: String,
});
