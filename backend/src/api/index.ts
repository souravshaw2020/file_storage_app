import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { Request, Response } from 'express';

let cachedServer: (req: Request, res: Response) => void;

export default async function handler(req: Request, res: Response) {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());

    // Enable CORS so the React/Next.js frontend can communicate with this API
    const allowedOrigins = [
      'http://localhost:3001',
      'https://file-storage-app-frontend.vercel.app',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    app.enableCors({
      origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void,
      ) => {
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

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
    cachedServer = app.getHttpAdapter().getInstance() as (
      req: Request,
      res: Response,
    ) => void;
  }

  return cachedServer(req, res);
}
