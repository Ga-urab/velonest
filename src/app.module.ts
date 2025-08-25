import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ContractorsModule } from './contractors/contractors.module';
import { TransactionsModule } from './transactions/transactions.module';
import { RideReportModule } from './ridereport/ridereport.module';
import { ActContractorsModule } from './act-contractors/act-contractors.module';
import { RecruitmentModule } from './recruitment/reqruitment.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
imports: [
  ConfigModule.forRoot({ isGlobal: true }),
  MongooseModule.forRootAsync({
    useFactory: () => ({
      uri: process.env.MONGO_URI,
    }),
  }),
  ContractorsModule,
  TransactionsModule,
  RideReportModule,
  ActContractorsModule,
  RecruitmentModule,
  AttendanceModule
],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
