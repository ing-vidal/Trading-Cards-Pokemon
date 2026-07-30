
# Roadmap de Desarrollo

# Plataforma de Compra y Venta de Cartas Pokémon TCG Pocket

## Objetivo

Construir la primera versión funcional de la plataforma utilizando desarrollo incremental mediante sprints.

Cada sprint tendrá entregables funcionales y verificables.

---

# Sprint 1 - Foundation e Infraestructura

## Objetivo

Preparar la base técnica del proyecto.

Duración estimada:

2 semanas.

---

## Actividades

### Configuración del Monorepo

Crear estructura:


apps/
packages/
prisma/
docs/
docker/


---

### Configuración Frontend

Implementar:

- Next.js.
- TypeScript.
- Tailwind CSS.
- Configuración ESLint.
- Configuración Prettier.

---

### Configuración Backend

Implementar:

- NestJS.
- TypeScript.
- Arquitectura modular inicial.
- Configuración de variables de entorno.

---

### Base de Datos Inicial

Configurar:

- PostgreSQL.
- Prisma.
- Primera migración.

Crear modelos iniciales:

- AdminUser.
- Category.
- Product.
- ProductImage.

---

## Entregables

Al finalizar:

- Proyecto ejecutándose localmente.
- Frontend funcionando.
- Backend funcionando.
- Base de datos conectada.
- Documentación inicial completa.

---

# Sprint 2 - Catálogo Público

## Objetivo

Construir la experiencia de consulta de cartas.

---

## Actividades

### Página principal

Implementar:

- Landing inicial.
- Productos destacados.
- Navegación.

---

### Catálogo

Implementar:

- Listado de cartas.
- Tarjetas de producto.
- Búsqueda.
- Filtros por categoría.

---

### Detalle de producto

Implementar:

- Información completa.
- Imágenes.
- Precio.
- Disponibilidad.

---

### API Productos

Crear endpoints:


GET /products

GET /products/:id


---

## Entregables

Cliente puede:

- Consultar cartas.
- Buscar productos.
- Ver detalles.

---

# Sprint 3 - Panel Administrativo

## Objetivo

Crear herramientas de administración.

---

## Actividades

### Autenticación

Implementar:

- Login.
- JWT.
- Protección rutas.

---

### Dashboard

Mostrar:

- Total productos.
- Categorías.
- Estado inventario.

---

### Gestión Productos

Implementar:

- Crear cartas.
- Editar cartas.
- Desactivar cartas.

---

### Gestión Categorías

Implementar:

- Crear categorías.
- Editar categorías.
- Asociar productos.

---

## Entregables

Administrador puede gestionar completamente el catálogo.

---

# Sprint 4 - Carrito y WhatsApp

## Objetivo

Implementar flujo comercial.

---

## Actividades

### Carrito temporal

Implementar:

- Agregar productos.
- Cambiar cantidades.
- Eliminar productos.

---

### Generación WhatsApp

Implementar:

- Construcción automática del mensaje.
- Redirección a WhatsApp.

---

## Entregables

Cliente puede:


Seleccionar cartas

↓

Crear solicitud

↓

Enviar WhatsApp


---

# Sprint 5 - Calidad y Preparación Producción

## Objetivo

Preparar sistema para despliegue.

---

## Actividades

### Testing

Implementar:

- Unit tests.
- Pruebas API.
- Validaciones.

---

### Optimización

Revisar:

- Rendimiento.
- Carga de imágenes.
- Consultas BD.

---

### Seguridad

Validar:

- Autenticación.
- Permisos.
- Variables entorno.

---

### Deployment

Preparar:

- Ambiente producción.
- CI/CD.
- Variables servidor.

---

# Sprint 6 - Mejoras Futuras

## Objetivo

Agregar funcionalidades posteriores.

---

## Posibles funcionalidades

### Usuarios clientes

- Registro.
- Favoritos.
- Historial.

---

### Compras

- Historial solicitudes.
- Estados de compra.
- Apartados.

---

### Marketplace

- Múltiples vendedores.
- Tiendas independientes.
- Comisiones.

---

# Criterios de Éxito del Proyecto

La primera versión será considerada exitosa cuando:

- El administrador pueda gestionar cartas.
- Los clientes puedan consultar catálogo.
- Los clientes puedan generar solicitudes WhatsApp.
- La información esté almacenada correctamente.
- El sistema pueda desplegarse en producción.
- El código mantenga estándares profesionales.