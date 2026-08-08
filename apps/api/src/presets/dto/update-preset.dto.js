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
exports.UpdateVisualPresetDto = void 0;
const class_validator_1 = require("class-validator");
let UpdateVisualPresetDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _shader_decorators;
    let _shader_initializers = [];
    let _shader_extraInitializers = [];
    let _material_decorators;
    let _material_initializers = [];
    let _material_extraInitializers = [];
    let _foil_decorators;
    let _foil_initializers = [];
    let _foil_extraInitializers = [];
    let _particles_decorators;
    let _particles_initializers = [];
    let _particles_extraInitializers = [];
    let _animation_decorators;
    let _animation_initializers = [];
    let _animation_extraInitializers = [];
    let _intensity_decorators;
    let _intensity_initializers = [];
    let _intensity_extraInitializers = [];
    return class UpdateVisualPresetDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _shader_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _material_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _foil_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _particles_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _animation_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _intensity_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(0), (0, class_validator_1.Max)(100)];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _shader_decorators, { kind: "field", name: "shader", static: false, private: false, access: { has: obj => "shader" in obj, get: obj => obj.shader, set: (obj, value) => { obj.shader = value; } }, metadata: _metadata }, _shader_initializers, _shader_extraInitializers);
            __esDecorate(null, null, _material_decorators, { kind: "field", name: "material", static: false, private: false, access: { has: obj => "material" in obj, get: obj => obj.material, set: (obj, value) => { obj.material = value; } }, metadata: _metadata }, _material_initializers, _material_extraInitializers);
            __esDecorate(null, null, _foil_decorators, { kind: "field", name: "foil", static: false, private: false, access: { has: obj => "foil" in obj, get: obj => obj.foil, set: (obj, value) => { obj.foil = value; } }, metadata: _metadata }, _foil_initializers, _foil_extraInitializers);
            __esDecorate(null, null, _particles_decorators, { kind: "field", name: "particles", static: false, private: false, access: { has: obj => "particles" in obj, get: obj => obj.particles, set: (obj, value) => { obj.particles = value; } }, metadata: _metadata }, _particles_initializers, _particles_extraInitializers);
            __esDecorate(null, null, _animation_decorators, { kind: "field", name: "animation", static: false, private: false, access: { has: obj => "animation" in obj, get: obj => obj.animation, set: (obj, value) => { obj.animation = value; } }, metadata: _metadata }, _animation_initializers, _animation_extraInitializers);
            __esDecorate(null, null, _intensity_decorators, { kind: "field", name: "intensity", static: false, private: false, access: { has: obj => "intensity" in obj, get: obj => obj.intensity, set: (obj, value) => { obj.intensity = value; } }, metadata: _metadata }, _intensity_initializers, _intensity_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        shader = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _shader_initializers, void 0));
        material = (__runInitializers(this, _shader_extraInitializers), __runInitializers(this, _material_initializers, void 0));
        foil = (__runInitializers(this, _material_extraInitializers), __runInitializers(this, _foil_initializers, void 0));
        particles = (__runInitializers(this, _foil_extraInitializers), __runInitializers(this, _particles_initializers, void 0));
        animation = (__runInitializers(this, _particles_extraInitializers), __runInitializers(this, _animation_initializers, void 0));
        intensity = (__runInitializers(this, _animation_extraInitializers), __runInitializers(this, _intensity_initializers, void 0));
        constructor() {
            __runInitializers(this, _intensity_extraInitializers);
        }
    };
})();
exports.UpdateVisualPresetDto = UpdateVisualPresetDto;
