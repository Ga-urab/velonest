// recruitment.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecruitmentService } from './recruitment.service';
import { RecruitmentController } from './recruitment.controller';
import { ScoutSchema } from './schemas/scout.schema';
import { WorkshopSchema } from './schemas/workshop.schema';
import { DriverSchema } from './schemas/driver.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Scout', schema: ScoutSchema },
      { name: 'Workshop', schema: WorkshopSchema },
      { name: 'Driver', schema: DriverSchema },
    ]),
  ],
  controllers: [RecruitmentController],
  providers: [RecruitmentService],
})
export class RecruitmentModule {}
