import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateContractorDto } from './dto/create-contractor.dto';
import { UpdateContractorDto } from './dto/update-contractor.dto';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { Contractor } from './entities/contractor.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { AddRemarkDto } from './dto/add-remark.dto';


@Injectable()
export class ContractorsService {
    updateMany(arg0: { contractorId: { $in: string[]; }; stage: { $ne: string; }; }, arg1: { $set: { stage: string; }; }) {
        throw new Error('Method not implemented.');
    }
    constructor(
    @InjectModel(Contractor.name)
    private contractorModel: Model<Contractor>,
  ) {}

async uploadCSV(file: Express.Multer.File): Promise<any> {
  const parsedResults: any[] = [];

  return new Promise((resolve, reject) => {
    const stream = Readable.from(file.buffer);

    stream
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => {
        parsedResults.push({
          contractorId: data['Contractor ID'],
          leadId: data['Lead ID'],
          stage: data['Stage'],
          fullName: data['Full name'],
          phoneNumber: data['Phone number'],
          dateAdded: data['Date added'],
          managerInCharge: data['Manager in charge'],
          task: data['Task'],
          balance: data['Balance'],
          limit: data['Limit'],
          partnershipTerms: data['Partnership terms'],
          source: data['Source'],
          vehicle: data['Vehicle'],
          vehicleLicensePlateNumber: data['Vehicle license plate number'],
          nextInteractionDate: data['Next interaction date'],
          hireType: data['Hire type'],
          status: data['Status'],
          comment: data['Comment'],
          profession: data['Profession'],
          tripsInTheService: data['Trips in the service'],
          payoutRules: data['Payout rules'],
          details: data['Details'],
        });
      })
      .on('end', async () => {
        try {
          const contractorIds = parsedResults.map((item) => item.contractorId);

          const existingContractors = await this.contractorModel.find(
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

          // Insert new
          if (newContractors.length > 0) {
            await this.contractorModel.insertMany(newContractors);
          }

          // Update existing: only the 'stage' field
          for (const contractor of existingContractorsToUpdate) {
            await this.contractorModel.updateOne(
              { contractorId: contractor.contractorId },
              { $set: { stage: contractor.stage } },
            );
          }

          resolve({
            message: 'CSV processed successfully',
            inserted: newContractors.length,
            updated: existingContractorsToUpdate.length,
          });
        } catch (error) {
          reject({ message: 'Error processing CSV data', error });
        }
      })
      .on('error', (err) => reject(err));
  });
}

async addRemark(contractorId: string, dto: AddRemarkDto) {
  const contractor = await this.contractorModel.findOne({ contractorId });

  if (!contractor) {
    throw new NotFoundException(`Contractor with ID ${contractorId} not found`);
  }

  const remark = {
    text: dto.text,
    remarker: dto.remarker,
    timestamp: new Date(),
  };

  contractor.remarks = contractor.remarks || [];
  contractor.remarks.push(remark);

  await contractor.save();
  return { message: 'Remark added successfully', remarks: contractor.remarks };
}

// async deleteRemark(contractorId: string, remark: string) {
//   const contractor = await this.contractorModel.findOne({ contractorId });
//   if (!contractor) throw new NotFoundException('Contractor not found');

//   contractor.remarks = (contractor.remarks || []).filter(r => r !== remark);
//   await contractor.save();

//   return { message: 'Remark deleted', remarks: contractor.remarks };
// }
async bulkMarkConverted(actContractorModel: Model<any>) {
  const activeIds = await actContractorModel.find({}, { contractorId: 1 }).lean();
  const activeIdList = activeIds.map(c => c.contractorId);

  const result = await this.contractorModel.updateMany(
    { contractorId: { $in: activeIdList }, stage: { $ne: 'converted' } },
    { $set: { stage: 'converted' } },
  );

  return result;
}


async deleteRemarkByIndex(contractorId: string, index: number) {
  const contractor = await this.contractorModel.findOne({ contractorId });
  if (!contractor) throw new NotFoundException('Contractor not found');

  if (!contractor.remarks || index < 0 || index >= contractor.remarks.length) {
    throw new BadRequestException('Invalid index');
  }

  contractor.remarks.splice(index, 1);
  await contractor.save();

  return { message: 'Remark deleted by index', remarks: contractor.remarks };
}
async updateRemark(contractorId: string, index: number, newText: string) {
  const contractor = await this.contractorModel.findOne({ contractorId });
  if (!contractor) throw new NotFoundException('Contractor not found');

  if (!contractor.remarks || index < 0 || index >= contractor.remarks.length) {
    throw new BadRequestException('Invalid index');
  }

  contractor.remarks[index].text = newText;
  contractor.remarks[index].timestamp = new Date(); // Optionally update timestamp
  await contractor.save();

  return { message: 'Remark updated', remarks: contractor.remarks };
}

async findAllFromDB(
  page: number,
  limit: number,
  search: string,
  code: string,
  startDate?: string,
  endDate?: string,
  stage?: string,
  partnershipTerm?: string,
  remarksFilter?: 'with' | 'without',
  remarksContains?: string,   // NEW param
  sortOrder: 'asc' | 'desc' = 'desc',
) {
  const skip = (page - 1) * limit;
  const query: any = {};

  // Partnership Terms filter
  if (partnershipTerm && partnershipTerm.trim()) {
    query.partnershipTerms = partnershipTerm.trim();
  } else if (code !== 'admin' && code !== 'customerService') {
    query.partnershipTerms = code;
  }

  // Stage filter
  if (stage && stage.trim()) {
    query.stage = stage.trim();
  }

  // 🚨 Restrict "converted" stage for everyone except admin
  if (code !== 'admin') {
    if (query.stage) {
      if (query.stage === 'converted') {
        query.stage = { $ne: 'converted' };
      }
    } else {
      query.stage = { $ne: 'converted' };
    }
  }

  // Search filter
  if (search?.trim()) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { phoneNumber: { $regex: search, $options: 'i' } },
    ];
  }

  // Date filter
  if (startDate || endDate) {
    query.dateAdded = {};
    if (startDate) query.dateAdded.$gte = startDate;
    if (endDate) query.dateAdded.$lte = endDate;
  }

  // Remarks filter
  if (remarksFilter === 'with') {
    query.remarks = { $exists: true, $ne: [] };
  } else if (remarksFilter === 'without') {
    query.$or = [
      { remarks: { $exists: false } },
      { remarks: { $size: 0 } },
    ];
  }

  // 🔥 Remarks contains specific text
