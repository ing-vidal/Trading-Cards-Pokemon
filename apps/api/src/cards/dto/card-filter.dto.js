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
exports.CardFilterDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
let CardFilterDto = (() => {
    let _search_decorators;
    let _search_initializers = [];
    let _search_extraInitializers = [];
    let _collectionId_decorators;
    let _collectionId_initializers = [];
    let _collectionId_extraInitializers = [];
    let _rarityId_decorators;
    let _rarityId_initializers = [];
    let _rarityId_extraInitializers = [];
    let _categoryId_decorators;
    let _categoryId_initializers = [];
    let _categoryId_extraInitializers = [];
    let _energyTypeId_decorators;
    let _energyTypeId_initializers = [];
    let _energyTypeId_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _game_decorators;
    let _game_initializers = [];
    let _game_extraInitializers = [];
    let _cardType_decorators;
    let _cardType_initializers = [];
    let _cardType_extraInitializers = [];
    let _language_decorators;
    let _language_initializers = [];
    let _language_extraInitializers = [];
    let _page_decorators;
    let _page_initializers = [];
    let _page_extraInitializers = [];
    let _limit_decorators;
    let _limit_initializers = [];
    let _limit_extraInitializers = [];
    let _sortBy_decorators;
    let _sortBy_initializers = [];
    let _sortBy_extraInitializers = [];
    let _sortOrder_decorators;
    let _sortOrder_initializers = [];
    let _sortOrder_extraInitializers = [];
    return class CardFilterDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _search_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _collectionId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _rarityId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _categoryId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _energyTypeId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _status_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(client_1.CardStatus)];
            _game_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _cardType_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(client_1.CardType)];
            _language_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _page_decorators = [(0, class_validator_1.IsOptional)(), (0, class_transformer_1.Type)(() => Number), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(1)];
            _limit_decorators = [(0, class_validator_1.IsOptional)(), (0, class_transformer_1.Type)(() => Number), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(1)];
            _sortBy_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _sortOrder_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _search_decorators, { kind: "field", name: "search", static: false, private: false, access: { has: obj => "search" in obj, get: obj => obj.search, set: (obj, value) => { obj.search = value; } }, metadata: _metadata }, _search_initializers, _search_extraInitializers);
            __esDecorate(null, null, _collectionId_decorators, { kind: "field", name: "collectionId", static: false, private: false, access: { has: obj => "collectionId" in obj, get: obj => obj.collectionId, set: (obj, value) => { obj.collectionId = value; } }, metadata: _metadata }, _collectionId_initializers, _collectionId_extraInitializers);
            __esDecorate(null, null, _rarityId_decorators, { kind: "field", name: "rarityId", static: false, private: false, access: { has: obj => "rarityId" in obj, get: obj => obj.rarityId, set: (obj, value) => { obj.rarityId = value; } }, metadata: _metadata }, _rarityId_initializers, _rarityId_extraInitializers);
            __esDecorate(null, null, _categoryId_decorators, { kind: "field", name: "categoryId", static: false, private: false, access: { has: obj => "categoryId" in obj, get: obj => obj.categoryId, set: (obj, value) => { obj.categoryId = value; } }, metadata: _metadata }, _categoryId_initializers, _categoryId_extraInitializers);
            __esDecorate(null, null, _energyTypeId_decorators, { kind: "field", name: "energyTypeId", static: false, private: false, access: { has: obj => "energyTypeId" in obj, get: obj => obj.energyTypeId, set: (obj, value) => { obj.energyTypeId = value; } }, metadata: _metadata }, _energyTypeId_initializers, _energyTypeId_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _game_decorators, { kind: "field", name: "game", static: false, private: false, access: { has: obj => "game" in obj, get: obj => obj.game, set: (obj, value) => { obj.game = value; } }, metadata: _metadata }, _game_initializers, _game_extraInitializers);
            __esDecorate(null, null, _cardType_decorators, { kind: "field", name: "cardType", static: false, private: false, access: { has: obj => "cardType" in obj, get: obj => obj.cardType, set: (obj, value) => { obj.cardType = value; } }, metadata: _metadata }, _cardType_initializers, _cardType_extraInitializers);
            __esDecorate(null, null, _language_decorators, { kind: "field", name: "language", static: false, private: false, access: { has: obj => "language" in obj, get: obj => obj.language, set: (obj, value) => { obj.language = value; } }, metadata: _metadata }, _language_initializers, _language_extraInitializers);
            __esDecorate(null, null, _page_decorators, { kind: "field", name: "page", static: false, private: false, access: { has: obj => "page" in obj, get: obj => obj.page, set: (obj, value) => { obj.page = value; } }, metadata: _metadata }, _page_initializers, _page_extraInitializers);
            __esDecorate(null, null, _limit_decorators, { kind: "field", name: "limit", static: false, private: false, access: { has: obj => "limit" in obj, get: obj => obj.limit, set: (obj, value) => { obj.limit = value; } }, metadata: _metadata }, _limit_initializers, _limit_extraInitializers);
            __esDecorate(null, null, _sortBy_decorators, { kind: "field", name: "sortBy", static: false, private: false, access: { has: obj => "sortBy" in obj, get: obj => obj.sortBy, set: (obj, value) => { obj.sortBy = value; } }, metadata: _metadata }, _sortBy_initializers, _sortBy_extraInitializers);
            __esDecorate(null, null, _sortOrder_decorators, { kind: "field", name: "sortOrder", static: false, private: false, access: { has: obj => "sortOrder" in obj, get: obj => obj.sortOrder, set: (obj, value) => { obj.sortOrder = value; } }, metadata: _metadata }, _sortOrder_initializers, _sortOrder_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        search = __runInitializers(this, _search_initializers, void 0);
        collectionId = (__runInitializers(this, _search_extraInitializers), __runInitializers(this, _collectionId_initializers, void 0));
        rarityId = (__runInitializers(this, _collectionId_extraInitializers), __runInitializers(this, _rarityId_initializers, void 0));
        categoryId = (__runInitializers(this, _rarityId_extraInitializers), __runInitializers(this, _categoryId_initializers, void 0));
        energyTypeId = (__runInitializers(this, _categoryId_extraInitializers), __runInitializers(this, _energyTypeId_initializers, void 0));
        status = (__runInitializers(this, _energyTypeId_extraInitializers), __runInitializers(this, _status_initializers, void 0));
        game = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _game_initializers, void 0));
        cardType = (__runInitializers(this, _game_extraInitializers), __runInitializers(this, _cardType_initializers, void 0));
        language = (__runInitializers(this, _cardType_extraInitializers), __runInitializers(this, _language_initializers, void 0));
        page = (__runInitializers(this, _language_extraInitializers), __runInitializers(this, _page_initializers, 1));
        limit = (__runInitializers(this, _page_extraInitializers), __runInitializers(this, _limit_initializers, 20));
        sortBy = (__runInitializers(this, _limit_extraInitializers), __runInitializers(this, _sortBy_initializers, 'createdAt'));
        sortOrder = (__runInitializers(this, _sortBy_extraInitializers), __runInitializers(this, _sortOrder_initializers, 'desc'));
        constructor() {
            __runInitializers(this, _sortOrder_extraInitializers);
        }
    };
})();
exports.CardFilterDto = CardFilterDto;
