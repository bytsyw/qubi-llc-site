import { IsIn, IsOptional, IsString } from "class-validator";

export class CreateSmokeTestRunDto {
  @IsString()
  key!: string;

  @IsString()
  title!: string;

  @IsString()
  @IsIn(["passed", "failed", "blocked"])
  result!: string;

  @IsOptional()
  @IsString()
  note?: string;
}