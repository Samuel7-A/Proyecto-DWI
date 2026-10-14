/**
 * asientos.js
 * -----------------------------------------------------------------------
 * Vista de selección de asientos.
 * Depende de compra.js (helpers, estado y acceso a la API).
 *
 * Flujo: detalle.html?id=X → asientos.html?id=X → bocaditos.html
 * -----------------------------------------------------------------------
 */

let cvPelicula = null;
let cvFunciones = [];
let cvFuncionId = null;
let cvFuncion = null;
let cvDisponibles = [];
let cvOcupados = [];
let cvSeleccion = new Set(); // ids de asientos elegidos

const cvContenido = () => document.getElementById("cv-contenido");
const cvResumenBody = () => document.getElementById("cv-resumen-body");

/* ----------------------------- utilidades ------------------------------ */

function cvAsientoLabel(a) {
  return `${a.fila}${a.numero}`;
}

function cvMovieStrip(pelicula) {
  return `
    <div class="cv-movie-strip">
      ${cvMiniPoster(pelicula)}
      <div>
        <h1 class="cv-movie-strip-title">${cvEscapeHtml(pelicula.titulo)}</h1>
        <p class="cv-movie-strip-meta">
          <span><i class="bi bi-tags"></i>${cvEscapeHtml(pelicula.genero)}</span>
          <span><i class="bi bi-clock"></i>${pelicula.duracionMinutos} min</span>
          <span><i class="bi bi-shield-check"></i>${cvEscapeHtml(pelicula.clasificacion)}</span>
        </p>
      </div>
    </div>`;
}

function cvFuncionesMarkup(funciones) {
  if (!funciones.length) {
    return `<div class="cv-alert cv-alert-info">
      <i class="bi bi-info-circle"></i>
      <span>No hay funciones disponibles para esta película en este momento.</span>
    </div>`;
  }

  return `
    <h2 class="cv-panel-title"><i class="bi bi-calendar3 me-2"></i>Elige tu función</h2>
    <p class="cv-panel-sub">Selecciona la fecha y el horario que prefieras.</p>
    <div class="cv-funciones" role="group" aria-label="Funciones disponibles">
      ${funciones.map((f) => {
        const activa = f.id === cvFuncionId;
        return `
          <button type="button" class="cv-funcion-pill ${activa ? "active" : ""}"
            data-funcion-id="${f.id}" aria-pressed="${activa}">
            <i class="bi bi-calendar-event"></i>
            <span>${cvFormatHora(f.fechaHora)}</span>
            <small>${cvFormatFecha(f.fechaHora)} · ${cvEscapeHtml(f.salaNombre || "Sala")}</small>
          </button>`;
      }).join("")}
    </div>
    <div id="cv-seat-area"></div>`;
}

function cvSeatAreaMarkup() {
  return `
    <div class="cv-screen" aria-hidden="true">
      <div class="cv-screen-bar"></div>
      <div class="cv-screen-label">PANTALLA</div>
    </div>
    <div id="cv-seat-map" class="cv-seat-map"></div>
    <div class="cv-legend" aria-hidden="true">
      <span class="cv-legend-item"><span class="cv-legend-swatch available"></span>Disponible</span>
      <span class="cv-legend-item"><span class="cv-legend-swatch selected"></span>Seleccionado</span>
      <span class="cv-legend-item"><span class="cv-legend-swatch occupied"></span>Ocupado</span>
    </div>`;
}

/* --------------------------- mapa de asientos -------------------------- */

function cvConstruirMapa() {
  const ocupadosIds = new Set(cvOcupados.map((o) => o.id));
  const todos = [...cvDisponibles, ...cvOcupados].sort((a, b) =>
    a.fila === b.fila ? a.numero - b.numero : a.fila.localeCompare(b.fila)
  );

  const porFila = {};
  todos.forEach((s) => {
    (porFila[s.fila] = porFila[s.fila] || []).push(s);
  });

  return Object.keys(porFila)
    .sort()
    .map((fila) => {
      const asientos = porFila[fila].sort((a, b) => a.numero - b.numero);
      const botones = asientos.map((a) => {
        const ocupado = ocupadosIds.has(a.id);
        const sel = cvSeleccion.has(a.id);
        const clase = ocupado ? "occupied" : sel ? "selected" : "available";
        const label = cvAsientoLabel(a);
        return `
          <button type="button" class="cv-seat ${clase}" data-id="${a.id}"
            data-fila="${a.fila}" data-numero="${a.numero}" ${ocupado ? "disabled" : ""}
            aria-label="${ocupado ? "Asiento " + label + " ocupado" : "Asiento " + label}"
            aria-pressed="${sel}">${a.numero}</button>`;
      }).join("");
      return `<div class="cv-row"><span class="cv-row-label">${fila}</span><div class="cv-row-seats">${botones}</div></div>`;
    })
    .join("");
}

