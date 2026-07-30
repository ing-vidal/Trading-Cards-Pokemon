
---

# Archivo: docs/06-api-design.md

```md
# Diseño de API REST

# Plataforma de Compra y Venta de Cartas Pokémon TCG Pocket

## Información General

La API será desarrollada utilizando NestJS y seguirá principios REST.

Base URL:
/api/v1


Formato de comunicación:

- Request: JSON.
- Response: JSON.
- Autenticación mediante JWT para endpoints administrativos.

---

# Autenticación

## POST /auth/login

Permite ingresar al panel administrativo.

### Público

No requiere autenticación.

---

## Request

```json
{
  "email": "admin@email.com",
  "password": "password123"
}
Response 200
{
  "accessToken": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "admin@email.com"
  }
}
Productos
GET /products

Obtiene catálogo público.

Público

No requiere autenticación.

Response 200
[
  {
    "id": "uuid",
    "name": "Charizard EX",
    "price": 250,
    "stock": 1,
    "category": {
      "name": "Pokemon EX"
    }
  }
]
GET /products/:id

Obtiene detalle de una carta.

Público
Response 200
{
  "id": "uuid",
  "name": "Charizard EX",
  "description": "Carta especial",
  "price": 250,
  "rarity": "Rare",
  "stock": 1,
  "images": []
}
POST /products

Crear nueva carta.

Requiere autenticación

Rol:

ADMIN
Request
{
"name":"Pikachu EX",
"description":"Carta especial",
"price":300,
"categoryId":"uuid",
"stock":1
}
Response

Código:

201 Created
PUT /products/:id

Actualizar carta.

Requiere autenticación
Request
{
"price":350,
"stock":2
}
Response

Código:

200 OK
DELETE /products/:id

Eliminar o desactivar carta.

Requiere autenticación
Response

Código:

204 No Content
Categorías
GET /categories

Obtiene categorías disponibles.

Público.

POST /categories

Crear categoría.

Admin requerido.

PUT /categories/:id

Actualizar categoría.

Admin requerido.

DELETE /categories/:id

Eliminar categoría.

Admin requerido.

Carrito / Solicitud WhatsApp

El carrito será manejado principalmente en frontend.

No requiere almacenamiento inicial.

POST /checkout/whatsapp

Genera información para WhatsApp.

Público.

Request
{
"customerName":"Juan",
"products":[
 {
  "productId":"uuid",
  "quantity":2
 }
]
}
Response
{
"message":
"Hola, quiero comprar Charizard EX x2",
"url":
"https://wa.me/..."
}
Códigos HTTP
Código	Uso
200	Consulta exitosa
201	Creación exitosa
204	Eliminación exitosa
400	Datos inválidos
401	No autenticado
403	Sin permisos
404	Recurso no encontrado
500	Error interno
Manejo de Errores

Formato estándar:

{
"statusCode":400,
"message":"Product price is required",
"error":"Bad Request"
}
Seguridad API

Los endpoints administrativos deben validar:

Token JWT.
Usuario activo.
Permisos administrativos.

Endpoints públicos:

GET /products
GET /products/:id
GET /categories
POST /checkout/whatsapp

Endpoints protegidos:

POST /products
PUT /products/:id
DELETE /products/:id

POST /categories
PUT /categories/:id
DELETE /categories/:id

---

Con esto ya tenemos definidos **modelo de datos + contrato API**.  
El siguiente bloque sería:

- `07-frontend-guidelines.md`
- `08-backend-guidelines.md`

que serán los documentos que más ayudarán a Continue AI a generar la estructura de código correcta.