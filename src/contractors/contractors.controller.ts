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
) {
  const pageNum = parseInt(page, 10);
  const limitNum = Math.min(parseInt(limit, 10), 100);

  return this.contractorsService.findAllFromDB(pageNum, limitNum, search, code, startDate, endDate);
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


}
