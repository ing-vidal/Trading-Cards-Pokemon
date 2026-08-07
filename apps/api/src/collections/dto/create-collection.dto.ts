import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateCollectionDto {
  @IsNotEmpty({ message: 'El nombre de la colección es obligatorio' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsNotEmpty({ message: 'El código de la colección es obligatorio' })
  @IsString()
  code: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de lanzamiento debe ser una fecha ISO8601 válida' })
  releaseDate?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  description?: string;
}
