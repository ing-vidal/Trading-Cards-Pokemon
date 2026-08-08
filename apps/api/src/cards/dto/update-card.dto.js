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
exports.UpdateCardDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
let UpdateCardDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _slug_decorators;
    let _slug_initializers = [];
    let _slug_extraInitializers = [];
    let _number_decorators;
    let _number_initializers = [];
    let _number_extraInitializers = [];
    let _game_decorators;
    let _game_initializers = [];
    let _game_extraInitializers = [];
    let _cardType_decorators;
    let _cardType_initializers = [];
    let _cardType_extraInitializers = [];
    let _language_decorators;
    let _language_initializers = [];
    let _language_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _hp_decorators;
    let _hp_initializers = [];
    let _hp_extraInitializers = [];
    let _attack_decorators;
    let _attack_initializers = [];
    let _attack_extraInitializers = [];
    let _defense_decorators;
    let _defense_initializers = [];
    let _defense_extraInitializers = [];
    let _abilities_decorators;
    let _abilities_initializers = [];
    let _abilities_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _collectionId_decorators;
    let _collectionId_initializers = [];
    let _collectionId_extraInitializers = [];
    let _categoryId_decorators;
    let _categoryId_initializers = [];
    let _categoryId_extraInitializers = [];
    let _rarityId_decorators;
    let _rarityId_initializers = [];
    let _rarityId_extraInitializers = [];
    let _energyTypeId_decorators;
    let _energyTypeId_initializers = [];
    let _energyTypeId_extraInitializers = [];
    let _imageUrl_decorators;
    let _imageUrl_initializers = [];
    let _imageUrl_extraInitializers = [];
    let _price_decorators;
    let _price_initializers = [];
    let _price_extraInitializers = [];
    let _stock_decorators;
    let _stock_initializers = [];
    let _stock_extraInitializers = [];
    return class UpdateCardDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _slug_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _number_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _game_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _cardType_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(client_1.CardType)];
            _language_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _description_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _hp_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInt)()];
            _attack_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInt)()];
            _defense_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInt)()];
            _abilities_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _status_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(client_1.CardStatus)];
            _collectionId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _categoryId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _rarityId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _energyTypeId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _imageUrl_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _price_decorators = [(0, class_validator_1.IsOptional)()];
            _stock_decorators = [(0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _slug_decorators, { kind: "field", name: "slug", static: false, private: false, access: { has: obj => "slug" in obj, get: obj => obj.slug, set: (obj, value) => { obj.slug = value; } }, metadata: _metadata }, _slug_initializers, _slug_extraInitializers);
            __esDecorate(null, null, _number_decorators, { kind: "field", name: "number", static: false, private: false, access: { has: obj => "number" in obj, get: obj => obj.number, set: (obj, value) => { obj.number = value; } }, metadata: _metadata }, _number_initializers, _number_extraInitializers);
            __esDecorate(null, null, _game_decorators, { kind: "field", name: "game", static: false, private: false, access: { has: obj => "game" in obj, get: obj => obj.game, set: (obj, value) => { obj.game = value; } }, metadata: _metadata }, _game_initializers, _game_extraInitializers);
            __esDecorate(null, null, _cardType_decorators, { kind: "field", name: "cardType", static: false, private: false, access: { has: obj => "cardType" in obj, get: obj => obj.cardType, set: (obj, value) => { obj.cardType = value; } }, metadata: _metadata }, _cardType_initializers, _cardType_extraInitializers);
            __esDecorate(null, null, _language_decorators, { kind: "field", name: "language", static: false, private: false, access: { has: obj => "language" in obj, get: obj => obj.language, set: (obj, value) => { obj.language = value; } }, metadata: _metadata }, _language_initializers, _language_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _hp_decorators, { kind: "field", name: "hp", static: false, private: false, access: { has: obj => "hp" in obj, get: obj => obj.hp, set: (obj, value) => { obj.hp = value; } }, metadata: _metadata }, _hp_initializers, _hp_extraInitializers);
            __esDecorate(null, null, _attack_decorators, { kind: "field", name: "attack", static: false, private: false, access: { has: obj => "attack" in obj, get: obj => obj.attack, set: (obj, value) => { obj.attack = value; } }, metadata: _metadata }, _attack_initializers, _attack_extraInitializers);
            __esDecorate(null, null, _defense_decorators, { kind: "field", name: "defense", static: false, private: false, access: { has: obj => "defense" in obj, get: obj => obj.defense, set: (obj, value) => { obj.defense = value; } }, metadata: _metadata }, _defense_initializers, _defense_extraInitializers);
            __esDecorate(null, null, _abilities_decorators, { kind: "field", name: "abilities", static: false, private: false, access: { has: obj => "abilities" in obj, get: obj => obj.abilities, set: (obj, value) => { obj.abilities = value; } }, metadata: _metadata }, _abilities_initializers, _abilities_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _collectionId_decorators, { kind: "field", name: "collectionId", static: false, private: false, access: { has: obj => "collectionId" in obj, get: obj => obj.collectionId, set: (obj, value) => { obj.collectionId = value; } }, metadata: _metadata }, _collectionId_initializers, _collectionId_extraInitializers);
            __esDecorate(null, null, _categoryId_decorators, { kind: "field", name: "categoryId", static: false, private: false, access: { has: obj => "categoryId" in obj, get: obj => obj.categoryId, set: (obj, value) => { obj.categoryId = value; } }, metadata: _metadata }, _categoryId_initializers, _categoryId_extraInitializers);
            __esDecorate(null, null, _rarityId_decorators, { kind: "field", name: "rarityId", static: false, private: false, access: { has: obj => "rarityId" in obj, get: obj => obj.rarityId, set: (obj, value) => { obj.rarityId = value; } }, metadata: _metadata }, _rarityId_initializers, _rarityId_extraInitializers);
            __esDecorate(null, null, _energyTypeId_decorators, { kind: "field", name: "energyTypeId", static: false, private: false, access: { has: obj => "energyTypeId" in obj, get: obj => obj.energyTypeId, set: (obj, value) => { obj.energyTypeId = value; } }, metadata: _metadata }, _energyTypeId_initializers, _energyTypeId_extraInitializers);
            __esDecorate(null, null, _imageUrl_decorators, { kind: "field", name: "imageUrl", static: false, private: false, access: { has: obj => "imageUrl" in obj, get: obj => obj.imageUrl, set: (obj, value) => { obj.imageUrl = value; } }, metadata: _metadata }, _imageUrl_initializers, _imageUrl_extraInitializers);
            __esDecorate(null, null, _price_decorators, { kind: "field", name: "price", static: false, private: false, access: { has: obj => "price" in obj, get: obj => obj.price, set: (obj, value) => { obj.price = value; } }, metadata: _metadata }, _price_initializers, _price_extraInitializers);
            __esDecorate(null, null, _stock_decorators, { kind: "field", name: "stock", static: false, private: false, access: { has: obj => "stock" in obj, get: obj => obj.stock, set: (obj, value) => { obj.stock = value; } }, metadata: _metadata }, _stock_initializers, _stock_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        slug = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _slug_initializers, void 0));
        number = (__runInitializers(this, _slug_extraInitializers), __runInitializers(this, _number_initializers, void 0));
        game = (__runInitializers(this, _number_extraInitializers), __runInitializers(this, _game_initializers, void 0));
        cardType = (__runInitializers(this, _game_extraInitializers), __runInitializers(this, _cardType_initializers, void 0));
        language = (__runInitializers(this, _cardType_extraInitializers), __runInitializers(this, _language_initializers, void 0));
        description = (__runInitializers(this, _language_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        hp = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _hp_initializers, void 0));
        attack = (__runInitializers(this, _hp_extraInitializers), __runInitializers(this, _attack_initializers, void 0));
        defense = (__runInitializers(this, _attack_extraInitializers), __runInitializers(this, _defense_initializers, void 0));
        abilities = (__runInitializers(this, _defense_extraInitializers), __runInitializers(this, _abilities_initializers, void 0));
        status = (__runInitializers(this, _abilities_extraInitializers), __runInitializers(this, _status_initializers, void 0));
        collectionId = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _collectionId_initializers, void 0));
        categoryId = (__runInitializers(this, _collectionId_extraInitializers), __runInitializers(this, _categoryId_initializers, void 0));
        rarityId = (__runInitializers(this, _categoryId_extraInitializers), __runInitializers(this, _rarityId_initializers, void 0));
        energyTypeId = (__runInitializers(this, _rarityId_extraInitializers), __runInitializers(this, _energyTypeId_initializers, void 0));
        imageUrl = (__runInitializers(this, _energyTypeId_extraInitializers), __runInitializers(this, _imageUrl_initializers, void 0));
        price = (__runInitializers(this, _imageUrl_extraInitializers), __runInitializers(this, _price_initializers, void 0));
        stock = (__runInitializers(this, _price_extraInitializers), __runInitializers(this, _stock_initializers, void 0));
        constructor() {
            __runInitializers(this, _stock_extraInitializers);
        }
    };
})();
exports.UpdateCardDto = UpdateCardDto;
