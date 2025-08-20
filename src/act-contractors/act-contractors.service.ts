import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActContractor } from './entities/act-contractors.entity';
import { Readable } from 'stream';
import csv from 'csv-parser';
import { ContractorsService } from 'src/contractors/contractors.service';
import { RideReportService } from 'src/ridereport/ridereport.service';
@Injectable()
export class ActContractorsService {
  constructor(
@InjectModel('ActContractor') private readonly actcontractorModel: Model<ActContractor>,
    private readonly contractorsService: ContractorsService, // <-- inject here
        

  ) {}

  async uploadCSV(file: Express.Multer.File): Promise<any> {
    const parsedResults: any[] = [];

    return new Promise((resolve, reject) => {
      const stream = Readable.from(file.buffer);

      stream
        .pipe(csv({ separator: ';' }))
        .on('data', (data) => {
          parsedResults.push({
            leadId: data['Lead ID'],
            contractorId: data['Contractor ID'],
            fullName: data['Full name'],
            status: data['Status'],
            codeName: data['Code name'],
            phoneNumber: data['Phone number'],
            balance: data['Balance'],
            limit: data['Limit'],
            partnershipTerms: data['Partnership terms'],
            driversLicense: data["Driver's license"],
            vehicle: data['Vehicle'],
            vehicleLicensePlateNumber: data['Vehicle license plate number'],
            payoutRules: data['Payout rules'],
            dateOfLastTrip: data['Date of last trip'],
            hireType: data['Hire type'],
            startDate: data['Start date'],
            comment: data['Comment'],
            profession: data['Profession'],
            rating: data['Rating'],
            priority: data['Priority'],
            source: data['Source'],
            task: data['Task'],
            managerInCharge: data['Manager in charge'],
            nextInteractionDate: data['Next interaction date'],
            city: data['City'],
            completedTrips: data['Completed trips'],
            details: data['Details'],
          });
        })
        .on('end', async () => {
          try {
            const contractorIds = parsedResults.map((item) => item.contractorId);

            const existingContractors = await this.actcontractorModel.find(
              { contractorId: { $in: contractorIds } },
              { contractorId: 1 },
            );

            const existingIds = new Set(
              existingContractors.map((c) => c.contractorId),
            );

            const newContractors = parsedResults.filter(
              (c) => !existingIds.has(c.contractorId),
            );

            const existingContractorsToUpdate = parsedResults.filter(
              (c) => existingIds.has(c.contractorId),
            );

            // Insert new contractors
            if (newContractors.length > 0) {
              await this.actcontractorModel.insertMany(newContractors);
            }

            // Update existing contractors (only "status", like before)
            for (const contractor of existingContractorsToUpdate) {
              await this.actcontractorModel.updateOne(
                { contractorId: contractor.contractorId },
                { $set: { status: contractor.status } },
              );
            }
          const leadSyncResult = await this.syncLeadContractorsWithActive();

            resolve({
              message: 'CSV processed successfully',
              inserted: newContractors.length,
              updated: existingContractorsToUpdate.length,
            leadConverted: leadSyncResult.modifiedCount,

            });
          } catch (error) {
            reject({ message: 'Error processing CSV data', error });
          }
        })
        .on('error', (err) => reject(err));
    });
  }

  async findAll(): Promise<ActContractor[]> {
    return this.actcontractorModel.find().exec();
  }

// act-contractors.service.ts
private async syncLeadContractorsWithActive() {
  // pass the actcontractorModel if needed
  return this.contractorsService.bulkMarkConverted(this.actcontractorModel);
}


async findOne(contractorId: string): Promise<ActContractor> {
  const contractor = await this.actcontractorModel.findOne({ contractorId }).exec();
  if (!contractor) {
    throw new Error(`Contractor with ID ${contractorId} not found`);
  }
  return contractor;
}



}
