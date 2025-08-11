// ridereport.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RideReportService } from './ridereport.service';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';

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
}
