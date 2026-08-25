/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../prisma/prisma.service';
import { RequestUploadUrlDto, ConfirmUploadDto } from './dto/file.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
  private s3Client: S3Client;
  private bucketName =
    process.env.AWS_S3_BUCKET_NAME || 'my-secure-file-bucket';

  constructor(private prisma: PrismaService) {
    // Initialize the S3 client using environment variables
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy-key',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy-secret',
      },
    });
  }

  async generateUploadUrl(dto: RequestUploadUrlDto, userId: string) {
    // 1. Generate a unique storage key to prevent file overwrites
    const extension = dto.fileName.split('.').pop();
    const storageKey = `${userId}/${uuidv4()}.${extension}`;

    // 2. Create the PutObject command
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: storageKey,
      ContentType: dto.mimeType,
      ContentLength: dto.sizeBytes,
    });

    try {
      // 3. Generate a signed URL valid for 15 minutes
      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 900,
      });

      return { uploadUrl, storageKey };
    } catch {
      throw new InternalServerErrorException('Could not generate upload URL');
    }
  }

  async confirmUpload(dto: ConfirmUploadDto, userId: string) {
    // Save the file metadata to our PostgreSQL database
    const file = await this.prisma.file.create({
      data: {
        originalName: dto.originalName,
        storageKey: dto.storageKey,
        sizeBytes: dto.sizeBytes,
        mimeType: dto.mimeType,
        ownerId: userId,
        isPublic: false, // Default to private
      },
    });

    return file;
  }
}
