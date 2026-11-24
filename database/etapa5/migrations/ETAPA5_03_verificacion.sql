BEGIN READ ONLY;
SELECT conrelid::regclass AS tabla,conname,pg_get_constraintdef(oid) AS definicion,convalidated FROM pg_constraint WHERE conname IN ('cv5_funciones_sin_solapamiento','cv5_detalle_cantidad_max','cv5_detalle_orden_producto_unico') AND connamespace='public'::regnamespace ORDER BY conname;
SELECT tablename,indexname,indexdef FROM pg_indexes WHERE schemaname='public' AND indexname IN ('cv5_salas_nombre_ci','cv5_productos_nombre_ci','cv5_usuarios_email_ci') ORDER BY indexname;
SELECT extname,extversion FROM pg_extension WHERE extname='btree_gist';
SELECT 'usuarios' tabla,count(*) n FROM public.usuarios UNION ALL SELECT 'peliculas',count(*) FROM public.peliculas UNION ALL SELECT 'salas',count(*) FROM public.salas UNION ALL SELECT 'asientos',count(*) FROM public.asientos UNION ALL SELECT 'funciones',count(*) FROM public.funciones UNION ALL SELECT 'productos',count(*) FROM public.productos UNION ALL SELECT 'ordenes',count(*) FROM public.ordenes UNION ALL SELECT 'entradas',count(*) FROM public.entradas UNION ALL SELECT 'detalle_productos',count(*) FROM public.detalle_productos UNION ALL SELECT 'notificaciones',count(*) FROM public.notificaciones;
COMMIT;
