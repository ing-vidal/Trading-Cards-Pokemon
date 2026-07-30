# Diseño de Base de Datos

# Plataforma de Compra y Venta de Cartas Pokémon TCG Pocket

## Visión General

La base de datos estará diseñada utilizando un modelo relacional basado en PostgreSQL.

El objetivo es almacenar de forma estructurada:

- Cartas Pokémon disponibles.
- Categorías de clasificación.
- Inventario.
- Información administrativa.
- Configuración del sistema.

El diseño inicial estará preparado para crecimiento futuro, permitiendo agregar usuarios clientes, historial de compras y múltiples vendedores.

---

# Modelo Entidad Relación

Diagrama conceptual:

```mermaid
erDiagram

    CATEGORY ||--o{ PRODUCT : contains

    PRODUCT ||--o{ PRODUCT_IMAGE : has

    ADMIN_USER {
        uuid id PK
        string email
        string password_hash
        string name
        boolean active
        datetime created_at
        datetime updated_at
    }


    CATEGORY {
        uuid id PK
        string name
        string description
        boolean active
        datetime created_at
        datetime updated_at
    }


    PRODUCT {
        uuid id PK
        uuid category_id FK
        string name
        string description
        decimal price
        integer stock
        string rarity
        string expansion
        boolean active
        datetime created_at
        datetime updated_at
    }


    PRODUCT_IMAGE {
        uuid id PK
        uuid product_id FK
        string url
        boolean primary
        datetime created_at
    }
	
	Entidades Principales
1. Product

Representa una carta Pokémon disponible para venta.

Ejemplos:

Charizard EX.
Pikachu.
Mewtwo EX.
Cartas especiales.
Campos principales
Campo	Tipo	Descripción
id	UUID	Identificador único
category_id	UUID	Categoría asociada
name	VARCHAR	Nombre de la carta
description	TEXT	Información adicional
price	DECIMAL	Precio de venta
stock	INTEGER	Cantidad disponible
rarity	VARCHAR	Rareza
expansion	VARCHAR	Expansión o colección
active	BOOLEAN	Disponible públicamente
created_at	DATETIME	Fecha creación
updated_at	DATETIME	Última actualización
2. Category

Permite organizar las cartas.

Ejemplos:

Pokémon EX.
Cartas raras.
Colección Base.
Expansiones especiales.
Campos principales
Campo	Tipo	Descripción
id	UUID	Identificador
name	VARCHAR	Nombre categoría
description	TEXT	Descripción
active	BOOLEAN	Estado
created_at	DATETIME	Creación
updated_at	DATETIME	Actualización
3. Product Image

Almacena imágenes asociadas a una carta.

Permite:

Tener múltiples imágenes.
Cambiar imagen principal.
Escalar posteriormente.
Campos
Campo	Tipo	Descripción
id	UUID	Identificador
product_id	UUID	Producto relacionado
url	VARCHAR	Ruta imagen
primary	BOOLEAN	Imagen principal
4. Admin User

Usuario interno del sistema.

Inicialmente existirá un único administrador.

Campos
Campo	Tipo
id	UUID
email	VARCHAR
password_hash	VARCHAR
name	VARCHAR
active	BOOLEAN
created_at	DATETIME
updated_at	DATETIME
Relaciones
Category - Product

Relación:

Una categoría puede tener muchos productos.

Un producto pertenece a una categoría.

Cardinalidad:

Category 1 ---- N Product
Product - Product Image

Relación:

Un producto puede tener múltiples imágenes.

Una imagen pertenece a un producto.

Cardinalidad:

Product 1 ---- N Product_Image
Reglas de Integridad
Producto
Un producto debe tener una categoría válida.
El precio debe ser mayor a cero.
El stock no puede ser negativo.
Un producto inactivo no debe aparecer públicamente.
Categoría
No permitir categorías duplicadas.
No eliminar categorías con productos asociados.
Las categorías inactivas no deben mostrarse al cliente.
Usuario Administrador
El email debe ser único.
Las contraseñas deben almacenarse cifradas.
Solo usuarios activos pueden iniciar sesión.
Consideraciones Futuras

La estructura permite agregar posteriormente:

Customer

Usuarios compradores.

Campos futuros:

Nombre.
Email.
Teléfono.
Order

Historial de solicitudes.

Campos futuros:

Productos solicitados.
Cliente.
Fecha.
Estado.
Seller

Para soportar marketplace.

Campos futuros:

Usuario vendedor.
Comisión.
Catálogo independiente.