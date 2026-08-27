/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-redundant-type-constituents */
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../prisma/prisma.service';
import { RequestUploadUrlDto, ConfirmUploadDto } from './dto/file.dto';
import { v4 as uuidv4 } from 'uuid';
import { File } from '@prisma/client';

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

  async getDownloadUrl(
    fileId: string,
    requestingUserId?: string,
  ): Promise<{ downloadUrl: string }> {
    // 1. Find the file in the database
    const file: File | null = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // 2. Authorization Check
    if (!file.isPublic) {
      // If it's private, a userId MUST be provided, and it MUST match the owner
      if (!requestingUserId) {
        throw new ForbiddenException('This file is private. Please log in.');
      }
      if (file.ownerId !== requestingUserId) {
        throw new ForbiddenException(
          'You do not have permission to access this file.',
        );
      }
    }

    // 3. Generate the S3 GetObject URL
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: file.storageKey,
      ResponseContentDisposition: `attachment; filename="${file.originalName}"`, // Forces the browser to download the file instead of just viewing it
    });

    try {
      // Generate a URL that expires in 1 hour (3600 seconds)
      const downloadUrl: string = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });
      return { downloadUrl };
    } catch {
      throw new InternalServerErrorException('Could not generate download URL');
    }
  }

  // Get all files for a specific user
  async getUserFiles(userId: string): Promise<File[]> {
    // Explicitly define files as an array of File objects
    const files: File[] = await this.prisma.file.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' }, // Show newest files first
    });

    return files;
  }

  // Toggle the public/private status of a file
  async toggleFileAccess(
    fileId: string,
    userId: string,
    isPublic: boolean,
  ): Promise<File> {
    // First, verify the file exists AND belongs to the user trying to change it
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this file.',
      );
    }

    // Update the record in the database
    const updatedFile: File = await this.prisma.file.update({
      where: { id: fileId },
      data: { isPublic },
    });

    return updatedFile;
  }

  // Get a shared download URL for a public file
  async getSharedDownloadUrl(fileId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (!file.isPublic) {
      throw new ForbiddenException(
        'This file is private and cannot be accessed via a share link',
      );
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: file.storageKey,
      ResponseContentDisposition: `attachment; filename="${file.originalName}"`,
    });

    try {
      const downloadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });

      return {
        downloadUrl,
        originalName: file.originalName,
        sizeBytes: file.sizeBytes,
      };
    } catch {
      throw new InternalServerErrorException(
        'Could not generate shared download URL',
      );
    }
  }
}
