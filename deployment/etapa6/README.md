# Etapa 6 — CineVerse en Render

Base: `11dcfb9069e962c0acebf6192ddd12efc49e30c0`, rama `feature/proyecto-final`.

## Antes de publicar
- Conserva el dump privado de etapa 5. No lo subas ni ejecutes migraciones en Supabase.
- Cambia la contraseña PostgreSQL previamente compartida desde el Dashboard de Supabase, fuera del chat. Actualiza también cualquier conexión local que la utilice. No cambies la contraseña de usuario final por esta acción.
- Genera un JWT_SECRET aleatorio Base64 de 32 bytes o más, exclusivo del despliegue. Nunca en Angular, GitHub, URL ni logs. No compartir el valor.
- El backend usa `supabase,cloud`, `validate`, sin datos de demostración, sin H2 ni inicialización SQL. No se ejecuta DDL al arrancar. La BD se conserva.
- Las cuentas activas no coincidieron con las dos claves demo de código en la auditoría de solo lectura del 24/11/2026. Usa contraseñas robustas para todos los usuarios, especialmente administradores. Compra simulada, no introducir tarjetas reales. Proyecto académico, no producción comercial.

## Pruebas locales antes de commit
Desde la raíz:
```
powershell -ExecutionPolicy Bypass -File .\deployment\etapa6\Verificar-Local.ps1
python .\deployment\etapa6\probar_docker_local.py
```
La primera prueba usa H2 en memoria y compila Angular con un dominio HTTPS ficticio. La segunda reconstruye una BD vacía local en una red Docker única, prueba la imagen con límite de 512 MiB y borra SOLO los contenedores/red/imagen de prueba propios. No se conecta a Supabase. Las pruebas de etapa 5 siguen intactas.

## Publicar código
Revisar `git status --short`, `git diff --check`, y no incluir credenciales ni archivos dump. Commit y push a `feature/proyecto-final` únicamente tras validar.

## Backend Render
1. En https://dashboard.render.com/ usa New > Web Service y autoriza GitHub al repositorio Proyecto-DWI. Rama `feature/proyecto-final`.
2. Root Directory: `backend`; Runtime: Docker; Dockerfile Path: `./Dockerfile`; Docker Build Context: `.` (ambos relativos a Root Directory). Instance: Free. Región disponible más cercana a Supabase; si no hay São Paulo, selecciona US East si está disponible. Health Check Path: `/api/peliculas`. No usar Render Postgres.
3. Environment (solo backend):
   - `SPRING_PROFILES_ACTIVE` = `supabase,cloud`
   - `SUPABASE_DB_URL` = `jdbc:postgresql://aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require` (Session pooler previamente confirmado; vuelve a verificar Connect si cambia). Preferir `sslmode=verify-full` con CA correctamente configurada cuando se disponga del certificado; `require` cifra sin verificar la identidad del servidor.
   - `SUPABASE_DB_USERNAME` = `postgres.lhfhbzqbdlgfyoypkdfh`
   - `SUPABASE_DB_PASSWORD` = nueva contraseña PostgreSQL, introducida solo en Render.
   - `JWT_SECRET` = valor Base64 generado localmente.
   - `CINEVERSE_ALLOWED_ORIGINS` se deja sin definir al principio (rechaza CORS); luego se añade la URL exacta del Static Site.
   No declarar secretos como Docker ARG ni copiarlos a la imagen. Render asigna PORT; no es necesario introducirlo.
4. Deploy. Copia la URL HTTPS real del backend y abre `/api/peliculas`. Debe devolver JSON. Verifica logs de arranque, no publiques logs con secretos.

## Frontend Render
1. New > Static Site, mismo repo y rama. Root Directory: `frontend`.
2. Build Command: `npm ci && npm run build:render`; Publish Directory: `dist/frontend/browser`.
3. Env `NODE_VERSION` = `22.18.0`; `CINEVERSE_API_ORIGIN` = URL HTTPS real del backend sin `/api` ni rutas. Esta URL es pública; no poner ningún otro secreto en el frontend.
4. Redirects/Rewrites: Source `/*`, Destination `/index.html`, Action `Rewrite`.
5. Copia URL HTTPS real del frontend. Backend > Environment: `CINEVERSE_ALLOWED_ORIGINS` = esa URL exacta, sin barra final; guarda y vuelve a desplegar. Si hay un dominio adicional, sepáralo por coma. No usar comodines.

## Verificación en nube
```
powershell -ExecutionPolicy Bypass -File .\deployment\etapa6\Verificar-Publico.ps1 -Api "https://TU-API.onrender.com" -Web "https://TU-WEB.onrender.com"
```
Usa tus URLs reales. Solo GET y OPTIONS; no inserta, modifica ni borra registros. Comprueba catálogo, sesión, rutas y pantalla de compra manualmente en la etapa 7; crear una función futura únicamente si decides hacerlo desde el panel autorizado. No hay funciones futuras en la auditoría inicial, por lo que el checkout necesitará programación de demo.

## Límites y contingencias
- Render Free: 512 MB, suspensión tras inactividad, arranque en frío, cuotas de workspace y de tráfico. No agregar plan pagado si quieres S/ 0. La prueba de memoria local no garantiza igual tiempo de arranque ni disponibilidad en Render.
- Si hay OOM, revisar logs/metrics; no aumentar heap sin considerar memoria total. Koyeb Free es alternativa Docker con límites similares. Railway Free tiene crédito mensual limitado. Mantener Supabase activo.
- Si CORS falla, revisar que el origen sea exacto sin `/`; si las rutas profundas dan 404, revisar Rewrite. Si JDBC falla, verificar nueva contraseña, username con ref, Session pooler 5432 y SSL. No cambiar `validate` a `update` o `create`.
- JWT de un nuevo despliegue invalida sesiones firmadas por otra clave; vuelve a iniciar sesión.
- Horario de cine: Lima (UTC-05:00); sin modificar timestamps históricos. La app está pensada para funciones contemporáneas.
- Si un deploy falla, en Render reintentar o usar rollback de código a último deploy funcional; no restaurar ni borrar la base automáticamente.

## Referencias oficiales
- https://render.com/docs/free
- https://render.com/docs/docker
- https://render.com/docs/monorepo-support
- https://render.com/docs/redirects-rewrites
- https://supabase.com/docs/guides/getting-started/quickstarts/spring-boot
