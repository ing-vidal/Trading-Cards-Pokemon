# Historias de Usuario

## Actor: Cliente

---

# US-001 Consultar catálogo de cartas

## Historia

Como cliente interesado en cartas Pokémon TCG Pocket

Quiero consultar el catálogo disponible

Para conocer qué cartas tiene disponibles la tienda antes de realizar una compra.

## Criterios de aceptación

- El usuario puede acceder al catálogo sin iniciar sesión.
- El sistema muestra únicamente productos activos.
- Cada producto muestra información básica:
  - Imagen.
  - Nombre.
  - Precio.
  - Disponibilidad.
  - Categoría.
- El usuario puede acceder al detalle de una carta.

---

# US-002 Buscar cartas específicas

## Historia

Como cliente

Quiero buscar cartas por nombre o características

Para encontrar rápidamente una carta específica.

## Criterios de aceptación

- El usuario puede ingresar texto de búsqueda.
- El sistema filtra productos relacionados.
- La búsqueda funciona sin recargar la página.
- Si no existen resultados muestra un mensaje informativo.

---

# US-003 Filtrar cartas por categoría

## Historia

Como cliente

Quiero filtrar cartas por categoría

Para encontrar productos relacionados con una colección o clasificación específica.

## Criterios de aceptación

- El sistema muestra las categorías disponibles.
- El usuario puede seleccionar una categoría.
- Solo se muestran productos pertenecientes a dicha categoría.
- El usuario puede regresar al catálogo completo.

---

# US-004 Consultar detalle de carta

## Historia

Como cliente

Quiero visualizar el detalle de una carta

Para conocer sus características antes de solicitarla.

## Criterios de aceptación

El detalle debe mostrar:

- Imagen.
- Nombre.
- Descripción.
- Precio.
- Categoría.
- Disponibilidad.

El usuario puede agregar la carta a su lista de compra.

---

# US-005 Crear lista de compra

## Historia

Como cliente

Quiero agregar cartas a un carrito temporal

Para enviar una solicitud completa al vendedor.

## Criterios de aceptación

- El usuario puede agregar productos.
- El usuario puede modificar cantidades.
- El usuario puede eliminar productos.
- El sistema calcula un total estimado.
- La información permanece mientras navega en la sesión.

---

# US-006 Solicitar compra mediante WhatsApp

## Historia

Como cliente

Quiero enviar mi selección de cartas por WhatsApp

Para comunicarme directamente con la tienda.

## Criterios de aceptación

- El sistema genera un mensaje automático.
- El mensaje contiene:
  - Nombre de productos.
  - Cantidades.
  - Total estimado.
- Se abre WhatsApp con la información preparada.
- El cliente confirma la compra directamente con el vendedor.

---

# Actor: Administrador

---

# US-007 Iniciar sesión administrativa

## Historia

Como administrador

Quiero ingresar al panel privado

Para gestionar la información de la tienda.

## Criterios de aceptación

- El administrador puede autenticarse.
- Las credenciales incorrectas son rechazadas.
- Las rutas administrativas están protegidas.

---

# US-008 Crear producto

## Historia

Como administrador

Quiero registrar nuevas cartas

Para mantener actualizado el catálogo.

## Criterios de aceptación

El administrador puede registrar:

- Nombre.
- Imagen.
- Precio.
- Categoría.
- Descripción.
- Estado.

El sistema valida los campos obligatorios.

---

# US-009 Editar producto

## Historia

Como administrador

Quiero modificar información de cartas

Para corregir datos o actualizar disponibilidad.

## Criterios de aceptación

- El administrador puede modificar cualquier campo permitido.
- Los cambios se reflejan inmediatamente en el catálogo público.
- Se mantiene consistencia de información.

---

# US-010 Eliminar producto

## Historia

Como administrador

Quiero retirar cartas del catálogo

Para evitar mostrar productos que ya no están disponibles.

## Criterios de aceptación

- El administrador puede desactivar productos.
- Los productos eliminados no aparecen públicamente.
- La información histórica puede conservarse.

---

# US-011 Administrar categorías

## Historia

Como administrador

Quiero gestionar categorías

Para organizar las cartas correctamente.

## Criterios de aceptación

- Puede crear categorías.
- Puede editar categorías.
- Puede asociar productos.
- No se permite eliminar categorías con productos asociados sin confirmación.

---

# US-012 Consultar dashboard administrativo

## Historia

Como administrador

Quiero visualizar información general

Para conocer rápidamente el estado de la tienda.

## Criterios de aceptación

El dashboard muestra:

- Cantidad de productos.
- Productos disponibles.
- Categorías existentes.
- Solicitudes recientes.