import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActContractorsService } from './act-contractors.service';
import { ActContractorsController } from './act-contractors.controller';
import { ActContractorSchema } from './dtos/act-contractors.schema';
import { ContractorsModule } from 'src/contractors/contractors.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'ActContractor', schema: ActContractorSchema }]), ContractorsModule,
  ],
  controllers: [ActContractorsController],
  providers: [ActContractorsService],
})
export class ActContractorsModule {}
