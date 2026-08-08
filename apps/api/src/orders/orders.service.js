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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let OrdersService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var OrdersService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            OrdersService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async create(userId, dto) {
            if (!dto.items || dto.items.length === 0) {
                throw new common_1.BadRequestException('El pedido debe incluir al menos un producto');
            }
            return this.prisma.$transaction(async (tx) => {
                let totalAmount = 0;
                const orderItemsData = [];
                for (const item of dto.items) {
                    const product = await tx.product.findUnique({
                        where: { id: item.productId },
                        include: { card: true },
                    });
                    if (!product) {
                        throw new common_1.NotFoundException(`Producto '${item.productId}' no encontrado`);
                    }
                    if (product.stock < item.quantity) {
                        throw new common_1.BadRequestException(`Stock insuficiente para '${product.card.name}' (${product.condition}). Solicitado: ${item.quantity}, Disponible: ${product.stock}`);
                    }
                    const newStock = product.stock - item.quantity;
                    await tx.product.update({
                        where: { id: product.id },
                        data: {
                            stock: newStock,
                            status: newStock === 0 ? 'OUT_OF_STOCK' : 'AVAILABLE',
                        },
                    });
                    const itemTotal = Number(product.price) * item.quantity;
                    totalAmount += itemTotal;
                    orderItemsData.push({
                        productId: product.id,
                        quantity: item.quantity,
                        price: Number(product.price),
                    });
                }
                return tx.order.create({
                    data: {
                        userId,
                        total: totalAmount,
                        status: client_1.OrderStatus.PENDING,
                        items: {
                            create: orderItemsData,
                        },
                    },
                    include: {
                        items: {
                            include: {
                                product: {
                                    include: { card: true },
                                },
                            },
                        },
                    },
                });
            });
        }
        async findUserOrders(userId) {
            return this.prisma.order.findMany({
                where: { userId },
                include: {
                    items: {
                        include: {
                            product: {
                                include: { card: true },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        }
        async findOne(id) {
            const order = await this.prisma.order.findUnique({
                where: { id },
                include: {
                    user: { select: { id: true, email: true, name: true } },
                    items: {
                        include: {
                            product: {
                                include: { card: true },
                            },
                        },
                    },
                },
            });
            if (!order) {
                throw new common_1.NotFoundException(`Pedido '${id}' no encontrado`);
            }
            return order;
        }
        async updateStatus(id, dto) {
            await this.findOne(id);
            return this.prisma.order.update({
                where: { id },
                data: { status: dto.status },
                include: { items: true },
            });
        }
    };
    return OrdersService = _classThis;
})();
exports.OrdersService = OrdersService;
