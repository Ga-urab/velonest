import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContractorsService } from './contractors.service';
import { ContractorsController } from './contractors.controller';

// Import your entity class
import { Contractor } from './entities/contractor.entity';

// Import Mongoose schema created manually
import { Schema } from 'mongoose';

const ContractorSchema = new Schema({
  leadId: String,
  contractorId: String,
  stage: String,
  fullName: String,
  phoneNumber: String,
  dateAdded: String,
  managerInCharge: String,
  task: String,
  balance: String,
  limit: String,
  partnershipTerms: String,
  source: String,
  vehicle: String,
  vehicleLicensePlateNumber: String,
  nextInteractionDate: String,
  hireType: String,
  status: String,
  comment: String,
  profession: String,
  tripsInTheService: String,
  payoutRules: String,
  details: String,
remarks: {
    type: [
      {
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        remarker: { type: String, required: true },
      },
    ],
    default: [],
  },
});

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Contractor.name, schema: ContractorSchema }]),
  ],
  controllers: [ContractorsController],
  providers: [ContractorsService],
   exports: [ContractorsService],
})
export class ContractorsModule {}
