import { Controller, Get, Param } from '@nestjs/common';
import { FileService } from './file.service';

@Controller('public/files') // Endpoint will be: GET /public/files/:id/download
export class PublicController {
  constructor(private readonly fileService: FileService) {}

  @Get(':id/download')
  async downloadPublicFile(
    @Param('id') id: string,
  ): Promise<{ downloadUrl: string }> {
    // We do NOT pass a userId here.
    // The service will automatically reject it if the file is not marked as public.
    return this.fileService.getDownloadUrl(id);
  }
}
