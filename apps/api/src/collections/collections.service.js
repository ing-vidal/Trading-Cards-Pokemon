"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionsService = void 0;
const common_1 = require("@nestjs/common");
let CollectionsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CollectionsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CollectionsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        redis;
        constructor(prisma, redis) {
            this.prisma = prisma;
            this.redis = redis;
        }
        async findAll() {
            const cached = await this.redis.get('collections:all');
            if (cached) {
                return JSON.parse(cached);
            }
            const collections = await this.prisma.collection.findMany({
                include: {
                    _count: {
                        select: { cards: true },
                    },
                },
                orderBy: { releaseDate: 'desc' },
            });
            await this.redis.set('collections:all', JSON.stringify(collections), 3600); // 1 hora
            return collections;
        }
        async findOne(id) {
            const collection = await this.prisma.collection.findFirst({
                where: {
                    OR: [{ id }, { slug: id }, { code: id }],
                },
                include: {
                    cards: {
                        take: 20,
                        include: { rarity: true, assets: true },
                    },
                    _count: {
                        select: { cards: true },
                    },
                },
            });
            if (!collection) {
                throw new common_1.NotFoundException(`Colección '${id}' no encontrada`);
            }
            return collection;
        }
        async create(dto) {
            const slug = (dto.slug || dto.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const normalizedImages = (dto.images || []).filter((item) => Boolean(item)).slice(0, 3);
            const logoValue = dto.logo
                || (normalizedImages.length > 0 ? (normalizedImages.length > 1 ? JSON.stringify(normalizedImages) : normalizedImages[0]) : undefined);
            const existing = await this.prisma.collection.findFirst({
                where: {
                    OR: [{ slug }, { code: dto.code }],
                },
            });
            if (existing) {
                throw new common_1.ConflictException('Ya existe una colección con ese slug o código');
            }
            const collection = await this.prisma.collection.create({
                data: {
                    name: dto.name,
                    slug,
                    code: dto.code.toUpperCase(),
                    releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : null,
                    logo: logoValue,
                    description: dto.description,
                },
            });
            await this.redis.del('collections:all');
            return collection;
        }
        async update(id, dto) {
            await this.findOne(id);
            const { images, ...rest } = dto;
            const normalizedImages = (images || []).filter((item) => Boolean(item)).slice(0, 3);
            const logoValue = dto.logo
                ?? (normalizedImages.length > 0 ? (normalizedImages.length > 1 ? JSON.stringify(normalizedImages) : normalizedImages[0]) : undefined);
            const updated = await this.prisma.collection.update({
                where: { id },
                data: {
                    ...rest,
                    logo: logoValue,
                    releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : undefined,
                },
            });
            await this.redis.del('collections:all');
            return updated;
        }
        async remove(id) {
            await this.findOne(id);
            await this.prisma.collection.delete({ where: { id } });
            await this.redis.del('collections:all');
            return { message: 'Colección eliminada exitosamente' };
        }
    };
    return CollectionsService = _classThis;
})();
exports.CollectionsService = CollectionsService;
