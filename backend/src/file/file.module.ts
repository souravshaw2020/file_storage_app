import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { PublicController } from './public.controller';

@Module({
  providers: [FileService],
  controllers: [FileController, PublicController],
})
export class FileModule {}
