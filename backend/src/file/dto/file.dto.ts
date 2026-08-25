import { IsString, IsNumber, IsNotEmpty, Max } from 'class-validator';

export class RequestUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  mimeType!: string; // e.g., 'application/pdf'

  @IsNumber()
  @Max(104857600, { message: 'File size must not exceed 100MB' })
  sizeBytes!: number;
}

export class ConfirmUploadDto {
  @IsString()
  @IsNotEmpty()
  storageKey!: string; // The unique ID we generated in the previous step

  @IsString()
  @IsNotEmpty()
  originalName!: string;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @IsNumber()
  sizeBytes!: number;
}
