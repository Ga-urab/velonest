import { Controller, Post, Body, Get, Query, Req } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';  // ✅ Correct import

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  markAttendance(@Body() dto: CreateAttendanceDto, @Req() req: Request) {
    return this.attendanceService.markAttendance(dto, req);
  }

  @Get()
  getAllAttendance() {
    return this.attendanceService.getAllAttendance();
  }

  @Get('by-date')
  getAttendanceByDate(@Query('date') date: string) {
    return this.attendanceService.getAttendanceByDate(date);
  }
}
