import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { FileService } from './file.service';
import { RequestUploadUrlDto, ConfirmUploadDto } from './dto/file.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type JwtPayload } from '../auth/current-user.decorator';
import { File } from '@prisma/client'; // <-- Import the Prisma File type

@UseGuards(AuthGuard)
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload-url')
  // 1. Explicitly type the return signature here
  async requestUploadUrl(
    @Body() dto: RequestUploadUrlDto,
    @CurrentUser() user: JwtPayload, // Use the interface here
  ): Promise<{ uploadUrl: string; storageKey: string }> {
    return this.fileService.generateUploadUrl(dto, user.sub);
  }

  @Post('confirm')
  // 2. Explicitly type the return signature here
  async confirmUpload(
    @Body() dto: ConfirmUploadDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<File> {
    return this.fileService.confirmUpload(dto, user.sub);
  }
  @Get(':id/download')
  async downloadFile(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ downloadUrl: string }> {
    // We pass the user.sub (userId) so the service can verify ownership if the file is private
    return this.fileService.getDownloadUrl(id, user.sub);
  }
}
