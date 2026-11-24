# CineVerse — Etapa 5: integridad y reproducibilidad
Base: commit c21f5186870473a7667ff01faa1b124049cd012a, rama feature/proyecto-final.
Migración ya aplicada a cineverse-dwi el 24/11/2026: `20261124155433_cineverse_etapa5_integridad`.
No volver a ejecutarla en Supabase como parte de este cierre. El nombre PROPUESTA se conserva para mantener idéntico el archivo que pasó las pruebas y fue aplicado.

## Archivos
- `migrations/ETAPA5_00_auditoria.sql`, `ETAPA5_01_integridad_lectura.sql`, `ETAPA5_03_verificacion.sql`: consultas de solo lectura.
- `migrations/ETAPA5_BASELINE_SOLO_BD_VACIA.sql`: únicamente para bases nuevas descartables. No ejecutar en producción.
- `migrations/ETAPA5_02_integridad_PROPUESTA.sql`: migración transaccional ya aplicada, SHA-256 `357c69daa846e159453e519dde164ff0616dfedd88fbbcaadf41fbf01bb40ff8`.
- `docs/modelos.md`: modelo conceptual, lógico y físico; `docs/evidencia_migracion.md`: resultados sin datos privados.
- `README_auditoria_original.md`: registro histórico previo a la aplicación; sus pendientes históricos no representan el estado actual.
- `tests/probar_postgresql_local.py`: 11 pruebas SQL y 1 prueba de concurrencia, aprobadas el 24/11/2026.
- `tests/probar_spring_postgresql_local.py`: prepara PostgreSQL 17 descartable e invoca exclusivamente PostgresEtapa5IT con perfil supabase y ddl-auto=validate. No usa credenciales de nube.

## Verificar desde la raíz del repositorio (Windows, Docker Desktop, Python 3.11+, Java 21)
```powershell
python .\database\etapa5\tests\probar_postgresql_local.py
python .\database\etapa5\tests\probar_spring_postgresql_local.py
```
La segunda prueba publica PostgreSQL en un puerto aleatorio de loopback, crea credenciales y una base temporal, verifica el esquema por Hibernate y prueba compras/cancelaciones y programación concurrente desde Spring. Solo elimina su contenedor y volumen al terminar. No ejecutar suites con limpieza de datos contra Supabase. Los resultados Maven están en `backend/target/surefire-reports`; no versionar target ni logs privados.

## Alcance
El baseline reproduce las tablas de negocio y sus restricciones, no toda la configuración gestionada de Supabase. El perfil JDBC se prueba contra PostgreSQL local con la misma estructura, no contra la nube. Pendientes de despliegue: verificar conectividad JDBC real sin escrituras, zona horaria America/Lima, privilegios mínimos, funciones futuras de demo, pruebas UI y rotación de credenciales expuestas. RLS permanece habilitado sin políticas públicas; el backend controla el acceso. No se agregan triggers para todas las reglas entre tablas ni se afirma que SQL directo impida todas las inconsistencias. Nunca versionar .env, dumps, contraseñas ni tokens.
