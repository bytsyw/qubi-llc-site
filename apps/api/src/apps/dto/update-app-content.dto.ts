import { IsArray, IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateAppContentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  shortName?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  longDescription?: string;

  @IsOptional()
  @IsArray()
  highlights?: string[];

  @IsOptional()
  @IsArray()
  screenshots?: string[];

  @IsOptional()
  @IsArray()
  features?: string[];

  @IsOptional()
  @IsArray()
  faqs?: Array<{ question: string; answer: string }>;

  @IsOptional()
  @IsArray()
  requirements?: string[];

  @IsOptional()
  @IsArray()
  terms?: string[];

  @IsOptional()
  @IsArray()
  steps?: string[];

  @IsOptional()
  @IsArray()
  scores?: Array<{ label: string; value: number }>;

  @IsOptional()
  @IsString()
  screenGradient?: string;

  @IsOptional()
  @IsString()
  glowClass?: string;

  @IsOptional()
  @IsBoolean()
  dark?: boolean;
}