/* ------------------------------ resumen -------------------------------- */

function cvRenderResumen() {
  const body = cvResumenBody();
  if (!body) return;

  const asientos = [...cvSeleccion];
  const cantidad = asientos.length;
  const precio = cvFuncion ? cvCentimos(cvFuncion.precio) : 0;
  const subtotal = cantidad * precio;

  const chips = asientos.length
    ? `<div class="cv-summary-seats">${asientos
        .map((id) => {
          const a = cvDisponibles.find((s) => s.id === id);
          return `<span class="cv-seat-chip">${a ? cvAsientoLabel(a) : ""}</span>`;
        })
        .join("")}</div>`
    : `<span class="cv-summary-val">—</span>`;

  body.innerHTML = `
    <ul class="cv-summary-list">
      <li class="cv-summary-item">
        <span class="cv-summary-key">Película</span>
        <span class="cv-summary-val">${cvPelicula ? cvEscapeHtml(cvPelicula.titulo) : "—"}</span>
      </li>
      <li class="cv-summary-item">
        <span class="cv-summary-key">Función</span>
        <span class="cv-summary-val">${cvFuncion ? cvFormatFechaHora(cvFuncion.fechaHora) : "—"}</span>
      </li>
      <li class="cv-summary-item">
        <span class="cv-summary-key">Sala</span>
        <span class="cv-summary-val">${cvFuncion ? cvEscapeHtml(cvFuncion.salaNombre || "—") : "—"}</span>
      </li>
      <li class="cv-summary-item">
        <span class="cv-summary-key">Asientos (${cantidad})</span>
        ${chips}
      </li>
    </ul>
    <div class="cv-summary-total">
      <span class="cv-summary-total-label">Subtotal entradas</span>
      <span class="cv-summary-total-value">${cvSoles(subtotal)}</span>
    </div>
    <div class="cv-actions">
      <button type="button" id="btn-continuar" class="btn-cv-primary" ${cantidad === 0 ? "disabled" : ""}>
        Continuar a bocaditos <i class="bi bi-arrow-right"></i>
      </button>
    </div>`;
}

/* --------------------------- cargar asientos --------------------------- */

async function cvCargarAsientos() {
  const area = document.getElementById("cv-seat-area");
  if (!area) return;

  area.innerHTML = `
    <div class="text-center py-4 text-muted-cv">
      <div class="spinner-border text-light mb-3" role="status"><span class="visually-hidden">Cargando…</span></div>
      <p class="mb-0">Cargando asientos…</p>
    </div>`;
  cvRenderResumen();

  try {
    const [disponibles, ocupados] = await Promise.all([
      cvGetAsientosDisponibles(cvFuncionId),
      cvGetAsientosOcupados(cvFuncionId)
    ]);

    cvDisponibles = disponibles || [];
    cvOcupados = ocupados || [];

    // Descarta de la selección previa los asientos que ya no están disponibles.
    const disponiblesIds = new Set(cvDisponibles.map((s) => s.id));
    cvSeleccion = new Set([...cvSeleccion].filter((id) => disponiblesIds.has(id)));

    if (cvDisponibles.length === 0) {
      area.innerHTML = `<div class="cv-alert cv-alert-info">
        <i class="bi bi-info-circle"></i>
        <span>Esta función no tiene asientos disponibles. Prueba con otra función.</span>
      </div>`;
      cvRenderResumen();
      return;
    }

    area.innerHTML = cvSeatAreaMarkup();
    document.getElementById("cv-seat-map").innerHTML = cvConstruirMapa();
    cvRenderResumen();
  } catch (err) {
    area.innerHTML = `<div class="cv-alert cv-alert-error">
      <i class="bi bi-exclamation-triangle"></i>
      <span>${cvEscapeHtml(err.message)}</span>
    </div>`;
    cvRenderResumen();
  }
}


