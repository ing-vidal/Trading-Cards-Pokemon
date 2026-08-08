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
exports.PresetsService = void 0;
const common_1 = require("@nestjs/common");
const shaders_1 = require("@tcg/shaders");
let PresetsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var PresetsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PresetsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async findAll() {
            const dbPresets = await this.prisma.visualPreset.findMany({
                include: {
                    _count: { select: { rarities: true, cardEffects: true } },
                },
                orderBy: { name: 'asc' },
            });
            return {
                dbPresets,
                glslBuiltInPresets: shaders_1.ALL_PRESETS,
            };
        }
        async findOne(id) {
            const preset = await this.prisma.visualPreset.findUnique({
                where: { id },
                include: {
                    rarities: true,
                    cardEffects: true,
                },
            });
            if (!preset) {
                throw new common_1.NotFoundException(`Preset visual '${id}' no encontrado`);
            }
            return preset;
        }
        async create(dto) {
            return this.prisma.visualPreset.create({
                data: {
                    name: dto.name,
                    shader: dto.shader,
                    material: dto.material,
                    foil: dto.foil,
                    particles: dto.particles,
                    animation: dto.animation,
                    intensity: dto.intensity ?? 50,
                },
            });
        }
        async update(id, dto) {
            await this.findOne(id);
            return this.prisma.visualPreset.update({
                where: { id },
                data: dto,
            });
        }
        async remove(id) {
            await this.findOne(id);
            await this.prisma.visualPreset.delete({ where: { id } });
            return { message: 'Preset visual eliminado exitosamente' };
        }
    };
    return PresetsService = _classThis;
})();
exports.PresetsService = PresetsService;
