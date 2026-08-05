# TCG Vision — Monorepo Architecture & Visual 3D Platform

Plataforma digital completa de grado producción especializada en la catalogación, renderizado **3D interactivo en tiempo real con Shaders GLSL**, administración CMS y comercio electrónico de cartas coleccionables (*Trading Card Games* / TCG).

---

## 🏗️ Arquitectura del Monorepo

El proyecto está estructurado como un **Monorepo con Turborepo y pnpm Workspaces**, garantizando modularidad, reusabilidad de código y máximo rendimiento de compilación.

```text
tcg-vision/
├── apps/
│   ├── web/         # Portal Público & Visor 3D Interactivo (Next.js 15 App Router)
│   ├── admin/       # Panel Administrativo & Studio CMS de Rarezas (Next.js 15 App Router)
│   └── api/         # REST API Backend, RBAC, Redis & Prisma ORM (NestJS 10)
├── packages/
│   ├── types/       # DTOs, Enums y Contratos de interfaz TypeScript (@tcg/types)
│   ├── ui/          # Componentes 3D (React Three Fiber) e Interfaz (@tcg/ui)
│   ├── shaders/     # Biblioteca de Presets de Shaders GLSL 3D (@tcg/shaders)
│   └── config/      # Configuraciones de TypeScript compartidas (@tcg/config)
├── prisma/          # Esquema de Base de Datos y Script de Inicialización (Seed)
├── docker/          # Docker Compose (PostgreSQL 16 & Redis 7)
└── storage/         # Sistema local de almacenamiento de archivos multimedia / GLTF 3D
```

---

## 🎨 Biblioteca de Shaders 3D (`@tcg/shaders`)

- **`BASIC_FOIL_PRESET`**: Holograma lineal clásico con difracción reactiva al ángulo de visión (Fresnel).
- **`RAINBOW_HYPER_PRESET`**: Espectro cromático continuo con interferencia galáctica y ciclo temporal.
- **`GOLD_RELIC_PRESET`**: Lámina dorada con reflexión metálica y especularidad resplandeciente.
- **`GLASS_SHATTER_PRESET`**: Refracción de cristal fragmentado en matriz de diamantes.
- **`PROMO_GLOW_PRESET`**: Aura neón pulsante en los bordes de la carta.

---

## 🚀 Módulos Backend API (`@tcg/api`)

- **`AuthModule`**: Autenticación JWT, Refresh Tokens, Bcryptjs y RBAC Guards (`SUPER_ADMIN`, `CONTENT_MANAGER`, `DESIGNER`, `CUSTOMER`).
- **`CollectionsModule`**: Expansiones TCG (Base Set, Scarlet & Violet) con caché Redis.
- **`CategoriesModule`**: Categorías (Pokémon, Trainer, Energy).
- **`RaritiesModule`**: Nivel de rareza y vinculación con presets 3D.
- **`CardsModule`**: Catálogo completo con búsqueda facetada, filtros y paginación.
- **`PresetsModule`**: Gestión de shaders GLSL desde el Studio CMS.
- **`AssetsModule` & `StorageService`**: Carga de archivos multimedia/3D GLTF, servidor estático y vinculación.
- **`ProductsModule`**: Inventarios por condición (`RAW`, `NEAR_MINT`, `PSA_10`) y precios.
- **`OrdersModule`**: Procesamiento de órdenes, transacciones atómicas Prisma y deducción de stock.

---

## 🛠️ Requisitos de Entorno & Instalación

### Requisitos Previs
- **Node.js**: `>= 20.0.0`
- **pnpm**: `>= 9.0.0`
- **Docker & Docker Compose**: PostgreSQL 16 y Redis 7

### Instalación Rápida

1. **Clonar repositorio e instalar dependencias:**
   ```bash
   pnpm install
   ```

2. **Levantar base de datos e infraestructura:**
   ```bash
   docker compose -f docker/docker-compose.yml up -d
   ```

3. **Ejecutar migraciones y semilla de datos (Seed):**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Iniciar todos los servicios en modo desarrollo:**
   ```bash
   pnpm dev
   ```

---

## 🧪 Comandos de Calidad y Compilación

- **Comprobar tipos TypeScript en todo el monorepo:**
  ```bash
  pnpm check-types
  ```

- **Compilación de producción para todas las aplicaciones y paquetes:**
  ```bash
  pnpm build
  ```

---

## 🌐 Despliegue Gratuito recomendado

### Opción 1: Vercel + Render (recomendado)

1. **API**
   - Despliega [apps/api](apps/api) en Render.
   - Define estas variables en Render:
     - `DATABASE_URL=postgresql://postgres.mxrgynidlwddllhhzmuv:NWpr7TjIaZc1bBOW@aws-0-us-east-1.pooler.supabase.com:5432/postgres`
     - `JWT_SECRET=tcg_vision_super_secret_jwt_key_2026`
     - `REFRESH_TOKEN_SECRET=tcg_vision_refresh_secret_key_2026`
     - `API_URL=https://trading-cards-pokemon.onrender.com`
     - `ALLOWED_ORIGINS=https://<tu-web>.vercel.app,https://<tu-admin>.vercel.app`
     - `REDIS_URL=`  (solo si tienes Redis configurado; si no, no la uses)

2. **Frontend web**
   - Despliega [apps/web](apps/web) en Vercel.
   - En Vercel, define:
     - `NEXT_PUBLIC_API_URL=https://trading-cards-pokemon.onrender.com`
     - `NEXT_PUBLIC_APP_URL=https://<tu-web>.vercel.app`

3. **Admin**
   - Despliega [apps/admin](apps/admin) en Vercel.
   - En Vercel, define:
     - `NEXT_PUBLIC_API_URL=https://trading-cards-pokemon.onrender.com`
     - `NEXT_PUBLIC_APP_URL=https://<tu-admin>.vercel.app`

4. **Conexión DB y caché**
   - Usa Supabase para PostgreSQL.
   - Si no necesitas Redis en producción, deja `REDIS_URL` vacío o no la definas.

### Opción 2: Railway

- Web y admin: despliegue desde GitHub con Vercel o Railway.
- API: Railway para un solo servicio Node/NestJS.
- Variables de entorno similares a las anteriores.

> Para un primer lanzamiento gratuito, Vercel + Render es la ruta más sencilla y estable.

---

## 🗺️ Mapa de Sprints Completados

- [x] **Sprint 0:** Arquitectura Monorepo & Entorno de Trabajo
- [x] **Sprint 1:** Backend Infrastructure Setup (Prisma, Redis, NestJS Base)
- [x] **Sprint 2:** Authentication & RBAC Engine
- [x] **Sprint 3:** Card Catalog System (Collections, Categories, Rarities, Cards API)
- [x] **Sprint 4:** Admin Panel & Studio CMS (Next.js 15 App Router)
- [x] **Sprint 5:** Rarity & Visual Effect Engine (GLSL Shaders & Presets API)
- [x] **Sprint 6:** Asset Management System (StorageService, Uploads & 3D Assets)
- [x] **Sprint 7:** 3D Visualization Engine (React Three Fiber, OrbitControls, Tilt Physics)
- [x] **Sprint 8:** Public Catalog & User Portal (Facet Search, 3D Detail, Collection Manager)
- [x] **Sprint 9:** Marketplace & Order Engine (Prisma Transactions, Stock Deduction, Checkout)
- [x] **Sprint 10:** Final Integration & E2E Verification

---
*TCG Vision — Trading Cards 3D Platform.*
