# Guía de Desarrollo Frontend

# Plataforma de Compra y Venta de Cartas Pokémon TCG Pocket

## Visión General

El frontend será desarrollado como una aplicación web moderna utilizando Next.js, React y TypeScript.

Su responsabilidad principal será proporcionar una experiencia rápida y sencilla para:

- Clientes que consultan cartas.
- Clientes que generan solicitudes de compra.
- Administradores que gestionan el catálogo.

El frontend deberá mantener una arquitectura basada en componentes reutilizables y separación clara de responsabilidades.

---

# Tecnologías Frontend

## Framework

Next.js

Uso:

- Aplicación web.
- Routing.
- Renderizado.
- Optimización.

---

## Lenguaje

TypeScript

Uso obligatorio para:

- Componentes.
- Servicios.
- Tipos.
- Estados.
- Interfaces.

---

## Estilos

Tailwind CSS

Objetivos:

- Diseño consistente.
- Desarrollo rápido.
- Componentes reutilizables.

---

# Estructura Frontend

Ubicación:

apps/web


Estructura propuesta:


apps/web/

├── app/
│
│ ├── page.tsx
│ ├── products/
│ ├── cart/
│ ├── admin/
│ └── layout.tsx
│
├── components/
│
│ ├── ui/
│ ├── products/
│ ├── cart/
│ └── admin/
│
├── hooks/
│
├── services/
│
├── store/
│
├── types/
│
├── utils/
│
└── styles/


---

# Organización de Componentes

## Componentes UI Base

Ubicación:


components/ui


Ejemplos:


Button
Input
Modal
Card
Dropdown
Table


Características:

- No contienen lógica de negocio.
- Son reutilizables.
- Deben aceptar propiedades configurables.

---

## Componentes de Producto

Ubicación:


components/products


Ejemplos:


ProductCard
ProductGrid
ProductDetail
ProductFilter


Responsabilidad:

Mostrar información de cartas Pokémon.

---

## Componentes de Carrito

Ubicación:


components/cart


Ejemplos:


CartItem
CartSummary
WhatsAppButton


Responsabilidad:

Gestionar selección temporal de productos.

---

## Componentes Administrativos

Ubicación:


components/admin


Ejemplos:


ProductForm
ProductTable
CategoryForm
DashboardCard


---

# Páginas Principales

## Página Inicio

Ruta:


/


Debe mostrar:

- Presentación de plataforma.
- Cartas destacadas.
- Acceso al catálogo.

---

## Catálogo

Ruta:


/products


Funciones:

- Listado de cartas.
- Búsqueda.
- Filtros.
- Ordenamiento.

---

## Detalle Producto

Ruta:


/products/[id]


Mostrar:

- Imagen.
- Nombre.
- Precio.
- Rareza.
- Categoría.
- Disponibilidad.

---

## Carrito

Ruta:


/cart


Funciones:

- Ver productos seleccionados.
- Modificar cantidades.
- Generar WhatsApp.

---

## Administración

Ruta:


/admin


Protegida.

Funciones:

- Dashboard.
- Productos.
- Categorías.
- Inventario.

---

# Manejo de Estado

## Estado Global

Se utilizará para información compartida:

Ejemplos:

- Carrito.
- Usuario administrador.
- Configuración.

Tecnologías posibles:

- Zustand.
- React Context.

---

## Estado Local

Usar para:

- Formularios.
- Modales.
- Componentes individuales.

Ejemplo:


useState()
useReducer()


---

# Comunicación con API

Las llamadas al backend deben estar separadas.

No realizar llamadas directamente desde componentes.

Ejemplo:

Correcto:


Component

↓

Service

↓

API


Incorrecto:


Component

↓

fetch()


---

# Manejo de Errores

Todos los componentes deben manejar:

- Estados de carga.
- Errores.
- Datos vacíos.

Ejemplo:

Estados:


Loading

Success

Error

Empty


---

# Reglas UI/UX

## Diseño

La interfaz debe ser:

- Limpia.
- Moderna.
- Responsive.
- Fácil de usar.

---

## Catálogo

Debe priorizar:

- Imagen de carta.
- Precio.
- Disponibilidad.
- Acción de compra.

---

## Experiencia de compra

Debe minimizar pasos:


Ver carta

↓

Agregar

↓

Enviar WhatsApp


---

# Buenas Prácticas

El frontend debe:

- Evitar duplicación de código.
- Utilizar componentes pequeños.
- Mantener tipado fuerte.
- Separar UI de lógica.
- Usar nombres descriptivos.
- Mantener componentes testeables.
