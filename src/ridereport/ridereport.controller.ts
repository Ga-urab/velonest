// ridereport.controller.ts
import {
  Controller,
  Post,
  UploadedFiles,
  UploadedFile,
  UseInterceptors,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RideReportService } from './ridereport.service';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import csv from 'csv-parser';
import * as fs from 'fs';

@Controller('ridereport')
export class RideReportController {
  constructor(private readonly rideReportService: RideReportService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  uploadCSV(@UploadedFile() file: Express.Multer.File) {
    return this.rideReportService.uploadCSV(file);
  }

@Get('all')
async getAll(
  @Query('page') page = '1',
  @Query('limit') limit = '10',
  @Query('search') search = '',
  @Query('normalSearch') normalSearch = '',
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
  @Query('sortField') sortField?: string,
  @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
) {
  const pageNum = Math.max(parseInt(page as any, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit as any, 10) || 10, 1), 100);

  return this.rideReportService.findAll(
    pageNum,
    limitNum,
    search,
    normalSearch,
    startDate,
    endDate,
    sortField,
    sortOrder
  );
}


  @Get('count')
  async getCount() {
    return this.rideReportService.countAll();
  }




@Get('check-completed')
  async checkCompleted(@Query('contractorId') contractorId: string) {
    return this.rideReportService.checkCompletedRides(contractorId);
  }

  // ride-reports.controller.ts
@Get("campaign-leaderboard")
async getLeaderboard() {
  const start = new Date("2025-08-17T13:00:00Z");
  const end = new Date("2025-08-22T23:59:59Z");
  return this.rideReportService.getCampaignLeaderboard(start, end);
}

@Post('leaderboard-upload')
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      champions: {
        type: 'string',
        format: 'binary',
      },
      igniters: {
        type: 'string',
        format: 'binary',
      },
    },
  },
})
@UseInterceptors(
  FileFieldsInterceptor([
    { name: 'champions', maxCount: 1 },
    { name: 'igniters', maxCount: 1 },
  ]),
)
async uploadLeaderboard(@UploadedFiles() files: { champions?: Express.Multer.File[]; igniters?: Express.Multer.File[] }) {
  if (!files.champions || !files.igniters) {
    throw new Error('Both champions and igniters CSV files are required');
  }

  const start = new Date("2025-08-17T13:00:00Z");
  const end = new Date("2025-08-22T23:59:59Z");

  const championsCSV = files.champions[0].path;
  const ignitersCSV = files.igniters[0].path;

const champions = await this.parseCSV(files.champions[0]);
const igniters = await this.parseCSV(files.igniters[0]);


  return this.rideReportService.getLeaderboardFromCSV(champions, igniters, start, end);
}

private parseCSV(file: Express.Multer.File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const results: string[] = [];
    const stream = require('stream');
    const readable = new stream.Readable();
    readable._read = () => {}; // _read is required
    readable.push(file.buffer);
    readable.push(null);

    readable
      .pipe(csv({ headers: false }))
      .on('data', (data: Record<string, string>) => {
        const val = Object.values(data)[0].trim();
        if (val.toLowerCase() !== 'champions' && val.toLowerCase() !== 'igniters') results.push(val);
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}








//Charts
 @Get('charts/rides-per-driver')
  async ridesPerDriver() {
    return this.rideReportService.getRidesPerDriver();
  }

  @Get('charts/revenue-per-driver')
  async revenuePerDriver() {
    return this.rideReportService.getRevenuePerDriver();
  }

  @Get('charts/rides-per-vehicle')
  async ridesPerVehicle() {
    return this.rideReportService.getRidesPerVehicle();
  }

  @Get('charts/average-fare-per-day')
async averageFarePerDay() {
  return this.rideReportService.getAverageFarePerDay();
}

@Get('leaderboard/drivers/rides')
async topDriversByRides() {
  return this.rideReportService.getTopDriversByRides();
}

@Get('leaderboard/drivers/revenue')
async topDriversByRevenue() {
  return this.rideReportService.getTopDriversByRevenue();
}

@Get('leaderboard/vehicles/rides')
async topVehiclesByRides() {
  return this.rideReportService.getTopVehiclesByRides();
}

@Get('leaderboard/vehicles/revenue')
async topVehiclesByRevenue() {
  return this.rideReportService.getTopVehiclesByRevenue();
}

}
