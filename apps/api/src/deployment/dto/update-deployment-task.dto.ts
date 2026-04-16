import { IsIn, IsOptional, IsString } from "class-validator";

export class UpdateDeploymentTaskDto {
  @IsOptional()
  @IsString()
  note?: string;

  @IsString()
  @IsIn(["healthy", "warning", "critical", "pending"])
  status!: string;
}