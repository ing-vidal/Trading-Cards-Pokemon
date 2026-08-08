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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RedisService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RedisService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger = new common_1.Logger(RedisService.name);
        client = null;
        onModuleInit() {
            const redisUrl = process.env.REDIS_URL;
            if (!redisUrl) {
                this.logger.warn('REDIS_URL no configurada; se omite la conexión con Redis.');
                return;
            }
            this.client = new ioredis_1.default(redisUrl, {
                lazyConnect: true,
                maxRetriesPerRequest: 3,
            });
            this.client.on('connect', () => {
                this.logger.log('Conexión con Redis establecida exitosamente.');
            });
            this.client.on('error', (err) => {
                this.logger.error('Error en Redis Client:', err.message);
            });
            this.client.connect().catch((err) => {
                this.logger.warn(`No se pudo conectar a Redis en ${redisUrl}: ${err.message}`);
            });
        }
        async onModuleDestroy() {
            if (this.client) {
                await this.client.quit();
                this.logger.log('Conexión con Redis cerrada.');
            }
        }
        getClient() {
            return this.client;
        }
        async get(key) {
            if (!this.client) {
                return null;
            }
            try {
                return await this.client.get(key);
            }
            catch {
                return null;
            }
        }
        async set(key, value, ttlSeconds) {
            if (!this.client) {
                return;
            }
            try {
                if (ttlSeconds) {
                    await this.client.set(key, value, 'EX', ttlSeconds);
                }
                else {
                    await this.client.set(key, value);
                }
            }
            catch (err) {
                this.logger.warn(`Error al guardar en Redis (${key}): ${err}`);
            }
        }
        async del(key) {
            if (!this.client) {
                return;
            }
            try {
                await this.client.del(key);
            }
            catch (err) {
                this.logger.warn(`Error al eliminar de Redis (${key}): ${err}`);
            }
        }
        async ping() {
            if (!this.client) {
                return false;
            }
            try {
                const res = await this.client.ping();
                return res === 'PONG';
            }
            catch {
                return false;
            }
        }
    };
    return RedisService = _classThis;
})();
exports.RedisService = RedisService;
