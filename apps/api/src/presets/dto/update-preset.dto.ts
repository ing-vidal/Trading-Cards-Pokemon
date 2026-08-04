import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class UpdateVisualPresetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  shader?: string;

  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @IsString()
  foil?: string;

  @IsOptional()
  @IsString()
  particles?: string;

  @IsOptional()
  @IsString()
  animation?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  intensity?: number;
}
