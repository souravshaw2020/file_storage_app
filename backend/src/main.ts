/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Enable CORS so the React/Next.js frontend can communicate with this API
  const allowedOrigins = [
    'http://localhost:3001',
    'https://file-storage-app-frontend.vercel.app',
    process.env.FRONTEND_URL, // in case it's set to something else in a given env
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // allow no-origin requests (curl, server-to-server) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // app.enableCors({
  //   origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  //   credentials: true,
  // });

  // Enable global validation for all incoming requests
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips away any fields not defined in the DTO
      forbidNonWhitelisted: true, // Throws an error if extra fields are sent
    }),
  );

  // await app.listen(process.env.PORT ?? 3000);
  await app.init();

  // Return the underlying Express instance
  return app.getHttpAdapter().getInstance();
}

// 1. If running locally, start the traditional server
if (process.env.NODE_ENV !== 'production') {
  bootstrap().then((expressApp) => {
    expressApp.listen(process.env.PORT || 3000);
  });
}

// 2. If running on Vercel, export the serverless handler
export default async function handler(req: any, res: any) {
  const expressApp = await bootstrap();
  expressApp(req, res);
}

// bootstrap();
