"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
let HealthController = (() => {
    let _classDecorators = [(0, common_1.Controller)('health')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _checkGeneralHealth_decorators;
    let _checkDatabaseHealth_decorators;
    let _checkRedisHealth_decorators;
    var HealthController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _checkGeneralHealth_decorators = [(0, common_1.Get)()];
            _checkDatabaseHealth_decorators = [(0, common_1.Get)('db')];
            _checkRedisHealth_decorators = [(0, common_1.Get)('redis')];
            __esDecorate(this, null, _checkGeneralHealth_decorators, { kind: "method", name: "checkGeneralHealth", static: false, private: false, access: { has: obj => "checkGeneralHealth" in obj, get: obj => obj.checkGeneralHealth }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _checkDatabaseHealth_decorators, { kind: "method", name: "checkDatabaseHealth", static: false, private: false, access: { has: obj => "checkDatabaseHealth" in obj, get: obj => obj.checkDatabaseHealth }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _checkRedisHealth_decorators, { kind: "method", name: "checkRedisHealth", static: false, private: false, access: { has: obj => "checkRedisHealth" in obj, get: obj => obj.checkRedisHealth }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            HealthController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prismaService = __runInitializers(this, _instanceExtraInitializers);
        redisService;
        constructor(prismaService, redisService) {
            this.prismaService = prismaService;
            this.redisService = redisService;
        }
        async checkGeneralHealth() {
            return {
                status: 'ok',
                service: 'TCG Vision API',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
            };
        }
        async checkDatabaseHealth() {
            const isDbConnected = await this.prismaService.ping();
            return {
                service: 'PostgreSQL Database',
                status: isDbConnected ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString(),
            };
        }
        async checkRedisHealth() {
            const isRedisConnected = await this.redisService.ping();
            return {
                service: 'Redis Cache',
                status: isRedisConnected ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString(),
            };
        }
    };
    return HealthController = _classThis;
})();
exports.HealthController = HealthController;
