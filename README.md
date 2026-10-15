# GDT DevSur

Landing premium de agencia TI (Astro) con panel admin completo para editar todo el contenido sin tocar código.

## Stack

- **Astro 7** + React islands
- **Tailwind CSS 4**
- CMS propio basado en JSON (`data/content/`)
- Inspiración UI: [VOX Diseño Web](https://www.vox-web.com.ar/) + componentes [21st.dev](https://21st.dev/mcp)

## Desarrollo

```bash
cp .env.example .env
npm install
npm run dev
```

- Sitio: http://localhost:4321
- Admin: http://localhost:4321/admin
- Credenciales: los usuarios admin se guardan en la base de datos (tabla `admin_users`, contraseña con hash bcrypt). Crear o cambiar contraseña: `npm run admin:password -- correo@ejemplo.com` (la pide por teclado). En `.env` solo va `ADMIN_SESSION_SECRET` (clave de firma de sesiones; sin ella el login queda deshabilitado en producción)

## Panel admin

Desde `/admin` podés:

- Editar sitio, hero, about, servicios, diferenciales, portfolio, proceso, clientes, blog, FAQ, contacto y actualidad
- Activar/desactivar secciones (`enabled`)
- Subir archivos (URL copiada al portapapeles)
- Ver y eliminar consultas del formulario

## Producción

```bash
npm run build
npm start
```

## 21st.dev

Definí `API_KEY_21ST` en `.env` / Cursor MCP para buscar e instalar componentes desde https://21st.dev/mcp
