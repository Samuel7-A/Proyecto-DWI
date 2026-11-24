-- Ejecutar solo si faltantes=[] en 00. Solo lectura, resultados agregados.
BEGIN READ ONLY;
SELECT 'horarios_invalidos' AS control, (SELECT count(*) FROM public.funciones WHERE fecha_hora IS NULL OR fecha_hora_fin IS NULL OR fecha_hora_fin <= fecha_hora OR cancelada IS NULL) AS incidencias
UNION ALL
SELECT 'horarios_solapados' AS control, (SELECT count(*) FROM public.funciones a JOIN public.funciones b ON a.sala_id=b.sala_id AND a.id<b.id AND a.cancelada=false AND b.cancelada=false AND a.fecha_hora<b.fecha_hora_fin AND b.fecha_hora<a.fecha_hora_fin) AS incidencias
UNION ALL
SELECT 'butacas_duplicadas' AS control, (SELECT count(*) FROM (SELECT funcion_id,asiento_id FROM public.entradas GROUP BY 1,2 HAVING count(*)>1) x) AS incidencias
UNION ALL
SELECT 'asientos_duplicados' AS control, (SELECT count(*) FROM (SELECT sala_id,fila,numero FROM public.asientos GROUP BY 1,2,3 HAVING count(*)>1) x) AS incidencias
UNION ALL
SELECT 'asientos_sala_incorrecta' AS control, (SELECT count(*) FROM public.entradas e JOIN public.asientos a ON a.id=e.asiento_id JOIN public.funciones f ON f.id=e.funcion_id WHERE a.sala_id<>f.sala_id) AS incidencias
UNION ALL
SELECT 'asientos_fuera_dimensiones' AS control, (SELECT count(*) FROM public.asientos a JOIN public.salas s ON s.id=a.sala_id WHERE a.fila !~ '^[A-Z]$' OR ascii(a.fila)-64>s.filas OR a.numero<1 OR a.numero>s.columnas) AS incidencias
UNION ALL
SELECT 'ordenes_pagadas_canceladas' AS control, (SELECT count(DISTINCT o.id) FROM public.ordenes o JOIN public.entradas e ON e.orden_id=o.id JOIN public.funciones f ON f.id=e.funcion_id WHERE o.estado='PAGADA' AND f.cancelada) AS incidencias
UNION ALL
SELECT 'ordenes_total_incorrecto' AS control, (SELECT count(*) FROM public.ordenes o LEFT JOIN (SELECT orden_id,sum(precio_unitario) total FROM public.entradas GROUP BY orden_id) e ON e.orden_id=o.id LEFT JOIN (SELECT orden_id,sum(cantidad*precio_unitario) total FROM public.detalle_productos GROUP BY orden_id) d ON d.orden_id=o.id WHERE o.total<>coalesce(e.total,0)+coalesce(d.total,0)) AS incidencias
UNION ALL
SELECT 'ordenes_sin_entradas' AS control, (SELECT count(*) FROM public.ordenes o WHERE NOT EXISTS (SELECT 1 FROM public.entradas e WHERE e.orden_id=o.id)) AS incidencias
UNION ALL
SELECT 'ordenes_varias_funciones' AS control, (SELECT count(*) FROM (SELECT orden_id FROM public.entradas GROUP BY orden_id HAVING count(DISTINCT funcion_id)>1) x) AS incidencias
UNION ALL
SELECT 'email_duplicado_exacto' AS control, (SELECT count(*) FROM (SELECT email FROM public.usuarios GROUP BY email HAVING count(*)>1) x) AS incidencias
UNION ALL
SELECT 'email_duplicado_normalizado' AS control, (SELECT count(*) FROM (SELECT lower(trim(email)) FROM public.usuarios GROUP BY 1 HAVING count(*)>1) x) AS incidencias
UNION ALL
SELECT 'sala_nombre_duplicado_normalizado' AS control, (SELECT count(*) FROM (SELECT lower(trim(nombre)) FROM public.salas GROUP BY 1 HAVING count(*)>1) x) AS incidencias
UNION ALL
SELECT 'producto_nombre_duplicado_normalizado' AS control, (SELECT count(*) FROM (SELECT lower(trim(nombre)) FROM public.productos GROUP BY 1 HAVING count(*)>1) x) AS incidencias
UNION ALL
SELECT 'valores_invalidos' AS control, (SELECT (SELECT count(*) FROM public.salas WHERE filas NOT BETWEEN 1 AND 26 OR columnas NOT BETWEEN 1 AND 50) + (SELECT count(*) FROM public.peliculas WHERE duracion_minutos<=0 OR clasificacion NOT IN ('APT','+12','+14','+18')) + (SELECT count(*) FROM public.funciones WHERE precio<=0) + (SELECT count(*) FROM public.productos WHERE precio<=0 OR categoria NOT IN ('CANCHITA','BEBIDA','DULCE','COMBO')) + (SELECT count(*) FROM public.entradas WHERE precio_unitario<=0) + (SELECT count(*) FROM public.detalle_productos WHERE cantidad<=0 OR precio_unitario<0) + (SELECT count(*) FROM public.ordenes WHERE total<0 OR estado NOT IN ('PENDIENTE','PAGADA','CANCELADA')) + (SELECT count(*) FROM public.usuarios WHERE rol NOT IN ('ADMIN','CLIENTE'))) AS incidencias
UNION ALL
SELECT 'huerfanos_asientos_sala_id' AS control, (SELECT count(*) FROM public.asientos a LEFT JOIN public.salas b ON b.id=a.sala_id WHERE b.id IS NULL) AS incidencias
UNION ALL
SELECT 'huerfanos_funciones_sala_id' AS control, (SELECT count(*) FROM public.funciones a LEFT JOIN public.salas b ON b.id=a.sala_id WHERE b.id IS NULL) AS incidencias
UNION ALL
SELECT 'huerfanos_funciones_pelicula_id' AS control, (SELECT count(*) FROM public.funciones a LEFT JOIN public.peliculas b ON b.id=a.pelicula_id WHERE b.id IS NULL) AS incidencias
UNION ALL
SELECT 'huerfanos_ordenes_usuario_id' AS control, (SELECT count(*) FROM public.ordenes a LEFT JOIN public.usuarios b ON b.id=a.usuario_id WHERE b.id IS NULL) AS incidencias
UNION ALL
SELECT 'huerfanos_entradas_orden_id' AS control, (SELECT count(*) FROM public.entradas a LEFT JOIN public.ordenes b ON b.id=a.orden_id WHERE b.id IS NULL) AS incidencias
UNION ALL
SELECT 'huerfanos_entradas_funcion_id' AS control, (SELECT count(*) FROM public.entradas a LEFT JOIN public.funciones b ON b.id=a.funcion_id WHERE b.id IS NULL) AS incidencias
UNION ALL
SELECT 'huerfanos_entradas_asiento_id' AS control, (SELECT count(*) FROM public.entradas a LEFT JOIN public.asientos b ON b.id=a.asiento_id WHERE b.id IS NULL) AS incidencias
UNION ALL
SELECT 'huerfanos_detalle_productos_orden_id' AS control, (SELECT count(*) FROM public.detalle_productos a LEFT JOIN public.ordenes b ON b.id=a.orden_id WHERE b.id IS NULL) AS incidencias
UNION ALL
SELECT 'huerfanos_detalle_productos_producto_id' AS control, (SELECT count(*) FROM public.detalle_productos a LEFT JOIN public.productos b ON b.id=a.producto_id WHERE b.id IS NULL) AS incidencias
UNION ALL
SELECT 'huerfanos_notificaciones_usuario_id' AS control, (SELECT count(*) FROM public.notificaciones a LEFT JOIN public.usuarios b ON b.id=a.usuario_id WHERE b.id IS NULL) AS incidencias
ORDER BY control;
COMMIT;
