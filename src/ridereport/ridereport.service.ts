// ridereport.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { RideReport } from './entities/ridereport.entity';

function stripBOM(buffer: Buffer): Buffer {
  const bom = Buffer.from([0xef, 0xbb, 0xbf]);
  return buffer.slice(0, 3).equals(bom) ? buffer.slice(3) : buffer;
}

@Injectable()
export class RideReportService {
  constructor(
    @InjectModel('RideReport') private readonly rideReportModel: Model<RideReport>,
  ) {}

  private parseDateFlexible(str?: string | null): Date | null {
    if (!str) return null;
    const trimmed = String(str).trim();
    if (!trimmed) return null;

    // if already ISO-ish or contains '-' (YYYY-...), try Date parse
    if (/\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      const parsed = new Date(trimmed);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    // expected formats:
    // "10.08.2025" or "10.08.2025 06:56:47" or "10.08.2025 6:56:47"
    // handle missing time parts gracefully
    const parts = trimmed.split(' ');
    const datePart = parts[0];
    const timePart = parts.slice(1).join(' ') || '';

    const datePieces = datePart.split('.');
    if (datePieces.length !== 3) return null;
    const [day, month, year] = datePieces.map(p => p.replace(/\D/g, ''));

    let hh = 0, mm = 0, ss = 0;
    if (timePart) {
      const t = timePart.split(':');
      hh = Number(t[0] || 0);
      mm = Number(t[1] || 0);
      ss = Number(t[2] || 0);
    }

    const d = new Date(Number(year), Number(month) - 1, Number(day), hh, mm, ss);
    return isNaN(d.getTime()) ? null : d;
  }

async uploadCSV(file: Express.Multer.File): Promise<any> {
  if (!file || !file.buffer) {
    throw new BadRequestException('File is required');
  }

  const parsedResults: any[] = [];

  // Helper: format Date object as "DD.MM.YYYY HH:mm:ss"
  function formatNepalDate(date) {
    if (!date) return null;
    const pad = (n) => n.toString().padStart(2, '0');

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
  }

  // Parse "DD.MM.YYYY HH:mm:ss" string to Date object (direct local date, no timezone offset)
  function parseDateExact(dateTimeStr: string): Date | null {
    if (!dateTimeStr) return null;
    const [datePart, timePart] = dateTimeStr.split(' ');
    if (!datePart) return null;
    const [day, month, year] = datePart.split('.').map(Number);
    const [hours = 0, minutes = 0, seconds = 0] = timePart ? timePart.split(':').map(Number) : [];

    if ([day, month, year, hours, minutes, seconds].some(isNaN)) return null;

    // Direct construction with no timezone adjustment:
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }

  // Helper: convert comma decimals to dots and parse number
  const parseCSVNumber = (val: any) => {
    if (!val) return null;
    const normalized = String(val).replace(',', '.').trim();
    const num = Number(normalized);
    return isNaN(num) ? null : num;
  };

  // Mileage: parse number and divide by 1000
  const parseMileage = (val: any) => {
    const num = parseCSVNumber(val);
    return num !== null ? num / 1000 : null;
  };

  // Prices: parse normally with decimal fix, no division
  const parsePrice = (val: any) => parseCSVNumber(val);

  return new Promise((resolve, reject) => {
    const cleanBuffer = stripBOM(file.buffer);
    const stream = Readable.from(cleanBuffer);

    stream
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        try {
          const mileageRaw = row['Mileage, km'] ?? row['Mileage km'];
          const mileageKm = parseMileage(mileageRaw);

          const pickupDateObj = parseDateExact(row['Pickup date']);
          const completionDateObj = parseDateExact(row['Completion date']);

          parsedResults.push({
            id: row['ID'] ?? row['Id'] ?? row['id'],
            status: row['Status'],
            orderCode: row['Order code'] ?? row['Order Code'] ?? row['OrderCode'],
            driver: row['Driver'],
            driver2: row['Driver'],
            vehicle: row['Vehicle'],
            vehicle2: row['Vehicle'],
            pickupDate: pickupDateObj,
            pickupDateFormatted: formatNepalDate(pickupDateObj),
            completionDate: completionDateObj,
            completionDateFormatted: formatNepalDate(completionDateObj),
            cancellationReason: row['Cancellation reason'],
            address: row['Address'],
            serviceClass: row['Service class'],

            mileageKm,

            fareInYangoPro: parsePrice(row['Fare in Yango Pro']),
            cash: parsePrice(row['Cash']),
            card: parsePrice(row['Card']),
            corporatePayment: parsePrice(row['Corporate payment']),
            tip: parsePrice(row['Tip']),
            promotion: parsePrice(row['Promotion']),
            bonuses: parsePrice(row['Bonuses']),
            serviceFee: parsePrice(row['Service fee']),
            partnerFee: parsePrice(row['Partner fee']),
            otherPayments: parsePrice(row['Other payments']),
            partnerRidePayments: row['Partner ride payments'],
          });
        } catch {
          // skip malformed rows silently
        }
      })
      .on('end', async () => {
        try {
          const orQueries = parsedResults.map(r => ({
            orderCode: r.orderCode,
            pickupDate: r.pickupDate ?? null,
          }));

          const existing = orQueries.length > 0
            ? await this.rideReportModel.find({ $or: orQueries }).lean().exec()
            : [];

          const existingKeys = new Set(
            existing.map(e => `${e.orderCode}|${e.pickupDate ? new Date(e.pickupDate).toISOString() : ''}`)
          );

          const newDocs = parsedResults.filter(r => {
            const key = `${r.orderCode}|${r.pickupDate ? r.pickupDate.toISOString() : ''}`;
            return !existingKeys.has(key);
          });

          if (newDocs.length > 0) {
            await this.rideReportModel.insertMany(newDocs);
          }

          resolve({
            message: 'CSV processed successfully',
            inserted: newDocs.length,
            skippedDuplicates: parsedResults.length - newDocs.length,
          });
        } catch (error) {
          reject({ message: 'Error processing CSV data', error });
        }
      })
      .on('error', (err) => reject(err));
  });
}

