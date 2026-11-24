-- SOLO PostgreSQL local descartable. No ejecutar en Supabase real.
BEGIN;
DO $$
DECLARE p bigint; s bigint; s2 bigint; a bigint; f bigint; u bigint; o bigint; prod bigint;
BEGIN
 INSERT INTO public.peliculas(titulo,genero,duracion_minutos,clasificacion,fecha_estreno,estado) VALUES ('CV5 test','Drama',120,'APT',current_date,true) RETURNING id INTO p;
 INSERT INTO public.salas(nombre,filas,columnas) VALUES ('CV5 test',2,2) RETURNING id INTO s;
 INSERT INTO public.salas(nombre,filas,columnas) VALUES ('CV5 otra',2,2) RETURNING id INTO s2;
 INSERT INTO public.asientos(fila,numero,sala_id) VALUES ('A',1,s) RETURNING id INTO a;
 INSERT INTO public.usuarios(nombre,email,password,rol) VALUES ('CV5 test','cv5-test@example.invalid','dummy','CLIENTE') RETURNING id INTO u;
 INSERT INTO public.productos(nombre,categoria,precio) VALUES ('CV5 snack','DULCE',10) RETURNING id INTO prod;
 INSERT INTO public.funciones(pelicula_id,sala_id,fecha_hora,fecha_hora_fin,precio) VALUES(p,s,'2035-01-01 10:00','2035-01-01 12:00',18) RETURNING id INTO f;
 BEGIN
  INSERT INTO public.funciones(pelicula_id,sala_id,fecha_hora,fecha_hora_fin,precio) VALUES(p,s,'2035-01-01 11:00','2035-01-01 13:00',18);
  RAISE EXCEPTION 'FAIL: solapamiento'; EXCEPTION WHEN exclusion_violation THEN RAISE NOTICE 'PASS: solapamiento rechazado'; END;
 INSERT INTO public.funciones(pelicula_id,sala_id,fecha_hora,fecha_hora_fin,precio) VALUES(p,s,'2035-01-01 12:00','2035-01-01 14:00',18);
 RAISE NOTICE 'PASS: horario contiguo';
 INSERT INTO public.funciones(pelicula_id,sala_id,fecha_hora,fecha_hora_fin,precio) VALUES(p,s2,'2035-01-01 11:00','2035-01-01 13:00',18);
 RAISE NOTICE 'PASS: otra sala';
 INSERT INTO public.funciones(pelicula_id,sala_id,fecha_hora,fecha_hora_fin,precio,cancelada) VALUES(p,s,'2035-01-01 11:00','2035-01-01 13:00',18,true);
 RAISE NOTICE 'PASS: cancelada no bloquea';
 BEGIN
  INSERT INTO public.funciones(pelicula_id,sala_id,fecha_hora,fecha_hora_fin,precio) VALUES(p,s,'2035-01-01 16:00','2035-01-01 15:00',18);
  RAISE EXCEPTION 'FAIL: horario invertido'; EXCEPTION WHEN check_violation OR data_exception THEN RAISE NOTICE 'PASS: horario invertido rechazado'; END;
 INSERT INTO public.ordenes(usuario_id,estado,total) VALUES(u,'PAGADA',28) RETURNING id INTO o;
 INSERT INTO public.entradas(orden_id,funcion_id,asiento_id,precio_unitario) VALUES(o,f,a,18);
 BEGIN
  INSERT INTO public.entradas(orden_id,funcion_id,asiento_id,precio_unitario) VALUES(o,f,a,18);
  RAISE EXCEPTION 'FAIL: butaca duplicada'; EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'PASS: butaca duplicada rechazada'; END;
 BEGIN
  INSERT INTO public.detalle_productos(orden_id,producto_id,cantidad,precio_unitario) VALUES(o,prod,11,10);
  RAISE EXCEPTION 'FAIL: cantidad excesiva'; EXCEPTION WHEN check_violation THEN RAISE NOTICE 'PASS: cantidad excesiva rechazada'; END;
 INSERT INTO public.detalle_productos(orden_id,producto_id,cantidad,precio_unitario) VALUES(o,prod,1,10);
 BEGIN
  INSERT INTO public.detalle_productos(orden_id,producto_id,cantidad,precio_unitario) VALUES(o,prod,1,10);
  RAISE EXCEPTION 'FAIL: detalle duplicado'; EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'PASS: detalle duplicado rechazado'; END;
 BEGIN
  INSERT INTO public.salas(nombre,filas,columnas) VALUES('cv5 TEST',2,2);
  RAISE EXCEPTION 'FAIL: sala duplicada'; EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'PASS: sala duplicada rechazada'; END;
 BEGIN
  INSERT INTO public.productos(nombre,categoria,precio) VALUES('cv5 SNACK','DULCE',10);
  RAISE EXCEPTION 'FAIL: producto duplicado'; EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'PASS: producto duplicado rechazado'; END;
 BEGIN
  INSERT INTO public.usuarios(nombre,email,password,rol) VALUES('CV5 test','CV5-TEST@example.invalid','dummy','CLIENTE');
  RAISE EXCEPTION 'FAIL: correo duplicado'; EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'PASS: correo duplicado rechazado'; END;
END $$;
ROLLBACK;
