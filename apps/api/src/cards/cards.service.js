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
exports.CardsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let CardsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CardsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CardsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async findAll(filters) {
            const page = Number(filters.page) || 1;
            const limit = Number(filters.limit) || 50;
            const skip = (page - 1) * limit;
            const where = {};
            if (filters.search) {
                where.OR = [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    { number: { contains: filters.search, mode: 'insensitive' } },
                    { description: { contains: filters.search, mode: 'insensitive' } },
                ];
            }
            if (filters.collectionId)
                where.collectionId = filters.collectionId;
            if (filters.rarityId)
                where.rarityId = filters.rarityId;
            if (filters.categoryId)
                where.categoryId = filters.categoryId;
            if (filters.energyTypeId)
                where.energyTypeId = filters.energyTypeId;
            if (filters.cardType)
                where.cardType = filters.cardType;
            if (filters.status)
                where.status = filters.status;
            const [cards, total] = await Promise.all([
                this.prisma.card.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        collection: true,
                        rarity: { include: { preset: true } },
                        category: true,
                        energyType: true,
                        assets: true,
                        products: {
                            take: 5,
                            select: { id: true, condition: true, price: true, stock: true, status: true },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                this.prisma.card.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                data: cards,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages,
                },
            };
        }
        async findOne(id) {
            const card = await this.prisma.card.findFirst({
                where: {
                    OR: [{ id }, { slug: id }],
                },
                include: {
                    collection: true,
                    rarity: { include: { preset: true } },
                    category: true,
                    energyType: true,
                    assets: true,
                    effects: { include: { preset: true } },
                    products: true,
                },
            });
            if (!card) {
                throw new common_1.NotFoundException(`Carta '${id}' no encontrada`);
            }
            return card;
        }
        async create(dto) {
            if (dto.cardType !== 'POKEMON' && dto.energyTypeId) {
                throw new common_1.BadRequestException('Solo las cartas Pokémon pueden tener tipo de energía');
            }
            const baseSlug = (dto.slug || dto.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
            // Resolve or fallback Collection, Rarity, Category
            let collectionId = dto.collectionId;
            if (!collectionId) {
                const col = await this.prisma.collection.findFirst();
                if (col) {
                    collectionId = col.id;
                }
                else {
                    const newCol = await this.prisma.collection.create({
                        data: {
                            name: 'Default Collection',
                            slug: 'default-collection',
                            code: 'DEFAULT',
                            description: 'Auto-created default collection',
                        },
                    });
                    collectionId = newCol.id;
                }
            }
            let rarityId = dto.rarityId;
            if (!rarityId) {
                const rar = await this.prisma.rarity.findFirst();
                if (rar) {
                    rarityId = rar.id;
                }
                else {
                    const newRar = await this.prisma.rarity.create({
                        data: {
                            name: 'Common',
                            level: client_1.RarityLevel.STAR_1,
                            color: '#a855f7',
                        },
                    });
                    rarityId = newRar.id;
                }
            }
            const card = await this.prisma.card.create({
                data: {
                    name: dto.name,
                    slug,
                    number: dto.number,
                    game: dto.game || 'Pokemon TCG',
                    cardType: dto.cardType || 'POKEMON',
                    language: dto.language || 'English',
                    description: dto.description || `Carta de ${dto.name}`,
                    hp: dto.hp || 100,
                    status: dto.status || 'PUBLISHED',
                    collectionId,
                    rarityId,
                    categoryId: dto.categoryId,
                    energyTypeId: dto.energyTypeId || undefined,
                },
                include: {
                    collection: true,
                    rarity: true,
                    category: true,
                    energyType: true,
                    assets: true,
                    products: true,
                },
            });
            // Create Image Asset if provided
            if (dto.imageUrl) {
                await this.prisma.asset.create({
                    data: {
                        name: `${dto.name} Artwork`,
                        type: client_1.AssetType.IMAGE,
                        url: dto.imageUrl,
                        size: dto.imageUrl.length,
                        format: 'png',
                        cardId: card.id,
                    },
                });
            }
            // Create Default Product Listing if price provided
            if (dto.price) {
                await this.prisma.product.create({
                    data: {
                        cardId: card.id,
                        sku: `SKU-${slug.toUpperCase()}`,
                        condition: client_1.ProductCondition.NEAR_MINT,
                        price: dto.price,
                        stock: dto.stock ?? 10,
                        status: client_1.ProductStatus.AVAILABLE,
                    },
                });
            }
            return this.findOne(card.id);
        }
        async update(id, dto) {
            const currentCard = await this.findOne(id);
            const nextCardType = dto.cardType ?? currentCard.cardType;
            if (nextCardType !== 'POKEMON' && dto.energyTypeId) {
                throw new common_1.BadRequestException('Solo las cartas Pokémon pueden tener tipo de energía');
            }
            const dataToUpdate = {};
            if (dto.name)
                dataToUpdate.name = dto.name;
            if (dto.number)
                dataToUpdate.number = dto.number;
            if (dto.cardType !== undefined)
                dataToUpdate.cardType = dto.cardType;
            if (dto.hp !== undefined)
                dataToUpdate.hp = dto.hp;
            if (dto.status)
                dataToUpdate.status = dto.status;
            if (dto.collectionId)
                dataToUpdate.collectionId = dto.collectionId;
            if (dto.rarityId)
                dataToUpdate.rarityId = dto.rarityId;
            if (dto.energyTypeId !== undefined || (dto.cardType !== undefined && nextCardType !== 'POKEMON')) {
                dataToUpdate.energyTypeId = nextCardType === 'POKEMON' ? (dto.energyTypeId || null) : null;
            }
            if (dto.description)
                dataToUpdate.description = dto.description;
            const card = await this.prisma.card.update({
                where: { id },
                data: dataToUpdate,
            });
            if (dto.imageUrl) {
                const existingAsset = await this.prisma.asset.findFirst({ where: { cardId: id } });
                if (existingAsset) {
                    await this.prisma.asset.update({
                        where: { id: existingAsset.id },
                        data: { url: dto.imageUrl },
                    });
                }
                else {
                    await this.prisma.asset.create({
                        data: {
                            name: `${card.name} Artwork`,
                            type: client_1.AssetType.IMAGE,
                            url: dto.imageUrl,
                            size: dto.imageUrl.length,
                            format: 'png',
                            cardId: card.id,
                        },
                    });
                }
            }
            if (dto.price !== undefined || dto.stock !== undefined) {
                const existingProduct = await this.prisma.product.findFirst({ where: { cardId: id } });
                const productData = {};
                if (dto.price !== undefined)
                    productData.price = dto.price;
                if (dto.stock !== undefined) {
                    productData.stock = dto.stock;
                    productData.status = dto.stock > 0 ? client_1.ProductStatus.AVAILABLE : client_1.ProductStatus.OUT_OF_STOCK;
                }
                if (existingProduct) {
                    await this.prisma.product.update({
                        where: { id: existingProduct.id },
                        data: productData,
                    });
                }
                else {
                    await this.prisma.product.create({
                        data: {
                            cardId: card.id,
                            sku: `SKU-${card.slug.toUpperCase()}`,
                            condition: client_1.ProductCondition.NEAR_MINT,
                            price: dto.price ?? 49.99,
                            stock: dto.stock ?? 10,
                            status: (dto.stock ?? 10) > 0 ? client_1.ProductStatus.AVAILABLE : client_1.ProductStatus.OUT_OF_STOCK,
                        },
                    });
                }
            }
            return this.findOne(id);
        }
        async remove(id) {
            await this.findOne(id);
            await this.prisma.asset.deleteMany({ where: { cardId: id } });
            await this.prisma.product.deleteMany({ where: { cardId: id } });
            await this.prisma.cardEffect.deleteMany({ where: { cardId: id } });
            await this.prisma.card.delete({ where: { id } });
            return { message: 'Carta eliminada exitosamente' };
        }
        async removeMany(collectionId) {
            const where = collectionId ? { collectionId } : undefined;
            const result = await this.prisma.$transaction(async (transaction) => {
                const cards = await transaction.card.findMany({ where, select: { id: true } });
                const cardIds = cards.map((card) => card.id);
                if (cardIds.length > 0) {
                    await transaction.asset.deleteMany({ where: { cardId: { in: cardIds } } });
                    await transaction.product.deleteMany({ where: { cardId: { in: cardIds } } });
                    await transaction.cardEffect.deleteMany({ where: { cardId: { in: cardIds } } });
                    await transaction.card.deleteMany({ where: { id: { in: cardIds } } });
                }
                return cardIds.length;
            });
            return {
                message: collectionId ? 'Colección vaciada exitosamente' : 'Catálogo vaciado exitosamente',
                deleted: result,
            };
        }
    };
    return CardsService = _classThis;
})();
exports.CardsService = CardsService;
