# Arquitectura del Sistema

# Plataforma de Compra y Venta de Cartas Pokémon TCG Pocket

## Visión General

La plataforma será un sistema web especializado en la gestión, publicación y venta de cartas Pokémon TCG Pocket.

El sistema permitirá a los clientes consultar un catálogo digital de cartas disponibles, revisar información detallada de cada producto, seleccionar cartas de interés y generar una solicitud de compra mediante WhatsApp.

La administración del sistema será responsabilidad de un único administrador de tienda, quien podrá gestionar productos, categorías, inventario y disponibilidad desde un panel administrativo privado.

La arquitectura estará diseñada siguiendo principios de escalabilidad, separación de responsabilidades y buenas prácticas de desarrollo profesional.

---

# Arquitectura Propuesta

## Tipo de Arquitectura

Se utilizará una arquitectura Full Stack basada en Monorepo.

La solución estará separada en diferentes aplicaciones y paquetes compartidos:
pokemon-card-platform/

├── apps/
│ ├── web/ # Aplicación frontend
│ └── api/ # API backend
│
├── packages/
│ ├── ui/ # Componentes reutilizables
│ ├── types/ # Tipos compartidos
│ ├── config/ # Configuraciones comunes
│ └── utils/ # Utilidades compartidas
│
├── prisma/ # Modelo de base de datos y migraciones
│
├── docs/ # Documentación técnica
│
└── docker/ # Configuración de infraestructura


---

# Componentes Principales

## Frontend Web

Responsable de la experiencia del usuario.

Funciones principales:

- Mostrar catálogo público de cartas.
- Mostrar detalle de productos.
- Permitir búsqueda y filtros.
- Gestionar carrito temporal.
- Generar solicitudes de compra vía WhatsApp.
- Mostrar panel administrativo.

Tecnologías:

- Next.js.
- React.
- TypeScript.
- Tailwind CSS.

---

## Backend API

Responsable de la lógica del negocio.

Funciones principales:

- Gestión de productos.
- Gestión de categorías.
- Gestión de inventario.
- Autenticación administrativa.
- Validación de información.
- Exposición de servicios REST.
- Aplicación de reglas de negocio.

Tecnologías:

- NestJS.
- TypeScript.

---

## Base de Datos

Responsable del almacenamiento persistente.

Información almacenada:

- Cartas Pokémon.
- Categorías.
- Inventario.
- Usuarios administrativos.
- Configuración del sistema.

Tecnologías:

- PostgreSQL.
- Prisma ORM.

---

# Tecnologías Seleccionadas

## Next.js

### Uso

Framework principal para la aplicación web.

### Justificación

Se selecciona porque proporciona:

- Arquitectura moderna basada en React.
- Buen rendimiento.
- Renderizado optimizado.
- Escalabilidad.
- Excelente integración con TypeScript.

---

## NestJS

### Uso

Framework backend para construir la API REST.

### Justificación

Se selecciona porque proporciona:

- Arquitectura modular.
- Separación clara de responsabilidades.
- Estructura empresarial.
- Facilidad para implementar validaciones y seguridad.

---

## PostgreSQL

### Uso

Base de datos relacional principal.

### Justificación

Permite manejar correctamente:

- Relaciones entre cartas y categorías.
- Integridad de información.
- Consultas complejas.
- Crecimiento futuro del sistema.

---

## Prisma ORM

### Uso

Capa de acceso a datos.

### Justificación

Permite:

- Definir modelos mediante TypeScript.
- Crear migraciones controladas.
- Mantener consistencia del esquema.
- Reducir errores de acceso a datos.

---

# Comunicación Entre Componentes

Flujo general del sistema:


Cliente

↓

Frontend Next.js

↓

API REST

↓

Backend NestJS

↓

Prisma ORM

↓

PostgreSQL


---

# Patrones Arquitectónicos Utilizados

## Arquitectura Modular

Cada funcionalidad estará separada en módulos independientes.

Ejemplo backend:

src/

├── products/
│ ├── products.module.ts
│ ├── products.controller.ts
│ ├── products.service.ts
│ └── dto/

├── categories/
│
├── inventory/
│
├── auth/
│
└── users/

Beneficios:

- Mejor organización.
- Facilidad de mantenimiento.
- Bajo acoplamiento.
- Mayor facilidad para pruebas.

---

## Repository Pattern

Se separará la lógica de negocio del acceso directo a datos.

Estructura:


Beneficios:

- Código más mantenible.
- Facilita cambios futuros.
- Mejora la capacidad de pruebas.

---

## DTO Pattern

Todas las entradas recibidas por la API deberán utilizar DTOs.

Ejemplo:

Crear carta:

```json
{
  "name": "Charizard EX",
  "price": 250,
  "categoryId": "category-id",
  "stock": 1
}
Component Based Design

El frontend utilizará componentes reutilizables.

Ejemplo:

components/

├── ProductCard
├── ProductGrid
├── SearchBar
├── CategoryFilter
├── CartItem
├── AdminTable
└── Modal
Flujo de Compra

La plataforma no manejará pagos dentro del sistema.

Proceso:

Cliente consulta cartas

        ↓

Selecciona productos

        ↓

Agrega cartas al carrito

        ↓

Genera solicitud

        ↓

Sistema crea mensaje WhatsApp

        ↓

Cliente contacta vendedor

        ↓

Se acuerda compra y entrega presencial
Decisiones Técnicas Importantes
Modelo de Venta

El sistema está diseñado inicialmente para un único vendedor.

El administrador será responsable de:

Crear productos.
Actualizar precios.
Controlar disponibilidad.
Atender solicitudes.
Sin Registro de Clientes

Los clientes podrán realizar solicitudes sin crear una cuenta.

Motivos:

Menor fricción de compra.
Proceso más rápido.
Menor almacenamiento de información personal.
Sin Pagos Integrados

La primera versión no tendrá:

Tarjetas bancarias.
PayPal.
Transferencias integradas.

El proceso comercial se realizará mediante WhatsApp.

Sin Sistema Multi-Vendedor

La plataforma no será un marketplace en la primera versión.

Sin embargo, la arquitectura permitirá agregar:

Múltiples vendedores.
Roles.
Tiendas independientes.
Comisiones.
Seguridad Arquitectónica

Se implementarán:

Autenticación administrativa.
Protección de rutas privadas.
Validación backend.
Manejo seguro de variables de entorno.
Control de permisos.
Sanitización de información recibida.
Preparación para Futuras Versiones

La arquitectura permitirá agregar:

Usuarios compradores.
Historial de compras.
Favoritos.
Sistema de apartados.
Pagos electrónicos.
Notificaciones.
Aplicación móvil.
Estadísticas comerciales.
Estándares Técnicos

El proyecto deberá mantener:

TypeScript como lenguaje principal.
ESLint para calidad de código.
Prettier para formato.
Git para control de versiones.
Documentación Markdown.
Variables de entorno.
Pull Requests para revisión.
Código modular y reutilizable.

Esta sería la versión definitiva del **Sprint de Arquitectura** para que herramientas como **Continue AI, GitHub Copilot o Roo Code** entiendan correctamente que están construyendo una **plataforma de cartas Pokémon TCG Pocket** y no una tienda genérica.