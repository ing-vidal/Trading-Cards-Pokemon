"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = exports.ProductStatus = exports.ProductCondition = exports.AssetType = exports.RarityLevel = exports.CardType = exports.CardStatus = exports.RoleType = void 0;
var RoleType;
(function (RoleType) {
    RoleType["SUPER_ADMIN"] = "SUPER_ADMIN";
    RoleType["CONTENT_MANAGER"] = "CONTENT_MANAGER";
    RoleType["DESIGNER"] = "DESIGNER";
    RoleType["VIEWER"] = "VIEWER";
    RoleType["USER"] = "USER";
})(RoleType || (exports.RoleType = RoleType = {}));
var CardStatus;
(function (CardStatus) {
    CardStatus["DRAFT"] = "DRAFT";
    CardStatus["PUBLISHED"] = "PUBLISHED";
    CardStatus["HIDDEN"] = "HIDDEN";
    CardStatus["ARCHIVED"] = "ARCHIVED";
})(CardStatus || (exports.CardStatus = CardStatus = {}));
var CardType;
(function (CardType) {
    CardType["POKEMON"] = "POKEMON";
    CardType["PARTIDARIO"] = "PARTIDARIO";
    CardType["OBJETO"] = "OBJETO";
    CardType["HERRAMIENTA"] = "HERRAMIENTA";
    CardType["ESTADIO"] = "ESTADIO";
})(CardType || (exports.CardType = CardType = {}));
var RarityLevel;
(function (RarityLevel) {
    RarityLevel["STAR_1"] = "STAR_1";
    RarityLevel["STAR_2"] = "STAR_2";
    RarityLevel["DIAMOND_1"] = "DIAMOND_1";
    RarityLevel["DIAMOND_2"] = "DIAMOND_2";
    RarityLevel["DIAMOND_3"] = "DIAMOND_3";
    RarityLevel["DIAMOND_4"] = "DIAMOND_4";
    RarityLevel["GOLD"] = "GOLD";
    RarityLevel["RAINBOW"] = "RAINBOW";
    RarityLevel["SHINY_1"] = "SHINY_1";
    RarityLevel["SHINY_2"] = "SHINY_2";
    RarityLevel["PROMOTIONAL"] = "PROMOTIONAL";
})(RarityLevel || (exports.RarityLevel = RarityLevel = {}));
var AssetType;
(function (AssetType) {
    AssetType["IMAGE"] = "IMAGE";
    AssetType["MODEL_3D"] = "MODEL_3D";
    AssetType["TEXTURE"] = "TEXTURE";
    AssetType["VIDEO"] = "VIDEO";
    AssetType["ANIMATION"] = "ANIMATION";
    AssetType["AUDIO"] = "AUDIO";
    AssetType["SHADER"] = "SHADER";
})(AssetType || (exports.AssetType = AssetType = {}));
var ProductCondition;
(function (ProductCondition) {
    ProductCondition["RAW"] = "RAW";
    ProductCondition["NEAR_MINT"] = "NEAR_MINT";
    ProductCondition["LIGHTLY_PLAYED"] = "LIGHTLY_PLAYED";
    ProductCondition["MODERATELY_PLAYED"] = "MODERATELY_PLAYED";
    ProductCondition["HEAVILY_PLAYED"] = "HEAVILY_PLAYED";
    ProductCondition["DAMAGED"] = "DAMAGED";
    ProductCondition["PSA_10"] = "PSA_10";
    ProductCondition["PSA_9"] = "PSA_9";
    ProductCondition["BGS_10"] = "BGS_10";
    ProductCondition["CGC_10"] = "CGC_10";
})(ProductCondition || (exports.ProductCondition = ProductCondition = {}));
var ProductStatus;
(function (ProductStatus) {
    ProductStatus["AVAILABLE"] = "AVAILABLE";
    ProductStatus["LOW_STOCK"] = "LOW_STOCK";
    ProductStatus["OUT_OF_STOCK"] = "OUT_OF_STOCK";
    ProductStatus["PRE_ORDER"] = "PRE_ORDER";
    ProductStatus["COMING_SOON"] = "COMING_SOON";
    ProductStatus["SOLD"] = "SOLD";
})(ProductStatus || (exports.ProductStatus = ProductStatus = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["PAID"] = "PAID";
    OrderStatus["SHIPPED"] = "SHIPPED";
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
