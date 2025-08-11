// ridereport.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RideReportController } from './ridereport.controller';
import { RideReportService } from './ridereport.service';
import { RideReportSchema } from './entities/ridereport.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'RideReport', schema: RideReportSchema }]),
  ],
  controllers: [RideReportController],
  providers: [RideReportService],
})
export class RideReportModule {}
