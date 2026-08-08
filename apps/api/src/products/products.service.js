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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let ProductsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ProductsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ProductsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async findAll(cardId, condition, status) {
            const where = {};
            if (cardId)
                where.cardId = cardId;
            if (condition)
                where.condition = condition;
            if (status)
                where.status = status;
            return this.prisma.product.findMany({
                where,
                include: {
                    card: {
                        include: { collection: true, rarity: true },
                    },
                },
                orderBy: { price: 'asc' },
            });
        }
        async findOne(id) {
            const product = await this.prisma.product.findUnique({
                where: { id },
                include: {
                    card: {
                        include: { collection: true, rarity: true, assets: true },
                    },
                },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Producto '${id}' no encontrado`);
            }
            return product;
        }
        async create(dto) {
            const card = await this.prisma.card.findUnique({ where: { id: dto.cardId } });
            if (!card) {
                throw new common_1.NotFoundException(`Carta '${dto.cardId}' no encontrada`);
            }
            const sku = dto.sku || `SKU-${card.slug.toUpperCase()}-${dto.condition}-${Date.now().toString().slice(-4)}`;
            return this.prisma.product.create({
                data: {
                    cardId: dto.cardId,
                    sku,
                    condition: dto.condition,
                    price: dto.price,
                    stock: dto.stock,
                    status: dto.status || client_1.ProductStatus.AVAILABLE,
                },
                include: { card: true },
            });
        }
        async update(id, dto) {
            await this.findOne(id);
            const data = { ...dto };
            if (dto.stock === 0) {
                data.status = client_1.ProductStatus.OUT_OF_STOCK;
            }
            return this.prisma.product.update({
                where: { id },
                data,
                include: { card: true },
            });
        }
        async remove(id) {
            await this.findOne(id);
            await this.prisma.product.delete({ where: { id } });
            return { message: 'Producto eliminado del marketplace exitosamente' };
        }
    };
    return ProductsService = _classThis;
})();
exports.ProductsService = ProductsService;
