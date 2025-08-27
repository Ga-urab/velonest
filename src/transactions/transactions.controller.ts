import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TransactionsService } from './transactions.service';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  uploadCSV(@UploadedFile() file: Express.Multer.File) {
    return this.transactionsService.uploadCSV(file);
  }

@Get('all')
async getAllTransactions(
  @Query('page') page = '1',
  @Query('limit') limit = '10',
  @Query('search') search = '',
  @Query('normalSearch') normalSearch = '',
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
  @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
) {
  const pageNum = parseInt(page, 10);
  const limitNum = Math.min(parseInt(limit, 10), 100);

  return this.transactionsService.findAll(
    pageNum,
    limitNum,
    search,
    normalSearch,
    startDate,
    endDate,
    sortOrder,
  );
}


@Get('count')
async getTransactionCount() {
  return this.transactionsService.countTransactions();
}
  @Get('charts/revenue-per-driver')
  async revenuePerDriverByCategory() {
    return this.transactionsService.getRevenuePerDriverByCategory();
  }


   @Get('charts/driver-revenue')
  async revenuePerDriver(
    @Query('page') page = '0',
    @Query('limit') limit = '5'
  ) {
    const skip = parseInt(page) * parseInt(limit);
    return this.transactionsService.getDriverRevenuePaginated(skip, parseInt(limit));
  }
}
