# Seguridad del Sistema

# Plataforma de Compra y Venta de Cartas Pokémon TCG Pocket

## Visión General

La seguridad del sistema estará enfocada principalmente en proteger:

- Panel administrativo.
- Información interna de la plataforma.
- Credenciales de administración.
- Integridad del catálogo.
- Disponibilidad del servicio.

Aunque la plataforma no manejará pagos ni información bancaria, se aplicarán buenas prácticas de seguridad desde la primera versión.

---

# Modelo de Seguridad

La plataforma tendrá dos tipos principales de usuarios:

## Cliente Público

Características:

- Puede consultar cartas.
- Puede buscar productos.
- Puede generar solicitudes mediante WhatsApp.
- No requiere autenticación.

Permisos:


READ ONLY


---

## Administrador

Características:

- Usuario interno del sistema.
- Gestiona catálogo.
- Administra inventario.
- Modifica información.

Permisos:


CREATE
READ
UPDATE
DELETE


---

# Autenticación

## Método

La autenticación administrativa utilizará:

- JWT (JSON Web Token).
- Password hashing.
- Sesiones protegidas.

---

# Flujo de autenticación

Proceso:


Administrador

    ↓

Ingresa email/password

    ↓

Backend valida credenciales

    ↓

Genera JWT

    ↓

Frontend almacena sesión

    ↓

Acceso al panel administrativo


---

# Protección de Contraseñas

Las contraseñas nunca deben almacenarse en texto plano.

Se utilizará:

- Hashing mediante bcrypt o algoritmo equivalente.

Ejemplo:


Password original:

Pokemon123

↓

Hash almacenado:

$2b$10$xxxxxxxxxxxx


---

# Autorización

Los endpoints administrativos deben validar:

- Token válido.
- Usuario activo.
- Permisos suficientes.

Ejemplo:

Endpoint protegido:


POST /api/v1/products


Requiere:


Authorization: Bearer TOKEN


---

# Protección de API

La API debe implementar:

## Validación de datos

Todas las entradas deben validarse mediante DTOs.

Validaciones:

- Campos requeridos.
- Tipos correctos.
- Longitudes máximas.
- Valores permitidos.

---

## Rate Limiting

Se recomienda limitar solicitudes para evitar:

- Abuso de endpoints.
- Ataques automatizados.
- Saturación del servicio.

---

## CORS

Configurar correctamente:

Permitidos:


Frontend autorizado


Bloqueados:


Dominios desconocidos


---

# Protección de Base de Datos

Reglas:

- Nunca exponer la base de datos directamente.
- Utilizar Prisma como única capa de acceso.
- Utilizar variables de entorno.
- Aplicar migraciones controladas.

---

# Manejo de Variables Sensibles

Nunca almacenar en código:

- Passwords.
- JWT secrets.
- Tokens.
- Credenciales.

Ejemplo:

Archivo:


.env


Variables:


DATABASE_URL=

JWT_SECRET=

WHATSAPP_NUMBER=


---

# Seguridad Frontend

El frontend debe:

- No almacenar información sensible.
- Validar estados de sesión.
- Proteger rutas administrativas.
- Manejar errores correctamente.

---

# Riesgos Identificados

## Riesgo 1: Acceso no autorizado al panel

Impacto:

Alto.

Mitigación:

- JWT.
- Protección de rutas.
- Password hashing.

---

## Riesgo 2: Manipulación de productos

Impacto:

Alto.

Mitigación:

- Validaciones backend.
- Autorización administrativa.

---

## Riesgo 3: Datos incorrectos en catálogo

Impacto:

Medio.

Mitigación:

- DTO validation.
- Reglas de negocio.

---

## Riesgo 4: Abuso del API público

Impacto:

Medio.

Mitigación:

- Rate limiting.
- Monitoreo.
- Validaciones.

---

# Buenas Prácticas Obligatorias

El equipo de desarrollo debe:

- Mantener dependencias actualizadas.
- Revisar vulnerabilidades.
- No subir archivos .env.
- Usar HTTPS en producción.
- Revisar permisos antes de desplegar.
