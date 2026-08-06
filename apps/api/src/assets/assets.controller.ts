import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AttachAssetDto } from './dto/attach-asset.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType, AssetType } from '@prisma/client';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  async findAll(@Query('type') type?: AssetType, @Query('cardId') cardId?: string) {
    return this.assetsService.findAll(type, cardId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  // Temporary import helper: allow uploads without JWT auth so CSV/XLSX card imports can attach local images.
  // Remove this override when the admin app has a proper login/token flow.
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() dto: CreateAssetDto) {
    return this.assetsService.uploadFile(file, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.CONTENT_MANAGER, RoleType.DESIGNER)
  @Post('attach')
  async attachToCard(@Body() dto: AttachAssetDto) {
    return this.assetsService.attachToCard(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.CONTENT_MANAGER, RoleType.DESIGNER)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAssetDto) {
    return this.assetsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.CONTENT_MANAGER)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }
}
