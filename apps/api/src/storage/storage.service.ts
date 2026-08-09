import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir = process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.resolve(process.cwd(), 'storage', 'uploads');

  onModuleInit() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      this.logger.log(`Directorio de almacenamiento creado en: ${this.uploadDir}`);
    }
  }

  async saveFile(file: Express.Multer.File): Promise<{ filename: string; relativePath: string; url: string }> {
    const fileExt = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
    const filePath = path.join(this.uploadDir, filename);

    await fs.promises.writeFile(filePath, file.buffer);
    const relativePath = `/uploads/${filename}`;
    const baseUrl = (process.env.API_URL || 'https://trading-cards-pokemon.onrender.com').replace(/\/$/, '');
    const url = `${baseUrl}/uploads/${filename}`;

    this.logger.log(`Archivo guardado exitosamente: ${filename} (${file.size} bytes)`);

    return {
      filename,
      relativePath,
      url,
    };
  }

  async deleteFile(filename: string): Promise<boolean> {
    const filePath = path.join(this.uploadDir, path.basename(filename));
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        this.logger.log(`Archivo eliminado de disco: ${filename}`);
        return true;
      }
      return false;
    } catch (err) {
      this.logger.error(`Error al eliminar archivo ${filename}:`, err);
      return false;
    }
  }
}
