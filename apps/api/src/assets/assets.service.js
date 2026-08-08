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
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let AssetsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AssetsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AssetsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        storage;
        constructor(prisma, storage) {
            this.prisma = prisma;
            this.storage = storage;
        }
        async uploadFile(file, dto) {
            if (!file) {
                throw new common_1.BadRequestException('No se ha proporcionado ningún archivo para cargar');
            }
            const fileResult = await this.storage.saveFile(file);
            const format = file.originalname.split('.').pop() || 'unknown';
            return this.prisma.asset.create({
                data: {
                    name: dto.name || file.originalname,
                    type: dto.type || client_1.AssetType.IMAGE,
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
        async findAll(type, cardId) {
            const where = {};
            if (type)
                where.type = type;
            if (cardId)
                where.cardId = cardId;
            return this.prisma.asset.findMany({
                where,
                include: { card: true },
                orderBy: { createdAt: 'desc' },
            });
        }
        async findOne(id) {
            const asset = await this.prisma.asset.findUnique({
                where: { id },
                include: { card: true },
            });
            if (!asset) {
                throw new common_1.NotFoundException(`Asset '${id}' no encontrado`);
            }
            return asset;
        }
        async attachToCard(dto) {
            const card = await this.prisma.card.findUnique({ where: { id: dto.cardId } });
            if (!card) {
                throw new common_1.NotFoundException(`Carta '${dto.cardId}' no encontrada`);
            }
            await this.findOne(dto.assetId);
            return this.prisma.asset.update({
                where: { id: dto.assetId },
                data: { cardId: dto.cardId },
                include: { card: true },
            });
        }
        async update(id, dto) {
            await this.findOne(id);
            return this.prisma.asset.update({
                where: { id },
                data: dto,
                include: { card: true },
            });
        }
        async remove(id) {
            const asset = await this.findOne(id);
            if (asset.path) {
                await this.storage.deleteFile(asset.path);
            }
            await this.prisma.asset.delete({ where: { id } });
            return { message: 'Asset y archivo asociado eliminados exitosamente' };
        }
    };
    return AssetsService = _classThis;
})();
exports.AssetsService = AssetsService;
