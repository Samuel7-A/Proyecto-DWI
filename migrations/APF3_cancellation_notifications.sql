-- =====================================================================
-- CineVerse APF3 — Migración no destructiva e idempotente (Supabase)
-- ---------------------------------------------------------------------
-- NO recrea ni borra datos. Se puede ejecutar más de una vez sin efectos
-- secundarios. Aplicar manualmente en el SQL editor de Supabase o con
-- psql antes de arrancar el backend (ddl-auto=validate).
-- =====================================================================

-- 1) Cancelación de funciones programadas (sin borrado físico).
ALTER TABLE funciones
    ADD COLUMN IF NOT EXISTS cancelada boolean NOT NULL DEFAULT false;

-- 2) Notificaciones persistentes por cliente (campana en el navbar).
CREATE TABLE IF NOT EXISTS notificaciones (
    id             BIGSERIAL PRIMARY KEY,
    usuario_id     BIGINT NOT NULL REFERENCES usuarios(id),
    mensaje        VARCHAR(500) NOT NULL,
    leida          boolean NOT NULL DEFAULT false,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT now()
);

-- Índice para consultar las no leídas de un cliente.
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_leida
    ON notificaciones (usuario_id, leida);
