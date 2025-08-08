import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { swaggerModuleConfig } from './~config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    // Setup Swagger for API documentation
  swaggerModuleConfig(app);

  // Enable CORS to allow requests from frontend
  app.enableCors({
  origin: ['http://localhost:3000', 'http://192.168.1.87:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
