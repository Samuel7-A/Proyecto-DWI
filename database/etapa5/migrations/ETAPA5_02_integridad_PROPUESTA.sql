-- Propuesta para cineverse-dwi auditado. No ejecutar sin revisión y respaldo.
-- Ejecutar como propietario, en ventana de mantenimiento. No modifica filas.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '120s';
SET LOCAL search_path = pg_catalog, public, extensions;
LOCK TABLE public.funciones, public.detalle_productos, public.salas, public.productos, public.usuarios IN SHARE ROW EXCLUSIVE MODE;
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM public.funciones a JOIN public.funciones b ON a.id<b.id AND a.sala_id=b.sala_id AND NOT a.cancelada AND NOT b.cancelada AND a.fecha_hora<b.fecha_hora_fin AND b.fecha_hora<a.fecha_hora_fin) THEN RAISE EXCEPTION 'Horarios solapados existentes: detener sin cambiar datos'; END IF;
 IF EXISTS (SELECT 1 FROM public.detalle_productos WHERE cantidad NOT BETWEEN 1 AND 10) THEN RAISE EXCEPTION 'Cantidad historica incompatible: detener'; END IF;
 IF EXISTS (SELECT 1 FROM public.detalle_productos GROUP BY orden_id,producto_id HAVING count(*)>1) THEN RAISE EXCEPTION 'Detalles duplicados existentes: detener'; END IF;
 IF EXISTS (SELECT 1 FROM public.salas GROUP BY lower(nombre) HAVING count(*)>1) OR EXISTS (SELECT 1 FROM public.productos GROUP BY lower(nombre) HAVING count(*)>1) THEN RAISE EXCEPTION 'Nombres duplicados existentes: detener'; END IF;
 IF EXISTS (SELECT 1 FROM public.usuarios GROUP BY lower(email) HAVING count(*)>1) THEN RAISE EXCEPTION 'Correos duplicados existentes: detener'; END IF;
END $$;
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.funciones'::regclass AND conname='cv5_funciones_sin_solapamiento') THEN
  ALTER TABLE public.funciones ADD CONSTRAINT cv5_funciones_sin_solapamiento EXCLUDE USING gist (sala_id WITH =, tsrange(fecha_hora,fecha_hora_fin,'[)') WITH &&) WHERE (cancelada=false);
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.detalle_productos'::regclass AND conname='cv5_detalle_cantidad_max') THEN
  ALTER TABLE public.detalle_productos ADD CONSTRAINT cv5_detalle_cantidad_max CHECK (cantidad BETWEEN 1 AND 10);
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.detalle_productos'::regclass AND conname='cv5_detalle_orden_producto_unico') THEN
  ALTER TABLE public.detalle_productos ADD CONSTRAINT cv5_detalle_orden_producto_unico UNIQUE (orden_id,producto_id);
 END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS cv5_salas_nombre_ci ON public.salas(lower(nombre));
CREATE UNIQUE INDEX IF NOT EXISTS cv5_productos_nombre_ci ON public.productos(lower(nombre));
CREATE UNIQUE INDEX IF NOT EXISTS cv5_usuarios_email_ci ON public.usuarios(lower(email));
COMMIT;
