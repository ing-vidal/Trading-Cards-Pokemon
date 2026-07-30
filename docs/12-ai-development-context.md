

```md
# Contexto de Desarrollo para Inteligencia Artificial

# Plataforma de Compra y Venta de Cartas Pokémon TCG Pocket

## Propósito del Documento

Este documento proporciona contexto permanente para herramientas de inteligencia artificial como:

- Continue AI.
- GitHub Copilot.
- Roo Code.
- Otros asistentes de desarrollo.

La IA debe utilizar esta información antes de generar, modificar o proponer código.

---

# Descripción del Proyecto

Se está construyendo una plataforma web profesional para la compra y venta de cartas Pokémon TCG Pocket.

El sistema permitirá:

- Mostrar catálogo de cartas.
- Administrar productos.
- Gestionar categorías.
- Controlar disponibilidad.
- Generar solicitudes de compra mediante WhatsApp.

El modelo inicial es:

- Un único vendedor.
- Un administrador.
- Clientes sin registro.
- Sin pagos integrados.

---

# Objetivo Principal

Crear una plataforma escalable que permita digitalizar la venta de cartas Pokémon manteniendo una arquitectura profesional preparada para futuras mejoras.

---

# Arquitectura Actual

La arquitectura definida es:


Monorepo Full Stack

Frontend
|
|
Backend API
|
|
Database


---

# Tecnologías Obligatorias

## Frontend

Usar:

- Next.js.
- React.
- TypeScript.
- Tailwind CSS.

---

## Backend

Usar:

- NestJS.
- TypeScript.
- REST API.

---

## Base de Datos

Usar:

- PostgreSQL.
- Prisma ORM.

---

# Estructura del Proyecto


pokemon-card-platform/

├── apps/

│ ├── web
│ └── api

├── packages/

│ ├── ui
│ ├── types
│ ├── config
│ └── utils

├── prisma

├── docs

└── docker


---

# Modelo de Negocio

La plataforma NO es un marketplace inicialmente.

Existe:


Administrador
|
|
Clientes


El administrador controla:

- Productos.
- Categorías.
- Inventario.

---

# Flujo Principal de Compra

Nunca implementar checkout tradicional.

El flujo correcto es:


Cliente consulta carta

↓

Agrega productos

↓

Genera solicitud

↓

WhatsApp

↓

Vendedor confirma compra


---

# Entidades Principales

La IA debe considerar estas entidades:

## Product

Carta Pokémon.

Campos importantes:

- Nombre.
- Precio.
- Imagen.
- Rareza.
- Expansión.
- Stock.
- Categoría.

---

## Category

Clasificación de cartas.

---

## AdminUser

Usuario administrativo.

---

## ProductImage

Imágenes asociadas.

---

# Reglas que la IA DEBE respetar

## 1

No agregar pagos electrónicos.

---

## 2

No crear marketplace multi-vendedor.

---

## 3

No crear usuarios clientes obligatorios.

---

## 4

No cambiar tecnologías principales.

No sustituir:

- Next.js.
- NestJS.
- Prisma.
- PostgreSQL.

---

## 5

Mantener arquitectura modular.

---

## 6

No crear lógica de negocio en componentes frontend.

---

## 7

No crear acceso directo a base de datos desde controllers.

---

# Reglas para Generación de Código

Antes de crear código:

La IA debe revisar:

- Arquitectura.
- Modelo de datos.
- Convenciones.
- Seguridad.

---

Todo código generado debe:

- Usar TypeScript.
- Seguir ESLint.
- Mantener nombres consistentes.
- Ser modular.
- Ser reutilizable.

---

# Decisiones Importantes del Proyecto

## Carrito

El carrito es temporal.

No se almacena inicialmente en base de datos.

---

## Clientes

No requieren cuenta.

---

## Pagos

Fuera de la plataforma.

---

## Entrega

La venta se coordina directamente con el vendedor.

---

# Futuras Extensiones Permitidas

La arquitectura puede crecer para soportar:

- Usuarios clientes.
- Favoritos.
- Historial de compras.
- Apartados.
- Pagos.
- Múltiples vendedores.
- Aplicación móvil.

---

# Instrucción Final para la IA

Antes de realizar cualquier cambio:

1. Revisar esta documentación.
2. Respetar las decisiones existentes.
3. No introducir nuevas tecnologías sin autorización.
4. No modificar arquitectura base.
5. Priorizar código limpio, mantenible y profesional.

El objetivo no es crear solamente una página web, sino construir una plataforma escalable de comercio especializado en cartas Pokémon TCG Pocket.

Con esto queda completa la carpeta:

docs/

├── 01-overview.md
├── 02-requirements.md
├── 03-user-stories.md
├── 04-architecture.md
├── 05-database-design.md
├── 06-api-design.md
├── 07-frontend-guidelines.md
├── 08-backend-guidelines.md
├── 09-security.md
├── 10-development-roadmap.md
├── 11-coding-standards.md
└── 12-ai-development-context.md