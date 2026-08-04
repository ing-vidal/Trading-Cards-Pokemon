import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'El nombre de la categoría es obligatorio' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'El slug de la categoría es obligatorio' })
  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;
}
