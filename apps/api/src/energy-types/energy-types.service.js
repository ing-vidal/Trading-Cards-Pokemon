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
exports.EnergyTypesService = void 0;
const common_1 = require("@nestjs/common");
let EnergyTypesService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var EnergyTypesService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            EnergyTypesService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async findAll() {
            return this.prisma.energyType.findMany({
                include: {
                    _count: { select: { cards: true } },
                },
                orderBy: { name: 'asc' },
            });
        }
        async findOne(id) {
            const energyType = await this.prisma.energyType.findUnique({
                where: { id },
                include: { _count: { select: { cards: true } } },
            });
            if (!energyType)
                throw new common_1.NotFoundException(`Tipo de energía '${id}' no encontrado`);
            return energyType;
        }
        async create(dto) {
            const slug = dto.slug || dto.name.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            return this.prisma.energyType.create({
                data: { name: dto.name, slug, icon: dto.icon, color: dto.color },
            });
        }
        async update(id, dto) {
            await this.findOne(id);
            const data = {};
            if (dto.name !== undefined)
                data.name = dto.name;
            if (dto.slug !== undefined)
                data.slug = dto.slug;
            if (dto.icon !== undefined)
                data.icon = dto.icon;
            if (dto.color !== undefined)
                data.color = dto.color;
            return this.prisma.energyType.update({ where: { id }, data });
        }
        async remove(id) {
            await this.findOne(id);
            await this.prisma.energyType.delete({ where: { id } });
            return { message: 'Tipo de energía eliminado exitosamente' };
        }
        async upsertMany(types) {
            const results = [];
            for (const t of types) {
                const result = await this.prisma.energyType.upsert({
                    where: { slug: t.slug },
                    update: { name: t.name, icon: t.icon, color: t.color },
                    create: { name: t.name, slug: t.slug, icon: t.icon, color: t.color },
                });
                results.push(result);
            }
            return results;
        }
    };
    return EnergyTypesService = _classThis;
})();
exports.EnergyTypesService = EnergyTypesService;
