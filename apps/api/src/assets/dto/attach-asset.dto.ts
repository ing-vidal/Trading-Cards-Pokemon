import { IsNotEmpty, IsString } from 'class-validator';

export class AttachAssetDto {
  @IsNotEmpty({ message: 'El ID del asset es obligatorio' })
  @IsString()
  assetId: string;

  @IsNotEmpty({ message: 'El ID de la carta es obligatorio' })
  @IsString()
  cardId: string;
}
