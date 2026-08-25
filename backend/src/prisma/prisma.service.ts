/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    // Connect to the database when the application starts
    await this.$connect();
  }

  async onModuleDestroy() {
    // Disconnect cleanly when shutting down
    await this.$disconnect();
  }
}
