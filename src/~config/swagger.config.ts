import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ContractorsModule } from 'src/contractors/contractors.module';
import { RideReportModule } from 'src/ridereport/ridereport.module';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { ActContractorsModule } from 'src/act-contractors/act-contractors.module';
import { RecruitmentModule } from 'src/recruitment/reqruitment.module';
import { AttendanceModule } from 'src/attendance/attendance.module';

export const swaggerModuleConfig = (app: INestApplication) => {
  // For Root Swagger Document
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Root API')
    .setDescription('API For Admin Portal.')
    .setVersion('1.0.0')
    .addBearerAuth
    // {
    //   description: 'Default JWT Authorization',
    //   type: 'http',
    //   in: 'header',
    //   scheme: 'bearer',
    //   bearerFormat: 'JWT',
    // },
    // 'defaultBearerAuth',
    ()
    .build();

  const rootApiDocument = SwaggerModule.createDocument(app, swaggerConfig, {
    include: [ContractorsModule, TransactionsModule, RideReportModule, ActContractorsModule, RecruitmentModule, AttendanceModule],
  });
  SwaggerModule.setup('api', app, rootApiDocument);
};
