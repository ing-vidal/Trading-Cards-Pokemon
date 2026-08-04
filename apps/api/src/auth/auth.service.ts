import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RoleType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const defaultRole = await this.prisma.role.findUnique({
      where: { name: RoleType.CUSTOMER },
    });

    if (!defaultRole) {
      throw new UnauthorizedException('Rol por defecto no encontrado en la base de datos');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        roleId: defaultRole.id,
      },
      include: { role: true },
    });

    const tokens = await this.generateTokens(newUser.id, newUser.email, newUser.role.name);
    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role.name,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role.name);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
      ...tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET || 'super_secret_refresh_key_tcg_2026',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      });

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role.name);
      return tokens;
    } catch (err) {
      throw new UnauthorizedException('Refresh Token inválido o expirado');
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        role: { select: { id: true, name: true, description: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'super_secret_jwt_key_tcg_2026',
      expiresIn: '1d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET || 'super_secret_refresh_key_tcg_2026',
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
