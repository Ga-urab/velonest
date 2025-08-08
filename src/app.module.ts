import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ContractorsModule } from './contractors/contractors.module';

@Module({
  imports: [
MongooseModule.forRoot(process.env.MONGO_URI || ''),
    ConfigModule.forRoot(),
    ContractorsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
