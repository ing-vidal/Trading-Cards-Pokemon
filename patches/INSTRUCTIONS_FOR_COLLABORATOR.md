INSTRUCCIONES PARA EL COLABORADOR
=================================

Resumen
------
Este documento contiene los pasos para aplicar el parche que evita errores 500 al crear cartas, desplegar en Vercel y migrar las cartas que quedaron en `localStorage` del admin hacia la API.

Archivos importantes
-------------------
- Patch: patches/0001-add-default-collection-rarity.patch
- Guía: patches/INSTRUCTIONS_FOR_COLLABORATOR.md (este archivo)

1) Aplicar el patch y abrir PR
-----------------------------
1. Clonar y crear rama:

```bash
git clone https://github.com/ing-vidal/Trading-Cards-Pokemon.git
cd Trading-Cards-Pokemon
git checkout -b patch/cards-defaults
```

2. Aplicar el patch:

```bash
git apply patches/0001-add-default-collection-rarity.patch
# revisar cambios
git add apps/api/src/cards/cards.service.ts
git commit -m "cards: create default collection and rarity when missing"
git push origin patch/cards-defaults
```

3. Abrir PR en GitHub hacia `main`. Indicar en la descripción que el cambio crea colecciones y rarezas por defecto si no existen para evitar claves foráneas vacías y 500.

2) Merge y despliegue en Vercel
-------------------------------
- Si el proyecto está ligado a Vercel, al mergear `main` se activará el deploy automático.
- Asegurarse en Vercel Settings → Environment Variables que existan (para ambos proyectos `admin` y `web`):
  - `NEXT_PUBLIC_API_URL` = `https://<TU_API_PUBLICA>`
  - (en el proyecto API) `ALLOWED_ORIGINS` = `https://<WEB_URL>,https://<ADMIN_URL>`

Vercel UI (pasos):
1. Abrir el proyecto `admin` en Vercel → Settings → Environment Variables → Add New
2. Key: `NEXT_PUBLIC_API_URL`
   Value: `https://<TU_API_PUBLICA>`
   Environment: `Production` (y `Preview` si se desea)
3. Repetir en el proyecto `web`.
4. En el proyecto `api`, añadir `ALLOWED_ORIGINS` con las URLs de web y admin separadas por comas.

Con Vercel CLI (opcional):

```bash
# login
vercel login
# añadir variable en production
vercel env add NEXT_PUBLIC_API_URL production
# seguir prompts para introducir la URL
```

3) Importar cartas desde localStorage (Admin) hacia la API
---------------------------------------------------------
- Motivo: tus cartas `custom-...` se guardaron en `localStorage` del admin porque el POST al API falló. Hay que crear esas cartas en la API para que el `web` las vea.
- Instrucciones: abrir la consola del navegador en la página del Admin (DevTools -> Console) y ejecutar el script siguiente, reemplazando `API` por la URL pública del API (ej.: `https://trading-cards-pokemon.onrender.com`):

```javascript
(async () => {
  const API = 'https://REPLACE_WITH_YOUR_API'; // <-- PON LA URL PÚBLICA
  const raw = localStorage.getItem('tcg_custom_cards');
  if (!raw) return console.log('No hay tcg_custom_cards en localStorage');
  const cards = JSON.parse(raw);
  for (const c of cards) {
    const payload = {
      name: c.name,
      number: c.number || 'N/A',
      price: Number(c.price ?? 49.99),
      stock: Number(c.stock ?? 10),
      status: c.status ?? 'PUBLISHED',
      collectionId: c.collectionId || undefined,
      rarityId: c.rarityId || undefined,
      imageUrl: c.imageUrl || undefined
    };
    try {
      const res = await fetch(`${API}/api/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      console.log(res.status, json);
    } catch (err) {
      console.error('Error creando carta en API:', err);
    }
  }
  // Si todo fue bien, opcional: localStorage.removeItem('tcg_custom_cards');
  console.log('Proceso terminado');
})();
```

- Tras ejecutar, verificar con curl/listado (ver apartado 4).

4) Comprobaciones y comandos útiles
-----------------------------------
- Listar cartas desde API:

```bash
curl -sS https://<TU_API>/api/cards | jq .
```

- Crear carta de prueba (manual):

```bash
curl -X POST https://<TU_API>/api/cards \
  -H "Content-Type: application/json" \
  -d '{"name":"Prueba","number":"T-001","price":9.99,"status":"PUBLISHED"}'
```

- Logs Vercel:

```bash
vercel logs <deployment-url> --since 1h
```

5) Qué revisar si hay errores 500
---------------------------------
- Revisar `DATABASE_URL` en env vars y que la base de datos esté accesible y migrada.
- Revisar `prisma` migrations (si es necesario ejecutar `prisma migrate deploy` en CI o manualmente).
- Revisar los logs del API y pegar el stack trace aquí si necesitas ayuda — lo revisaré.

6) Notas importantes sobre seguridad y límites
---------------------------------------------
- No ingresar credenciales ni tokens en scripts compartidos. Si necesitas que ejecute algo en tu cuenta, da acceso a un colaborador humano y yo preparo los artefactos.

7) Siguientes pasos que yo puedo hacer por ti
--------------------------------------------
- Generar un PR description y checklist para reviewers.
- Crear un pequeño README adicional y pruebas automáticas si quieres.


---
Archivo generado automáticamente por el asistente. Si quieres que rellene el `API` en el script con la URL pública, dímela y genero una versión lista para pegar.
