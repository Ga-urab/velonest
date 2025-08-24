// recruitment.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import { CreateScoutDto } from './dto/create-scout.dto';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { CreateDriverDto } from './dto/create-driver.dto';
import { SelfRegisterDriverDto } from './dto/self-register-driver.dto';

@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Post('scout')
  addScout(@Body() dto: CreateScoutDto) {
    return this.recruitmentService.addScout(dto);
  }

  @Post('workshop')
  addWorkshop(@Body() dto: CreateWorkshopDto) {
    return this.recruitmentService.addWorkshop(dto);
  }

  @Post('driver')
  addDriver(@Body() dto: CreateDriverDto) {
    return this.recruitmentService.addDriver(dto);
  }

  @Get('scout/:scoutId/drivers')
  getDriversByScout(@Param('scoutId') scoutId: string) {
    return this.recruitmentService.getDriversByScout(scoutId);
  }

   @Post('driver/self-register')
  selfRegisterDriver(@Body() dto: SelfRegisterDriverDto) {
    return this.recruitmentService.selfRegisterDriver(dto);
  }

   @Get('workshop/:id/qr')
  async getWorkshopQr(@Param('id') workshopId: string) {
    const workshop = await this.recruitmentService.getWorkshopById(workshopId);
    return { qrCodeUrl: workshop.qrCodeUrl };
  }
}
