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
exports.RaritiesService = void 0;
const common_1 = require("@nestjs/common");
const LEVEL_ORDER = {
    COMMON: 0, UNCOMMON: 1, RARE: 2, DOUBLE_RARE: 3,
    STAR_1: 4, STAR_2: 5, STAR_3: 6,
    IMMERSIVE: 7, DOUBLE_IMMERSIVE: 8, CROWN: 9, PROMO: 10,
};
let RaritiesService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RaritiesService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RaritiesService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async findAll() {
            const rarities = await this.prisma.rarity.findMany({
                include: {
                    preset: true,
                    _count: { select: { cards: true } },
                },
            });
            return rarities.sort((a, b) => (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99));
        }
        async findOne(id) {
            const rarity = await this.prisma.rarity.findUnique({
                where: { id },
                include: {
                    preset: true,
                    _count: { select: { cards: true } },
                },
            });
            if (!rarity) {
                throw new common_1.NotFoundException(`Rareza '${id}' no encontrada`);
            }
            return rarity;
        }
        async create(dto) {
            const existing = await this.prisma.rarity.findUnique({
                where: { level: dto.level },
            });
            if (existing) {
                throw new common_1.ConflictException(`Ya existe una rareza configurada para el nivel ${dto.level}`);
            }
            return this.prisma.rarity.create({
                data: {
                    name: dto.name,
                    level: dto.level,
                    icon: dto.icon,
                    color: dto.color,
                    presetId: dto.presetId,
                },
                include: { preset: true },
            });
        }
        async update(id, dto) {
            await this.findOne(id);
            return this.prisma.rarity.update({
                where: { id },
                data: dto,
                include: { preset: true },
            });
        }
        async remove(id) {
            await this.findOne(id);
            await this.prisma.rarity.delete({ where: { id } });
            return { message: 'Rareza eliminada exitosamente' };
        }
    };
    return RaritiesService = _classThis;
})();
exports.RaritiesService = RaritiesService;
