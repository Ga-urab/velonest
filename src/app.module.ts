import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ContractorsModule } from './contractors/contractors.module';
import { TransactionsModule } from './transactions/transactions.module';
import { RideReportModule } from './ridereport/ridereport.module';

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
],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