async findAll(
  page: number,
  limit: number,
  search?: string,       // special terms: 'completed', 'cancelled'
  normalSearch?: string, // free text search on driver, vehicle, orderCode
  startDate?: string,
  endDate?: string,
  sortField?: string,
  sortOrder: 'asc' | 'desc' = 'desc',
): Promise<{ data: any[]; total: number }> {
  const skip = (page - 1) * limit;
  const match: any = {};

  // Handle special search keywords for status filtering
  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    if (s === 'completed') {
      match.status = /^completed$/i;  // case-insensitive exact match
    } else if (s === 'cancelled') {
      match.status = /^cancelled$/i;
    } else {
      // fallback: treat as normalSearch if not special keyword
      const regex = new RegExp(search.trim(), 'i');
      match.$or = [
        { driver: regex },
        { driver2: regex },
        { vehicle: regex },
        { vehicle2: regex },
        { orderCode: regex },
      ];
    }
  } else if (normalSearch && normalSearch.trim()) {
    // Normal free text search on multiple fields
    const regex = new RegExp(normalSearch.trim(), 'i');
    match.$or = [
      { driver: regex },
      { driver2: regex },
      { vehicle: regex },
      { vehicle2: regex },
      { orderCode: regex },
    ];
  }

  // Date range filter on pickupDate
  if (startDate || endDate) {
    match.pickupDate = {};
    if (startDate && !isNaN(new Date(startDate).getTime())) {
      match.pickupDate.$gte = new Date(startDate);
    }
    if (endDate && !isNaN(new Date(endDate).getTime())) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // include full day
      match.pickupDate.$lte = end;
    }
    if (Object.keys(match.pickupDate).length === 0) {
      delete match.pickupDate;
    }
  }

  // Build aggregation pipeline
  const pipeline: any[] = [{ $match: match }];

  // Add field for numeric sort if needed
  let sortStage: any = {};
  if (sortField && sortField.trim()) {
    if (sortField === 'cash' || sortField === 'fareInYangoPro' || sortField === 'mileageKm') {
      // Cast to number for sorting
      const numericField = sortField + 'Num';
      pipeline.push({
        $addFields: {
          [numericField]: { $toDouble: `$${sortField}` }
        }
      });
      sortStage[numericField] = sortOrder === 'asc' ? 1 : -1;
    } else {
      // Regular sort on field
      sortStage[sortField] = sortOrder === 'asc' ? 1 : -1;
    }
  } else {
    sortStage['pickupDate'] = -1;
  }

  pipeline.push({ $sort: sortStage });
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  // Run aggregation for data
  const data = await this.rideReportModel.aggregate(pipeline).exec();

  // Run countDocuments separately for total count
  const total = await this.rideReportModel.countDocuments(match).exec();

  return { data, total };
}


  async countAll(): Promise<{ total: number }> {
    const total = await this.rideReportModel.countDocuments();
    return { total };
  }
}
