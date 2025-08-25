import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import { CreateScoutDto } from './dto/create-scout.dto';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { CreateDriverDto } from './dto/create-driver.dto';
import { SelfRegisterDriverDto } from './dto/self-register-driver.dto';

@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  // --- CREATE ---
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

  @Post('driver/self-register')
  selfRegisterDriver(@Body() dto: SelfRegisterDriverDto) {
    return this.recruitmentService.selfRegisterDriver(dto);
  }

  // --- READ ---
  @Get('scouts')
  getAllScouts() {
    return this.recruitmentService.getAllScouts();
  }

  @Get('drivers')
  getAllDrivers() {
    return this.recruitmentService.getAllDrivers();
  }

  @Get('workshops')
  getAllWorkshops() {
    return this.recruitmentService.getAllWorkshops();
  }

  @Get('scout/:scoutId')
  getScout(@Param('scoutId') scoutId: string) {
    return this.recruitmentService.getScoutById(scoutId);
  }

  @Get('driver/:driverId')
  getDriver(@Param('driverId') driverId: string) {
    return this.recruitmentService.getDriverById(driverId);
  }

  @Get('workshop/:id')
  getWorkshop(@Param('id') workshopId: string) {
    return this.recruitmentService.getWorkshopById(workshopId);
  }

  @Get('scout/:scoutId/drivers')
  getDriversByScout(@Param('scoutId') scoutId: string) {
    return this.recruitmentService.getDriversByScout(scoutId);
  }

  @Get('workshop/:id/qr')
  async getWorkshopQr(@Param('id') workshopId: string) {
    const workshop = await this.recruitmentService.getWorkshopById(workshopId);
    return { qrCodeUrl: workshop.qrCodeUrl };
  }

  // --- UPDATE ---
  @Put('scout/:scoutId')
  updateScout(@Param('scoutId') scoutId: string, @Body() update: Partial<CreateScoutDto>) {
    return this.recruitmentService.updateScout(scoutId, update);
  }

  @Put('driver/:driverId')
  updateDriver(@Param('driverId') driverId: string, @Body() update: Partial<CreateDriverDto>) {
    return this.recruitmentService.updateDriver(driverId, update);
  }

  @Put('workshop/:id')
  updateWorkshop(@Param('id') workshopId: string, @Body() update: Partial<CreateWorkshopDto>) {
    return this.recruitmentService.updateWorkshop(workshopId, update);
  }

  // --- DELETE ---
  @Delete('scout/:scoutId')
  deleteScout(@Param('scoutId') scoutId: string) {
    return this.recruitmentService.deleteScout(scoutId);
  }

  @Delete('driver/:driverId')
  deleteDriver(@Param('driverId') driverId: string) {
    return this.recruitmentService.deleteDriver(driverId);
  }

  @Delete('workshop/:id')
  deleteWorkshop(@Param('id') workshopId: string) {
    return this.recruitmentService.deleteWorkshop(workshopId);
  }
}
