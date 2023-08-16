import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class AddBookmarkDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsUrl()
  @IsNotEmpty()
  link: string;
}

export class UpdateBookmarkDto extends PartialType(AddBookmarkDto) {}
