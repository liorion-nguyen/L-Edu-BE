import { IsString, IsBoolean, IsOptional, IsArray, ValidateNested, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class ContentSectionDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  buttonText?: string;

  @IsOptional()
  @IsUrl()
  buttonLink?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateContentDto {
  @IsString()
  page: string;

  @IsString()
  section: string;

  @IsString()
  title: string;

  @IsString()
  subtitle: string;

  @IsArray()
  @IsString({ each: true })
  descriptions: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentSectionDto)
  sections: ContentSectionDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  order?: number;
}

export class UpdateContentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  descriptions?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentSectionDto)
  sections?: ContentSectionDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  order?: number;
}

export class ContentResponseDto {
  _id: string;
  page: string;
  section: string;
  title: string;
  subtitle: string;
  descriptions: string[];
  sections: ContentSectionDto[];
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
