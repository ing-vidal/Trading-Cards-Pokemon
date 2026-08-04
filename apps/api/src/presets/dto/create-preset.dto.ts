import { IsNotEmpty, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class CreateVisualPresetDto {
  @IsNotEmpty({ message: 'El nombre del preset es obligatorio' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'El nombre del shader GLSL es obligatorio' })
  @IsString()
  shader: string;

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
  intensity?: number = 50;
}
