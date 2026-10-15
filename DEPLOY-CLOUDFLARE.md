# Publicar GDT DevSur en Cloudflare

El sitio está configurado para **Cloudflare Workers** (recomendado para Astro 7).

## 1. Build local (ya probado)

```bash
npm run build
```

## 2. Login y deploy

```bash
npx wrangler login
npm run deploy
```

Te va a abrir el navegador para autorizar Cloudflare. Al terminar vas a tener una URL tipo:

`https://gdtdevsur.<tu-subdominio>.workers.dev`

## 3. Dominio gdtdevsur.cl (DNS)

**No agregues un registro A vacío** en DNS.

Paso correcto:

1. Cloudflare Dashboard → **Workers & Pages** → proyecto **gdtdevsur**
2. **Settings** → **Domains & Routes** → **Add** → `gdtdevsur.cl`
3. También agregá `www.gdtdevsur.cl` si querés
4. Cloudflare crea solo los registros DNS necesarios

Si te pide proxy: dejalo **Proxied** (nube naranja).

## 4. Variables de entorno (producción)

En el Worker → **Settings** → **Variables**:

- `ADMIN_SESSION_SECRET` = secreto largo aleatorio
- `PUBLIC_SITE_URL` = `https://gdtdevsur.cl`

## Nota sobre el admin/CMS

En Cloudflare el contenido se publica con el deploy.  
Los cambios del panel admin **en producción no se guardan en disco** (Workers no tiene FS persistente).

Flujo recomendado:

1. Editá contenido en local (`npm run dev` + `/admin`)
2. `npm run deploy`
