"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
let AuthService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuthService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        jwtService;
        constructor(prisma, jwtService) {
            this.prisma = prisma;
            this.jwtService = jwtService;
        }
        async register(dto) {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: dto.email.toLowerCase() },
            });
            if (existingUser) {
                throw new common_1.ConflictException('El correo electrónico ya está registrado');
            }
            const defaultRole = await this.prisma.role.findUnique({
                where: { name: client_1.RoleType.CUSTOMER },
            });
            if (!defaultRole) {
                throw new common_1.UnauthorizedException('Rol por defecto no encontrado en la base de datos');
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
        async login(dto) {
            const user = await this.prisma.user.findUnique({
                where: { email: dto.email.toLowerCase() },
                include: { role: true },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Credenciales inválidas');
            }
            const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Credenciales inválidas');
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
        async refreshToken(dto) {
            try {
                const payload = this.jwtService.verify(dto.refreshToken, {
                    secret: process.env.REFRESH_TOKEN_SECRET || 'super_secret_refresh_key_tcg_2026',
                });
                const user = await this.prisma.user.findUnique({
                    where: { id: payload.sub },
                    include: { role: true },
                });
                if (!user) {
                    throw new common_1.UnauthorizedException('Usuario no encontrado');
                }
                const tokens = await this.generateTokens(user.id, user.email, user.role.name);
                return tokens;
            }
            catch (err) {
                throw new common_1.UnauthorizedException('Refresh Token inválido o expirado');
            }
        }
        async getProfile(userId) {
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
                throw new common_1.UnauthorizedException('Usuario no encontrado');
            }
            return user;
        }
        async generateTokens(userId, email, role) {
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
    };
    return AuthService = _classThis;
})();
exports.AuthService = AuthService;
