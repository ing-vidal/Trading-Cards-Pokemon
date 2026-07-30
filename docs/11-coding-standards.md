# Estándares de Código

# Plataforma de Compra y Venta de Cartas Pokémon TCG Pocket

## Objetivo

Definir las reglas y convenciones que deberán seguirse durante el desarrollo del sistema para mantener:

- Código limpio.
- Código mantenible.
- Consistencia entre módulos.
- Facilidad de evolución.
- Mejor colaboración entre desarrolladores y herramientas de inteligencia artificial.

---

# Principios Generales

El código debe cumplir:

- Simplicidad.
- Legibilidad.
- Reutilización.
- Separación de responsabilidades.
- Bajo acoplamiento.
- Alta cohesión.

No se debe crear código innecesariamente complejo.

---

# Lenguaje

Todo el proyecto utilizará:


TypeScript


Reglas:

- Evitar utilizar `any`.
- Definir interfaces y tipos.
- Mantener tipado estricto.
- Aprovechar TypeScript para detectar errores temprano.

---

# Nombres de Archivos

## Regla General

Los nombres deben utilizar:


kebab-case


Ejemplo:

Correcto:


product-card.tsx
product.service.ts
create-product.dto.ts


Incorrecto:


ProductCard.tsx
productService.ts
CreateProductDTO.ts


---

# Frontend Naming

## Componentes React

Los componentes deben utilizar:


PascalCase


Ejemplo:


ProductCard.tsx

CartItem.tsx

CategoryFilter.tsx


---

## Hooks

Los hooks deben comenzar con:


use


Ejemplo:


useCart.ts

useProducts.ts


---

## Funciones

Utilizar:


camelCase


Ejemplo:

```ts
getProductById()

calculateCartTotal()
Backend Naming
Módulos NestJS

Ejemplo:

products.module.ts
Controllers

Formato:

resource.controller.ts

Ejemplo:

products.controller.ts
Services

Formato:

resource.service.ts

Ejemplo:

products.service.ts
DTOs

Formato:

action-resource.dto.ts

Ejemplo:

create-product.dto.ts

update-product.dto.ts
Estructura de Componentes Frontend

Los componentes deben mantener separación:

Ejemplo:

ProductCard/

├── ProductCard.tsx

├── ProductCard.types.ts

├── ProductCard.test.tsx

└── index.ts
Reglas para Componentes

Un componente debe:

Tener una única responsabilidad.
Evitar lógica de negocio.
Recibir información mediante props.
Ser reutilizable.

Evitar:

Componentes gigantes.
Más de una responsabilidad.
Código duplicado.
Manejo de Estado

Reglas:

Usar estado local cuando:

Solo afecta un componente.

Usar estado global cuando:

Varias pantallas necesitan información.

Ejemplo:

Estado global:

Carrito
Sesión administrativa
Configuración
Backend Rules
Controllers

Los controllers solamente deben:

Recibir requests.
Validar entrada.
Llamar servicios.
Retornar respuesta.

No deben contener:

Consultas SQL.
Reglas de negocio.
Procesamientos complejos.
Services

Los servicios contienen:

Reglas del negocio.
Validaciones.
Procesamiento.

Ejemplo:

Validar stock

Calcular disponibilidad

Crear producto
Database Access

Nunca acceder directamente desde controllers.

Flujo obligatorio:

Controller

↓

Service

↓

Repository

↓

Prisma

↓

Database
Manejo de Errores

Debe utilizarse manejo consistente.

Backend:

Ejemplo:

throw new NotFoundException(
 "Product not found"
);

Frontend:

Debe manejar:

Loading.
Error.
Empty state.
Success.
Variables

Nunca usar valores mágicos.

Incorrecto:

if(stock < 5)

Correcto:

const MINIMUM_STOCK = 5;
Comentarios

Los comentarios deben explicar:

Decisiones importantes.
Reglas complejas.

Evitar comentarios obvios.

Incorrecto:

// Increment stock
stock++;
Git Standards
Branch naming

Formato:

feature/nombre
bugfix/nombre
hotfix/nombre

Ejemplo:

feature/product-management
Commits

Formato recomendado:

tipo: descripción

Ejemplos:

feat: add product module

fix: correct cart calculation

docs: update architecture
Calidad Obligatoria

Antes de integrar código:

Debe pasar:

Linter.
Formatter.
Tests.
Build.
Revisión.

---
