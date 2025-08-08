import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ContractorsModule } from './contractors/contractors.module';

@Module({
  imports: [
     MongooseModule.forRoot('mongodb+srv://gaurabaryal9:WTW3svj6bRzv5d8X@cluster0.bpzsgmk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'),
    ConfigModule.forRoot(),
    ContractorsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
