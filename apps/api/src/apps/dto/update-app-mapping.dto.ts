import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateAppMappingDto {
  @IsOptional()
  @IsString()
  storeAppId?: string;

  @IsOptional()
  @IsString()
  bundleId?: string;

  @IsOptional()
  @IsString()
  packageName?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  discovered?: boolean;
}
