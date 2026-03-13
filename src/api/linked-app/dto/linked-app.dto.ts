import { IsString, IsUrl, IsOptional, IsBoolean, IsNumber, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class LinkedAppMetadataDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsObject()
  stats?: {
    users?: string;
    photos?: string;
    rating?: string;
    satisfaction?: string;
  };

  @IsOptional()
  @IsString()
  story?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  capabilities?: string[];
}

export class CreateLinkedAppDto {
  @IsString()
  name: string;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsNumber()
  order?: number = 0;

  @IsOptional()
  @IsBoolean()
  openInNewTab?: boolean = true;

  @IsOptional()
  @ValidateNested()
  @Type(() => LinkedAppMetadataDto)
  metadata?: LinkedAppMetadataDto;
}

export class UpdateLinkedAppDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  openInNewTab?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => LinkedAppMetadataDto)
  metadata?: LinkedAppMetadataDto;
}

export class LinkedAppResponseDto {
  _id: string;
  name: string;
  url: string;
  description?: string;
  icon?: string;
  image?: string;
  category?: string;
  isActive: boolean;
  order: number;
  openInNewTab: boolean;
  metadata?: {
    features?: string[];
    stats?: {
      users?: string;
      photos?: string;
      rating?: string;
      satisfaction?: string;
    };
    story?: string;
    capabilities?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}
