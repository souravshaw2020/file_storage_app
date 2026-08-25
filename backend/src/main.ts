import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS so the React/Next.js frontend can communicate with this API
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  // Enable global validation for all incoming requests
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips away any fields not defined in the DTO
      forbidNonWhitelisted: true, // Throws an error if extra fields are sent
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
