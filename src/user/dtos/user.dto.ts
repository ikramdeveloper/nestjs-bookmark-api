import { PartialType } from '@nestjs/mapped-types';
import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserResponseDto {
  @Exclude()
  password: string;

  @Exclude()
  updatedAt: Date;

  constructor(data: Partial<UserResponseDto>) {
    Object.assign(this, data);
  }
}

export class UserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;
}

export class UpdateUserDto extends PartialType(UserDto) {}
