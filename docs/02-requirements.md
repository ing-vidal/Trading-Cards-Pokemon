# Requerimientos del Sistema

# Requerimientos Funcionales

## RF-001 Gestión de productos

El sistema debe permitir al administrador crear productos de cartas Pokémon.

Información requerida:

- Nombre.
- Descripción.
- Imagen.
- Precio.
- Categoría.
- Disponibilidad.
- Estado.

---

## RF-002 Consulta de catálogo

Los clientes deben poder visualizar productos disponibles sin autenticación.

Debe permitir:

- Ver listado.
- Buscar productos.
- Filtrar categorías.
- Consultar detalles.

---

## RF-003 Gestión de categorías

El administrador podrá:

- Crear categorías.
- Editar categorías.
- Eliminar categorías.
- Asociar productos.

---

## RF-004 Lista de compra

El cliente podrá:

- Agregar cartas.
- Modificar cantidad.
- Eliminar productos.

---

## RF-005 Solicitud mediante WhatsApp

El sistema debe generar un mensaje con:

- Nombre del cliente.
- Productos seleccionados.
- Cantidades.
- Total estimado.

El usuario será redirigido a WhatsApp.

---

## RF-006 Autenticación administrativa

El sistema debe permitir acceso privado al panel administrativo.

---

# Requerimientos No Funcionales

## RNF-001 Rendimiento

El sistema debe responder rápidamente en consultas del catálogo.

---

## RNF-002 Escalabilidad

La arquitectura debe permitir crecimiento futuro.

---

## RNF-003 Seguridad

Debe proteger:

- Credenciales administrativas.
- Información interna.
- Endpoints privados.

---

## RNF-004 Mantenibilidad

El código debe estar organizado utilizando:

- Separación de responsabilidades.
- Componentes reutilizables.
- Documentación técnica.

---

## RNF-005 Disponibilidad

La plataforma debe estar preparada para despliegue en nube.

---

# Reglas de Negocio

## RB-001

Solo existe un vendedor dentro del sistema.

---

## RB-002

El administrador es responsable del inventario.

---

## RB-003

Los clientes no realizan pagos dentro de la plataforma.

---

## RB-004

La compra se confirma mediante comunicación directa por WhatsApp.

---

## RB-005

Una carta no disponible no debe aparecer como comprable.

---

## RB-006

Cada producto debe pertenecer a una categoría.

---

# Restricciones del Sistema

- No utilizar pagos integrados en primera versión.
- No manejar logística de envíos.
- No crear marketplace multi-vendedor.
- No almacenar información bancaria.
- La comunicación comercial será mediante WhatsApp.
- El administrador será el único usuario con permisos de gestión.