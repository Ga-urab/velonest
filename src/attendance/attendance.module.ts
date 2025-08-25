import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceSchema } from './schema/attendance.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Attendance', schema: AttendanceSchema }])],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
