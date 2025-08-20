import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ActContractorsService } from './act-contractors.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@Controller('actcontractors')
export class ActContractorsController {
  constructor(private readonly actcontractorsService: ActContractorsService) {}

@Post('upload-csv')
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
  async uploadCSV(@UploadedFile() file: Express.Multer.File) {
    return this.actcontractorsService.uploadCSV(file);
  }

  @Get()
  async findAll() {
    return this.actcontractorsService.findAll();
  }

  @Get(':contractorId')
  async findOne(@Param('contractorId') contractorId: string) {
    return this.actcontractorsService.findOne(contractorId);
  }


}
