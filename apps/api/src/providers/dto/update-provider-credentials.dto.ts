import { IsIn, IsOptional, IsString } from "class-validator";

export class UpdateProviderCredentialsDto {
  @IsIn(["APPLE", "GOOGLE"])
  provider!: "APPLE" | "GOOGLE";

  @IsOptional()
  @IsString()
  accountLabel?: string;

  @IsString()
  payload!: string;
}