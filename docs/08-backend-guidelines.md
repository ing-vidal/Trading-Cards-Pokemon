
# Guía de Desarrollo Backend

# Plataforma de Compra y Venta de Cartas Pokémon TCG Pocket

## Visión General

El backend será desarrollado utilizando NestJS y tendrá la responsabilidad de manejar la lógica de negocio, seguridad, validaciones y comunicación con la base de datos.

El backend expondrá una API REST utilizada por la aplicación frontend.

---

# Tecnología Backend

## Framework

NestJS

Características utilizadas:

- Arquitectura modular.
- Dependency Injection.
- Controllers.
- Services.
- Guards.
- Pipes.
- DTO Validation.

---

## Lenguaje

TypeScript

Uso obligatorio en:

- Servicios.
- Controladores.
- DTOs.
- Entidades.
- Interfaces.

---

# Estructura Backend

Ubicación:


apps/api


Estructura:


apps/api/

├── src/
│
│ ├── auth/
│ │
│ ├── products/
│ │
│ ├── categories/
│ │
│ ├── inventory/
│ │
│ ├── users/
│ │
│ ├── common/
│ │
│ ├── prisma/
│ │
│ └── main.ts
│
└── test/


---

# Módulos Principales

# Auth Module

Responsabilidad:

- Login administrativo.
- Generación JWT.
- Validación usuarios.

Incluye:


auth.controller

auth.service

jwt.strategy

guards


---

# Products Module

Responsabilidad:

Gestionar cartas Pokémon.

Funciones:

- Crear productos.
- Consultar productos.
- Actualizar productos.
- Desactivar productos.

Incluye:


products.controller

products.service

products.dto

products.repository


---

# Categories Module

Responsabilidad:

Administrar categorías.

Funciones:

- Crear.
- Editar.
- Consultar.
- Eliminar.

---

# Inventory Module

Responsabilidad:

Controlar disponibilidad.

Funciones:

- Actualizar stock.
- Validar existencia.
- Controlar productos disponibles.

---

# Users Module

Responsabilidad:

Administrar usuarios internos.

Inicialmente:

- Administrador único.

Preparado para:

- Roles.
- Permisos.
- Múltiples usuarios.

---

# Controllers

Los controllers deben:

- Recibir requests.
- Validar entrada.
- Llamar servicios.
- Retornar respuestas.

No deben contener lógica de negocio.

Ejemplo:


Controller

↓

Service


---

# Services

Los servicios contienen la lógica del sistema.

Ejemplos:

Validar:

- Producto disponible.
- Stock suficiente.
- Categoría existente.

---

# DTOs

Todos los datos externos deben utilizar DTO.

Ejemplo:

CreateProductDto:

```ts
{
 name:string;
 price:number;
 stock:number;
 categoryId:string;
}

Validaciones:

Campos requeridos.
Tipos correctos.
Valores mínimos.
Acceso a Datos

El acceso a PostgreSQL debe realizarse mediante Prisma.

Flujo:

Service

↓

Repository

↓

Prisma

↓

Database
Manejo de Errores

Utilizar excepciones estándar:

Ejemplo:

NotFoundException

BadRequestException

UnauthorizedException

ForbiddenException
Respuestas API

Todas las respuestas deben mantener estructura consistente.

Ejemplo:

Éxito:

{
 "data": {},
 "message": "Success"
}

Error:

{
 "statusCode":400,
 "message":"Validation error"
}
Seguridad Backend

Debe implementar:

JWT Authentication.
Password hashing.
Validación DTO.
Protección de rutas.
Variables sensibles mediante .env.
Variables de Entorno

Nunca almacenar:

Passwords.
Tokens.
URLs privadas.

Ejemplo:

DATABASE_URL=

JWT_SECRET=

WHATSAPP_NUMBER=
Testing

El backend debe considerar:

Unit Tests

Para:

Services.
Validaciones.
Reglas de negocio.
Integration Tests

Para:

API endpoints.
Base de datos.
Reglas de Calidad

El backend debe:

Mantener módulos independientes.
Evitar lógica en controllers.
Documentar endpoints.
Usar nombres descriptivos.
Mantener cobertura de pruebas.

---

Con esto quedan completados:

✅ `01-overview.md`  
✅ `02-requirements.md`  
✅ `03-user-stories.md`  
✅ `04-architecture.md`  
✅ `05-database-design.md`  
✅ `06-api-design.md`  
✅ `07-frontend-guidelines.md`  
✅ `08-backend-guidelines.md`

El siguiente bloque será:

- `09-security.md`
- `10-development-roadmap.md`
- `11-coding-standards.md`
- `12-ai-development-context.md`

El último (`12`) será especialmente importante porque será el "contexto maestro" que le darás a **Continue AI / GitHub Copilot** para que no cambie decisiones del proyecto.