// src/auth/dto/auth.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty()
  email!: string; // <-- Add the ! here

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string; // <-- Add the ! here
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string; // <-- Add the ! here

  @IsString()
  @IsNotEmpty()
  password!: string; // <-- Add the ! here
}
