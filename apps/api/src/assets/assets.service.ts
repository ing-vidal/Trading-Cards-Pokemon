import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AttachAssetDto } from './dto/attach-asset.dto';
import { AssetType } from '@prisma/client';

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async uploadFile(file: Express.Multer.File, dto: CreateAssetDto) {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo para cargar');
    }

    const fileResult = await this.storage.saveFile(file);

    const format = file.originalname.split('.').pop() || 'unknown';

    if (dto.cardId) {
      const existingAsset = await this.prisma.asset.findFirst({
        where: { cardId: dto.cardId, type: AssetType.IMAGE },
      });

      if (existingAsset) {
        if (existingAsset.path) {
          await this.storage.deleteFile(existingAsset.path);
        }
        return this.prisma.asset.update({
          where: { id: existingAsset.id },
          data: {
            name: dto.name || file.originalname,
            url: fileResult.url,
            path: fileResult.relativePath,
            size: file.size,
            format: format.toLowerCase(),
          },
          include: { card: true },
        });
      }
    }

    return this.prisma.asset.create({
      data: {
        name: dto.name || file.originalname,
        type: dto.type || AssetType.IMAGE,
        url: fileResult.url,
        path: fileResult.relativePath,
        size: file.size,
        format: format.toLowerCase(),
        version: dto.version || '1.0.0',
        cardId: dto.cardId || null,
      },
      include: {
        card: true,
      },
    });
  }

  async findAll(type?: AssetType, cardId?: string) {
    const where: any = {};
    if (type) where.type = type;
    if (cardId) where.cardId = cardId;

    return this.prisma.asset.findMany({
      where,
      include: { card: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: { card: true },
    });

    if (!asset) {
      throw new NotFoundException(`Asset '${id}' no encontrado`);
    }

    return asset;
  }

  async attachToCard(dto: AttachAssetDto) {
    const card = await this.prisma.card.findUnique({ where: { id: dto.cardId } });
    if (!card) {
      throw new NotFoundException(`Carta '${dto.cardId}' no encontrada`);
    }

    await this.findOne(dto.assetId);

    return this.prisma.asset.update({
      where: { id: dto.assetId },
      data: { cardId: dto.cardId },
      include: { card: true },
    });
  }

  async update(id: string, dto: UpdateAssetDto) {
    await this.findOne(id);
    return this.prisma.asset.update({
      where: { id },
      data: dto,
      include: { card: true },
    });
  }

  async remove(id: string) {
    const asset = await this.findOne(id);

    if (asset.path) {
      await this.storage.deleteFile(asset.path);
    }

    await this.prisma.asset.delete({ where: { id } });
    return { message: 'Asset y archivo asociado eliminados exitosamente' };
  }
}
