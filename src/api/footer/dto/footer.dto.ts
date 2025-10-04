import { IsString, IsBoolean, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FooterLinkDto {
  @IsString()
  label: string;

  @IsString()
  url: string;

  @IsOptional()
  @IsBoolean()
  isExternal?: boolean = false;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateFooterDto {
  @IsString()
  section: string;

  @IsString()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FooterLinkDto)
  links: FooterLinkDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  order?: number = 0;
}

export class UpdateFooterDto {
  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FooterLinkDto)
  links?: FooterLinkDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  order?: number;
}

export class FooterResponseDto {
  _id: string;
  section: string;
  title: string;
  links: Array<{
    label: string;
    url: string;
    isExternal: boolean;
    icon?: string;
    description?: string;
  }>;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
