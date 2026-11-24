# Evidencia de migración — CineVerse
Fecha: 24/11/2026. Proyecto cineverse-dwi; PostgreSQL 17.11. Commit de referencia c21f518.

## Pruebas y respaldo previos
- 111 pruebas Java H2 y 13 Angular aprobadas en etapa 4; build Angular exitoso.
- 11 pruebas SQL y 1 de concurrencia PostgreSQL 17 en Docker aprobadas; migración ejecutada dos veces. Prueba concurrente: una operación confirmada y otra rechazada (SQLSTATE 23P01).
- Respaldo privado `cineverse_20261124_105218.dump`, 40 488 bytes; `pg_restore --list` exitoso. No se ejecutó restauración completa. No se incluye el respaldo.

## Aplicación autorizada
Migración Supabase `20261124155433` / `cineverse_etapa5_integridad`: resultado exitoso. SQL conservado byte por byte, SHA-256 `357c69daa846e159453e519dde164ff0616dfedd88fbbcaadf41fbf01bb40ff8`. Transacción BEGIN/COMMIT; sin DELETE, UPDATE, DROP ni TRUNCATE de datos de negocio.

| Tabla | Antes | Después | Huella del contenido coincide |
|---|---:|---:|---|
| usuarios | 3 | 3 | Sí |
| peliculas | 1 | 1 | Sí |
| salas | 2 | 2 | Sí |
| asientos | 962 | 962 | Sí |
| funciones | 1 | 1 | Sí |
| productos | 4 | 4 | Sí |
| ordenes | 1 | 1 | Sí |
| entradas | 1 | 1 | Sí |
| detalle_productos | 1 | 1 | Sí |
| notificaciones | 1 | 1 | Sí |
| Total | 977 | 977 | 10/10 tablas |

Método: COUNT(*) y MD5 agregado de las filas serializadas con to_jsonb, ordenadas por id, antes y después. Se publican únicamente resultados agregados, no contraseñas, hashes de usuarios ni datos personales.

## Verificación posterior
- `cv5_funciones_sin_solapamiento`: EXCLUDE GiST por sala e intervalo [inicio,fin), solo no canceladas; validada.
- `cv5_detalle_cantidad_max`: CHECK 1..10; validada.
- `cv5_detalle_orden_producto_unico`: UNIQUE(orden_id,producto_id); validada.
- `cv5_salas_nombre_ci`, `cv5_productos_nombre_ci`, `cv5_usuarios_email_ci`: índices únicos válidos.
- btree_gist 1.7 instalado.
- 13 comprobaciones sin incidencias: solapamientos, horario inválido, butacas duplicadas, asiento de sala incorrecta, orden pagada de función cancelada, detalle duplicado, cantidad inválida, total incorrecto, capacidad de sala, asientos fuera de límites, nombres duplicados de salas/productos y correos duplicados.
- 10/10 tablas RLS activado; anon/authenticated sin SELECT. Asesor seguridad: 10 avisos INFO RLS sin políticas; rendimiento: 5 avisos INFO índices sin uso. Se conservan los índices.

## Pendientes al momento de preparar el cierre
136 pruebas acumuladas previamente aprobadas (111+13+12); las nuevas pruebas Spring/PostgreSQL son adicionales y aún no ejecutadas. La verificación de esquema en la nube se hizo por catálogo, no mediante Hibernate conectado a producción. No repetir la migración de nube para este cierre.
