package com.cineverse.backend.service;

import com.cineverse.backend.dto.FuncionRequest;
import com.cineverse.backend.dto.OrdenRequest;
import com.cineverse.backend.exception.ConflictoException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;

import static org.junit.jupiter.api.Assertions.*;

/** Opt-in: solo el runner Docker local; no coincide con los patrones Test de Surefire. */
@SpringBootTest
@ActiveProfiles("supabase")
class PostgresEtapa5IT {
    @DynamicPropertySource
    static void localDatabase(DynamicPropertyRegistry r) {
        String port = System.getenv("CV5_PG_PORT");
        String db = System.getenv("CV5_PG_DATABASE");
        String pass = System.getenv("CV5_PG_PASSWORD");
        if (port == null || !port.matches("[0-9]{1,5}") || Integer.parseInt(port) < 1
                || Integer.parseInt(port) > 65535 || db == null || !db.matches("cv5_it_[0-9a-f]{12}")
                || pass == null || !pass.matches("[0-9a-f]{48}")) {
            throw new IllegalStateException("Usar exclusivamente probar_spring_postgresql_local.py");
        }
        r.add("spring.datasource.url", () -> "jdbc:postgresql://127.0.0.1:" + port + "/" + db);
        r.add("spring.datasource.username", () -> "postgres");
        r.add("spring.datasource.password", () -> pass);
        r.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        r.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        r.add("spring.datasource.hikari.maximum-pool-size", () -> "3");
        r.add("spring.h2.console.enabled", () -> "false");
        r.add("spring.sql.init.mode", () -> "never");
    }

    @Autowired JdbcTemplate jdbc;
    @Autowired Environment env;
    @Autowired OrdenService ordenService;
    @Autowired FuncionService funcionService;

    record Fixture(String email, long pelicula, long sala, long asiento, long funcion, LocalDateTime inicio) {}

    Fixture fixture() {
        String suffix = UUID.randomUUID().toString();
        String email = suffix + "@cv5.invalid";
        jdbc.update("INSERT INTO usuarios(nombre,email,password,rol,activo) VALUES(?,?,?,'CLIENTE',true)", "QA", email, "no-login-test");
        long p = jdbc.queryForObject("INSERT INTO peliculas(titulo,genero,duracion_minutos,clasificacion,fecha_estreno,estado) VALUES(?,'Drama',120,'APT',?,true) RETURNING id", Long.class, suffix, ReglasCartelera.ahora().toLocalDate());
        long s = jdbc.queryForObject("INSERT INTO salas(nombre,filas,columnas) VALUES(?,1,1) RETURNING id", Long.class, suffix);
        long a = jdbc.queryForObject("INSERT INTO asientos(sala_id,fila,numero) VALUES(?,'A',1) RETURNING id", Long.class, s);
        LocalDateTime inicio = ReglasCartelera.ahora().plusDays(2).withNano(0);
        long f = jdbc.queryForObject("INSERT INTO funciones(pelicula_id,sala_id,fecha_hora,fecha_hora_fin,precio) VALUES(?,?,?,?,18.00) RETURNING id", Long.class, p,s,inicio,inicio.plusHours(2));
        return new Fixture(email,p,s,a,f,inicio);
    }

    long count(String sql, Object... args) { return jdbc.queryForObject(sql, Long.class, args); }
    boolean comprar(Fixture f) {
        try { ordenService.crearOrden(f.email(),new OrdenRequest(f.funcion(),List.of(f.asiento()),null)); return true; }
        catch (ConflictoException e) { return false; }
    }
    <T> List<T> simultaneas(Callable<T> first, Callable<T> second) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(2);
        CountDownLatch start = new CountDownLatch(1);
        try {
            Future<T> a = pool.submit(() -> { start.await(); return first.call(); });
            Future<T> b = pool.submit(() -> { start.await(); return second.call(); });
            start.countDown();
            return List.of(a.get(30,TimeUnit.SECONDS),b.get(30,TimeUnit.SECONDS));
        } finally { pool.shutdownNow(); }
    }

    @Test void esquemaValidadoPorHibernate() {
        assertEquals(System.getenv("CV5_PG_DATABASE"), jdbc.queryForObject("select current_database()",String.class));
        assertEquals("validate",env.getProperty("spring.jpa.hibernate.ddl-auto"));
        assertTrue(List.of(env.getActiveProfiles()).contains("supabase"));
        assertEquals(3L,count("SELECT count(*) FROM pg_constraint WHERE connamespace='public'::regnamespace AND conname IN ('cv5_funciones_sin_solapamiento','cv5_detalle_cantidad_max','cv5_detalle_orden_producto_unico') AND convalidated"));
    }
    @Test void dosComprasUnaButaca() throws Exception {
        Fixture f=fixture();
        var r=simultaneas(()->comprar(f),()->comprar(f));
        assertNotEquals(r.get(0),r.get(1));
        assertEquals(1L,count("SELECT count(*) FROM entradas WHERE funcion_id=?",f.funcion()));
        assertEquals(1L,count("SELECT count(*) FROM ordenes o JOIN usuarios u ON u.id=o.usuario_id WHERE u.email=?",f.email()));
    }
    @Test void compraContraCancelacion() throws Exception {
        Fixture f=fixture();
        simultaneas(()->comprar(f),()->{funcionService.cancelar(f.funcion());return true;});
        assertTrue(jdbc.queryForObject("SELECT cancelada FROM funciones WHERE id=?",Boolean.class,f.funcion()));
        assertEquals(0L,count("SELECT count(*) FROM ordenes o JOIN usuarios u ON u.id=o.usuario_id WHERE u.email=? AND o.estado='PAGADA'",f.email()));
        assertEquals(count("SELECT count(*) FROM ordenes o JOIN usuarios u ON u.id=o.usuario_id WHERE u.email=?",f.email()),count("SELECT count(*) FROM notificaciones n JOIN usuarios u ON u.id=n.usuario_id WHERE u.email=?",f.email()));
    }
    @Test void dosProgramacionesMismaSala() throws Exception {
        Fixture f=fixture();
        LocalDateTime inicio=f.inicio().plusDays(1);
        FuncionRequest request=new FuncionRequest(f.pelicula(),f.sala(),inicio,inicio.plusHours(2),new BigDecimal("18.00"));
        Callable<Boolean> crear=()->{
            try { funcionService.crear(request); return true; }
            catch (ConflictoException | DataIntegrityViolationException e) { return false; }
        };
        var r=simultaneas(crear,crear);
        assertNotEquals(r.get(0),r.get(1));
        assertEquals(1L,count("SELECT count(*) FROM funciones WHERE sala_id=? AND fecha_hora=?",f.sala(),inicio));
    }
}
