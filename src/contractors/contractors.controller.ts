import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContractorsService } from './contractors.service';
import { CreateContractorDto } from './dto/create-contractor.dto';
import { UpdateContractorDto } from './dto/update-contractor.dto';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import {AddRemarkDto} from './dto/add-remark.dto'

@Controller('contractors')
export class ContractorsController {
  constructor(private readonly contractorsService: ContractorsService) {}

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
    return this.contractorsService.uploadCSV(file);
  }

@Get('all')
async getAllContractors(
  @Query('page') page = '1',
  @Query('limit') limit = '10',
  @Query('search') search = '',
  @Query('code') code: string,
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
  @Query('stage') stage?: string,
  @Query('partnershipTerm') partnershipTerm?: string,
  @Query('remarksFilter') remarksFilter?: 'with' | 'without', // NEW
  @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
) {
  const pageNum = parseInt(page, 10);
  const limitNum = Math.min(parseInt(limit, 10), 100);

  return this.contractorsService.findAllFromDB(
    pageNum,
    limitNum,
    search,
    code,
    startDate,
    endDate,
    stage,
    partnershipTerm,
    remarksFilter, // pass to service
    sortOrder,
  );
}








@Post(':contractorId/remarks')
async addRemark(
  @Param('contractorId') contractorId: string,
  @Body() body: AddRemarkDto,
) {
  return this.contractorsService.addRemark(contractorId, body);
}

@Patch(':contractorId/remarks/:index')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      remark: { type: 'string', example: 'Updated remark text' },
    },
    required: ['remark'],
  },
})
async updateRemark(
  @Param('contractorId') contractorId: string,
  @Param('index') index: string,
  @Body('remark') newRemark: string,
) {
  return this.contractorsService.updateRemark(contractorId, parseInt(index), newRemark);
}



@Delete(':contractorId/remarks/:index')
async deleteRemarkByIndex(
  @Param('contractorId') contractorId: string,
  @Param('index') index: string,
) {
  return this.contractorsService.deleteRemarkByIndex(contractorId, parseInt(index));
}

// contractor.controller.ts
@Get('all-csv')
async getAllForCSV(@Query('code') code: string) {
  return this.contractorsService.findAllForCSV(code); // no pagination
}








//charts
@Get('stage-distribution')
  async getStageDistribution() {
    const data = await this.contractorsService.getStageDistribution();
    return { data };
  }

   @Get('remarks-summary')
  async getRemarksSummary(@Query('groupBy') groupBy: string) {
    return this.contractorsService.getRemarksSummary(groupBy || 'remarker');
  }

@Get('top-remarked-contractors')
  async getTopRemarkedContractors(
    @Query('limit') limitStr?: string,
    @Query('page') pageStr?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 5;
    const page = pageStr ? parseInt(pageStr, 10) : 1;

    // Sanity checks
    if (limit < 1) throw new Error('Limit must be at least 1');
    if (page < 1) throw new Error('Page must be at least 1');

    const data = await this.contractorsService.getTopRemarkedContractors(limit, page);

    return data; // return array directly or wrap as { data, total } if you add total count
  }

  @Get('registrations')
  async getRegistrations(
    @Query('page') page: string,
  ) {
    const pageNumber = parseInt(page) || 1;
    const daysPerPage = 5;
    return this.contractorsService.getRegistrationCount(pageNumber, daysPerPage);
  }

}