/* ------------------------------ inicializar ---------------------------- */

async function cvInitAsientos() {
  cvRenderPasos("asientos");
  if (!cvRequireAuth()) return;
  if (cvAuthBloquearCompra()) return;

  const params = new URLSearchParams(window.location.search);
  const peliculaId = params.get("id");

  if (!peliculaId) {
    cvContenido().innerHTML = `<div class="cv-panel"><div class="cv-alert cv-alert-error">
      <i class="bi bi-exclamation-triangle"></i><span>No se indicó una película. <a href="cartelera.html" class="link-cv-arrow">Ver cartelera</a></span>
    </div></div>`;
    return;
  }

  // Restaurar selección previa (por si el usuario vuelve desde bocaditos).
  const guardado = cvCompraCargar();
  if (guardado && String(guardado.peliculaId) === String(peliculaId) && guardado.funcionId) {
    cvFuncionId = Number(guardado.funcionId);
  }
  if (guardado && Array.isArray(guardado.asientos)) {
    cvSeleccion = new Set(guardado.asientos.map((a) => a.id));
  }

  try {
    const [pelicula, funciones] = await Promise.all([
      cvGetPelicula(peliculaId),
      cvGetFunciones(peliculaId)
    ]);

    cvPelicula = pelicula;
    cvFunciones = funciones || [];

    // Si venimos con funcionId por URL/estado, validar que siga existiendo.
    if (cvFuncionId && !cvFunciones.some((f) => f.id === cvFuncionId)) {
      cvFuncionId = null;
    }
    if (!cvFuncionId && cvFunciones.length) {
      cvFuncionId = cvFunciones[0].id;
    }
    cvFuncion = cvFunciones.find((f) => f.id === cvFuncionId) || null;

    cvContenido().innerHTML = `
      <div class="cv-panel">
        ${cvMovieStrip(pelicula)}
        ${cvFuncionesMarkup(cvFunciones)}
      </div>`;

    cvRenderResumen();
    if (cvFuncionId) cvCargarAsientos();
  } catch (err) {
    cvContenido().innerHTML = `<div class="cv-panel"><div class="cv-alert cv-alert-error">
      <i class="bi bi-exclamation-triangle"></i><span>${cvEscapeHtml(err.message)}</span>
    </div></div>`;
  }
}

/* ------------------------------ eventos -------------------------------- */

function cvManejarClic(event) {
  const funcionBtn = event.target.closest("[data-funcion-id]");
  if (funcionBtn) {
    cvFuncionId = Number(funcionBtn.dataset.funcionId);
    cvFuncion = cvFunciones.find((f) => f.id === cvFuncionId) || null;
    cvSeleccion = new Set();
    document.querySelectorAll(".cv-funcion-pill").forEach((b) => b.classList.remove("active"));
    funcionBtn.classList.add("active");
    cvCargarAsientos();
    return;
  }

  const seat = event.target.closest(".cv-seat");
  if (seat && !seat.disabled) {
    const id = Number(seat.dataset.id);
    if (cvSeleccion.has(id)) {
      cvSeleccion.delete(id);
    } else {
      cvSeleccion.add(id);
    }
    // Actualiza solo el botón y el resumen (conserva el mapa y el foco).
    const ahoraSeleccionado = cvSeleccion.has(id);
    seat.classList.toggle("selected", ahoraSeleccionado);
    seat.classList.toggle("available", !ahoraSeleccionado);
    seat.setAttribute("aria-pressed", String(ahoraSeleccionado));
    cvRenderResumen();
    return;
  }

  if (event.target.closest("#btn-continuar")) {
    if (cvSeleccion.size === 0) return;

    const asientos = [...cvSeleccion]
      .map((id) => cvDisponibles.find((s) => s.id === id))
      .filter(Boolean)
      .map((s) => ({ id: s.id, fila: s.fila, numero: s.numero }));

    const estado = cvCompraCargar() || {};
    cvCompraActualizar({
      peliculaId: cvPelicula.id,
      pelicula: cvPelicula,
      funcionId: cvFuncion.id,
      funcion: cvFuncion,
      asientos,
      productos: estado.productos || []
    });

    window.location.href = "bocaditos.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cvInitAsientos();
  document.addEventListener("click", cvManejarClic);
});

