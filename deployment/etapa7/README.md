# CineVerse — corrección de catálogo y funciones (etapa 7)

Base: `940640f2031ee6eb4be0f77185858fca0b4c1afb`, rama `feature/proyecto-final`.

## Reglas acordadas para este parche

- Sin preventa: las películas activas con estreno futuro aparecen únicamente en Próximamente. Se pueden programar funciones futuras a partir del estreno, pero no comprar antes de que llegue el día del estreno.
- Inicio (máximo 6) y Cartelera consumen el mismo endpoint GET /api/peliculas/cartelera. Solo películas activas, estrenadas (fecha civil Lima), con al menos una función futura, no cancelada y de horario coherente. No equivale a disponibilidad garantizada de butacas: las butacas se comprueban al escoger la función y al comprar.
- Detalle, selección de asientos y checkout comparten la regla de venta; el backend vuelve a validar dentro de la transacción de compra. No se cambia el endpoint general de películas ni el de funciones, que conservan el catálogo administrativo e histórico.
- El administrador recibe un fin calculado a partir del inicio y duración. El servidor vuelve a calcularlo, incluso si un cliente envía un fin exagerado. Se conserva la validación de fin invertido en solicitudes antiguas; el campo sigue siendo obligatorio para compatibilidad. No se permiten nuevas funciones pasadas, antes del estreno ni de películas retiradas. No se editan funciones canceladas ni con entradas. La exclusión de horarios superpuestos existente sigue vigente.
- Para funciones históricas se acepta duración de película hasta duración + 30 min (margen usado por el antiguo inicializador). Las nuevas se guardan con duración exacta. Las incoherentes dejan de ofrecerse a la venta sin modificar sus filas. Si cambias posteriormente duración/estreno de una película, revisa sus funciones vigentes: un horario incompatible se oculta de la venta.
- El administrador ve estados programada, iniciada/pasada, cancelada, horario inválido o película retirada. No se borran compras, funciones, entradas ni notificaciones. No se cambia el esquema ni se ejecuta SQL en Supabase.
- La lista se actualiza al navegar/recargar. Una pantalla que permanezca abierta puede mostrar una tarjeta hasta la siguiente consulta; la compra siempre vuelve a validar el horario.

## Instalación en PowerShell

Descarga el PS1 autónomo a Downloads. Verifica que Git, Python 3 y la rama estén disponibles.

```powershell
$script = "$env:USERPROFILE\Downloads\CineVerse_Etapa7_Cartelera.ps1"
powershell -ExecutionPolicy Bypass -File $script -SoloVerificar
# Solo si la verificacion pasa:
powershell -ExecutionPolicy Bypass -File $script
```

El instalador verifica la revisión exacta, el árbol limpio y las anclas; guarda un ZIP del código original en Documents/CineVerse-backups. No accede a red o bases de datos. Si la revisión cambió, no forzar el parche.

## Pruebas (sin Supabase)

```powershell
cd "$env:USERPROFILE\Documents\estudio\Projects\TWI\Proyecto-DWI"
powershell -ExecutionPolicy Bypass -File .\deployment\etapa6\Verificar-Local.ps1
# Solo si las anteriores pasan, con Docker Desktop iniciado:
python .\database\etapa5\tests\probar_spring_postgresql_local.py
```

El primer script ya existente aísla H2 y ejecuta Maven, Vitest y builds Angular. El segundo usa PostgreSQL descartable de Docker, nunca el servidor real. No ejecutar pruebas Maven con perfil supabase conectado a producción. Se agregan 8 pruebas unitarias Java, 2 pruebas de programación y 3 de integración de catálogo/compra, y 7 pruebas Vitest. Se adaptan fechas de algunas pruebas previas a Lima. Los resultados definitivos deben obtenerse en el equipo local.

## Publicación

Después de pruebas exitosas, revisa la lista exacta de archivos en `revision/patches.json`. Ejecuta `git status --short` y `git diff --check`. Utiliza el comando de staging específico incluido en la respuesta o `git add -u -- backend/src frontend/src` y agrega los tres archivos nuevos explícitos. Revisa el diff de staging y haz commit/push. Render desplegará ambos servicios si Auto-Deploy sigue activo. No modificar CORS ni credenciales. Verifica que ambos servicios estén Live y ejecuta:

```powershell
powershell -ExecutionPolicy Bypass -File .\deployment\etapa6\Verificar-Publico.ps1 -Api "https://cineverse-api-sfpx.onrender.com" -Web "https://cineverse-web-x3g9.onrender.com"
curl.exe -i --max-time 180 "https://cineverse-api-sfpx.onrender.com/api/peliculas/cartelera"
```

## Prueba manual de aceptación

1. Inicio y Cartelera deben coincidir (Inicio muestra hasta seis); Próximamente conserva próximos estrenos activos.
2. Una película estrenada, activa, con una función futura y horario correcto aparece en ambos. Se puede comprar si quedan asientos. Con la única función cancelada o pasada, desaparece tras recargar y Detalle no permite comprar.
3. Película de estreno futuro: Próximamente, sin botón de compra. Programar antes del estreno debe fallar. Programar en o después del estreno está permitido si es futuro.
4. Crear función con inicio a las 23:30 y duración 120: fin al día siguiente 01:30. Intentar un horario superpuesto: debe rechazarse.
5. Historial de entradas y notificaciones sigue intacto. La aplicación no realiza una limpieza automática.

Si se desean datos demo en producción, hacerlo manualmente desde Admin y con autorización: elegir una película estrenada, sala libre y hora futura. Las funciones existentes inválidas se mantienen; si tienen entradas, cancelar según reglas y crear una nueva, no editar ni borrar historial. No se requiere para comprobar la corrección del catálogo vacío actual.
