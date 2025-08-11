import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { Transaction } from './entities/transactions.entity';
function stripBOM(buffer: Buffer): Buffer {
  const bom = Buffer.from([0xef, 0xbb, 0xbf]);
  if (buffer.slice(0, 3).equals(bom)) {
    return buffer.slice(3);
  }
  return buffer;
}
@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel('Transaction') private readonly transactionModel: Model<Transaction>,
  ) {}

async uploadCSV(file: Express.Multer.File): Promise<any> {
  const parsedResults: any[] = [];

  return new Promise((resolve, reject) => {
    const cleanBuffer = stripBOM(file.buffer);
    const stream = Readable.from(cleanBuffer);

    stream
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => {
// inside your .on('data') callback:
const dateTimeStr = data['Date']; // "10.08.2025 06:56:47"
const [datePart, timePart] = dateTimeStr.split(' ');
const [day, month, year] = datePart.split('.');
const [hours, minutes, seconds] = timePart.split(':');

const dateObj = new Date(
  Number(year),
  Number(month) - 1,
  Number(day),
  Number(hours),
  Number(minutes),
  Number(seconds)
);

parsedResults.push({
  date: dateObj,   // save as Date object, not string
  driverId: data['Driver ID'],
  driver: data['Driver'],
  categoryId: data['Category ID'],
  category: data['Category'],
  amount: data['Amount'],
  document: data['Document'],
  initiatedBy: data['Initiated by'],
  comment: data['Comment'],
});

      })
      .on('end', async () => {
        try {
          const orQueries = parsedResults.map(t => ({
            date: t.date,
            driverId: t.driverId,
            categoryId: t.categoryId,
            amount: t.amount,
            document: t.document,
          }));

          const existingTransactions = await this.transactionModel.find({ $or: orQueries });

          const existingKeys = new Set(
            existingTransactions.map(
              t => `${t.date}|${t.driverId}|${t.categoryId}|${t.amount}|${t.document}`
            )
          );

          const newTransactions = parsedResults.filter(
            t => !existingKeys.has(`${t.date}|${t.driverId}|${t.categoryId}|${t.amount}|${t.document}`)
          );

          if (newTransactions.length > 0) {
            await this.transactionModel.insertMany(newTransactions);
          }

          resolve({
            message: 'CSV processed successfully',
            inserted: newTransactions.length,
            skippedDuplicates: parsedResults.length - newTransactions.length,
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
  search?: string,       // special terms (cash, promoBonus...)
  normalSearch?: string, // free text search by driver
  startDate?: string,
  endDate?: string,
  sortOrder: 'asc' | 'desc' = 'desc',
): Promise<{ data: Transaction[]; total: number }> {
  const skip = (page - 1) * limit;
  const query: any = {};

  // Special search terms mapping
  if (search && search.trim()) {
    switch (search.trim()) {
      case 'cash':
        query.categoryId = 'cash_collected';
        break;
      case 'receivedGoalBonus':
        query.comment = /Goal bonus/i;
        break;
      case 'platformFee':
        query.categoryId = 'partner_ride_fee';
        break;
      case 'promoBonus':
query.comment = /^Bonus$/i;
        break;
 case 'blueBonus':
  query.$and = [
    { document: { $nin: ['', '—'] } },  // document NOT IN ['', '—']
    { categoryId: 'bonus' }
  ];
  break;

      case 'ourBank':
        query.categoryId = 'partner_service_financial_statement';
        break;
      case 'manualCharge':
        query.categoryId = 'partner_service_manual';
        break;
      default:
        // If not special term, do nothing here, will check normalSearch below
        break;
    }
  }

  // Normal free text search on driver
  if (normalSearch && normalSearch.trim()) {
    const regex = new RegExp(normalSearch.trim(), 'i');
    query.driver = regex;
  }

// Date range filter
if (startDate || endDate) {
  query.date = {};
  if (startDate) query.date.$gte = new Date(startDate);
  if (endDate) {
    // To include the whole day of endDate, you can add 1 day minus 1 millisecond,
    // or simply set time to the end of the day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    query.date.$lte = end;
  }
}


  const sortObj: any = { date: sortOrder === 'asc' ? 1 : -1 };

  const [data, total] = await Promise.all([
    this.transactionModel.find(query).sort(sortObj).skip(skip).limit(limit).exec(),
    this.transactionModel.countDocuments(query).exec(),
  ]);

  return { data, total };
}



async countTransactions(): Promise<{ total: number }> {
  const total = await this.transactionModel.countDocuments();
  return { total };
}


}
