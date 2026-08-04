export enum RoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CONTENT_MANAGER = 'CONTENT_MANAGER',
  DESIGNER = 'DESIGNER',
  VIEWER = 'VIEWER',
  USER = 'USER'
}

export enum CardStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  HIDDEN = 'HIDDEN',
  ARCHIVED = 'ARCHIVED'
}

export enum RarityLevel {
  STAR_1 = 'STAR_1',
  STAR_2 = 'STAR_2',
  DIAMOND_1 = 'DIAMOND_1',
  DIAMOND_2 = 'DIAMOND_2',
  DIAMOND_3 = 'DIAMOND_3',
  DIAMOND_4 = 'DIAMOND_4',
  GOLD = 'GOLD',
  RAINBOW = 'RAINBOW',
  SHINY_1 = 'SHINY_1',
  SHINY_2 = 'SHINY_2',
  PROMOTIONAL = 'PROMOTIONAL'
}

export enum AssetType {
  IMAGE = 'IMAGE',
  MODEL_3D = 'MODEL_3D',
  TEXTURE = 'TEXTURE',
  VIDEO = 'VIDEO',
  ANIMATION = 'ANIMATION',
  AUDIO = 'AUDIO',
  SHADER = 'SHADER'
}

export enum ProductCondition {
  RAW = 'RAW',
  NEAR_MINT = 'NEAR_MINT',
  LIGHTLY_PLAYED = 'LIGHTLY_PLAYED',
  MODERATELY_PLAYED = 'MODERATELY_PLAYED',
  HEAVILY_PLAYED = 'HEAVILY_PLAYED',
  DAMAGED = 'DAMAGED',
  PSA_10 = 'PSA_10',
  PSA_9 = 'PSA_9',
  BGS_10 = 'BGS_10',
  CGC_10 = 'CGC_10'
}

export enum ProductStatus {
  AVAILABLE = 'AVAILABLE',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  PRE_ORDER = 'PRE_ORDER',
  COMING_SOON = 'COMING_SOON',
  SOLD = 'SOLD'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  status: string;
  createdAt: string;
}

export interface CollectionDto {
  id: string;
  name: string;
  slug: string;
  code: string;
  releaseDate?: string;
  logo?: string;
  description?: string;
}

export interface RarityDto {
  id: string;
  name: string;
  level: RarityLevel;
  icon?: string;
  color?: string;
  presetId?: string;
}

export interface VisualPresetDto {
  id: string;
  name: string;
  shader: string;
  material?: string;
  foil?: string;
  particles?: string;
  animation?: string;
  intensity: number;
}

export interface CardDto {
  id: string;
  name: string;
  slug: string;
  number: string;
  game: string;
  language: string;
  description?: string;
  hp?: number;
  attack?: number;
  defense?: number;
  abilities?: any[];
  status: CardStatus;
  collectionId: string;
  collection?: CollectionDto;
  categoryId?: string;
  rarityId: string;
  rarity?: RarityDto;
  assets?: AssetDto[];
  createdAt: string;
}

export interface AssetDto {
  id: string;
  name: string;
  type: AssetType;
  url: string;
  path?: string;
  size: number;
  format: string;
  version: string;
  cardId?: string;
}

export interface ProductDto {
  id: string;
  cardId: string;
  card?: CardDto;
  sku: string;
  condition: ProductCondition;
  price: number;
  currency: string;
  stock: number;
  status: ProductStatus;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}