if (remarksContains && remarksContains.trim()) {
  const text = remarksContains.trim();
  query.$expr = {
    $regexMatch: {
      input: { $arrayElemAt: ['$remarks.text', -1] },
      regex: text,
      options: 'i',
    },
  };
}


  const sortObj: any = { dateAdded: sortOrder === 'asc' ? 1 : -1 };

  const [data, total] = await Promise.all([
    this.contractorModel
      .find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .exec(),
    this.contractorModel.countDocuments(query).exec(),
  ]);

  return { data, total };
}






  async importFromCSV(file: Express.Multer.File): Promise<any> {
    const results: any[] = [];

    return new Promise((resolve, reject) => {
      const stream = Readable.from(file.buffer.toString());

      stream
        .pipe(
          csv({
            separator: ';',
            mapHeaders: ({ header }) => header.trim(),
          }),
        )
        .on('data', (row) => {
          results.push({
            leadId: row['Lead ID'],
            contractorId: row['Contractor ID'],
            stage: row['Stage'],
            fullName: row['Full name'],
            phoneNumber: row['Phone number'],
            dateAdded: row['Date added'],
            managerInCharge: row['Manager in charge'],
            task: row['Task'],
            balance: row['Balance'],
            limit: row['Limit'],
            partnershipTerms: row['Partnership terms'],
            source: row['Source'],
            vehicle: row['Vehicle'],
            vehicleLicensePlateNumber: row['Vehicle license plate number'],
            nextInteractionDate: row['Next interaction date'],
            hireType: row['Hire type'],
            status: row['Status'],
            comment: row['Comment'],
            profession: row['Profession'],
            tripsInTheService: row['Trips in the service'],
            payoutRules: row['Payout rules'],
            details: row['Details'],
          });
        })
        .on('end', async () => {
          try {
            // Replace this with DB save logic later
            resolve({
              message: 'CSV parsed successfully',
              count: results.length,
              preview: results.slice(0, 3),
            });
          } catch (error) {
            reject({ message: 'Failed to process CSV', error });
          }
        })
        .on('error', (err) => reject(err));
    });
  }










  //charts
   async getStageDistribution(): Promise<{ stage: string; count: number }[]> {
    // Aggregation pipeline to group by 'stage' and count documents
    const result = await this.contractorModel.aggregate([
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          stage: '$_id',
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);
    return result;
  }

   async getRemarksSummary(groupBy: string) {
    const pipeline: any[] = [
      { $unwind: '$remarks' },
    ];

    if (groupBy === 'date') {
      pipeline.push({
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$remarks.timestamp' }
          },
          count: { $sum: 1 }
        }
      });
    } else {
      // Default grouping by remarker
      pipeline.push({
        $group: {
          _id: '$remarks.remarker',
          count: { $sum: 1 }
        }
      });
    }

    pipeline.push({ $sort: { _id: 1 } });

    return this.contractorModel.aggregate(pipeline);
  }

// Controller or Service method (NestJS example)

async getTopRemarkedContractors(limit: number, page: number) {
    const skip = (page - 1) * limit;

    const data = await this.contractorModel.aggregate([
      {
        $project: {
          fullName: 1,
          remarksCount: { $size: { $ifNull: ['$remarks', []] } },
        },
      },
      { $sort: { remarksCount: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    return data;
  }

 async getRegistrationCount(page = 1, daysPerPage = 5) {
    // Calculate date ranges for pagination
    const today = new Date();
    // Normalize today to end of the day for inclusive range
    today.setHours(23, 59, 59, 999);

    // End date for this page (newest date to include)
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - (page - 1) * daysPerPage);

    // Start date for this page (oldest date to include)
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - daysPerPage + 1);
    startDate.setHours(0, 0, 0, 0);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          dateAdded: {
            $exists: true,
            $ne: null,
            $gte: startDate.toISOString(),
            $lte: endDate.toISOString(),
          },
        },
      },
      {
        $project: {
          day: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: { $toDate: '$dateAdded' } as any,
            },
          },
        },
      },
      {
        $group: {
          _id: '$day',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 }, // newest day first
      },
    ];

    const result = await this.contractorModel.aggregate(pipeline).exec();

    return result;
  }
 async findAllForCSV(): Promise<any[]> {
    // Fetch all documents, populate remarks if needed
    return this.contractorModel
      .find({})
      .lean()
      .exec();
  }
}
