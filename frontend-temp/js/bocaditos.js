/**
 * bocaditos.js
 * -----------------------------------------------------------------------
 * Vista de bocaditos y bebidas ("Completa tu experiencia").
 * Depende de compra.js.
 *
 * Flujo: asientos.html → bocaditos.html → checkout.html
 * -----------------------------------------------------------------------
 */

let cvCompra = null;
let cvProductos = [];
let cvSeleccionProd = {}; // { [productoId]: cantidad }

/* --------------------------- resumen de compra ------------------------- */

function cvRenderResumenCompra() {
  const cont = document.getElementById("cv-resumen-compra");
  if (!cont || !cvCompra) return;

  const pelicula = cvCompra.pelicula || {};
  const funcion = cvCompra.funcion || {};
  const asientos = cvCompra.asientos || [];

  const chips = asientos.length
    ? asientos.map((a) => `<span class="cv-seat-chip">${a.fila}${a.numero}</span>`).join("")
    : `<span class="cv-summary-val">—</span>`;

  cont.innerHTML = `
    <div class="cv-panel">
      <div class="cv-movie-strip mb-0">
        ${cvMiniPoster(pelicula)}
        <div class="flex-grow-1">
          <h2 class="cv-movie-strip-title mb-1">${cvEscapeHtml(pelicula.titulo || "")}</h2>
          <p class="cv-movie-strip-meta mb-0">
            <span><i class="bi bi-calendar-event"></i>${cvFormatFechaHora(funcion.fechaHora)}</span>
            <span><i class="bi bi-geo-alt"></i>${cvEscapeHtml(funcion.salaNombre || "Sala")}</span>
          </p>
        </div>
        <div class="text-end">
          <div class="text-muted-cv small mb-1">Tus asientos</div>
          <div class="cv-summary-seats justify-content-end">${chips}</div>
        </div>
      </div>
      <a href="asientos.html?id=${cvCompra.peliculaId || (pelicula.id || "")}" class="link-cv-arrow d-inline-flex mt-3">
        <i class="bi bi-arrow-left"></i> Modificar asientos
      </a>
    </div>`;
}

/* ----------------------------- tarjetas --------------------------------- */

function cvSnackCard(p) {
  const info = cvCategoriaInfo(p.categoria);
  const nombre = cvEscapeHtml(p.nombre);
  const cant = cvSeleccionProd[p.id] || 0;

  return `
    <article class="cv-snack-card ${cant > 0 ? "is-selected" : ""}" data-card="${p.id}">
      <div class="cv-snack-visual" aria-hidden="true"><i class="bi ${info.icon}"></i></div>
      <div class="cv-snack-body">
        <span class="cv-snack-cat">${info.label}</span>
        <h3 class="cv-snack-name">${nombre}</h3>
        <p class="cv-snack-precio">${cvSoles(cvCentimos(p.precio))}</p>
        <div class="d-flex align-items-center justify-content-between gap-2">
          <div class="cv-stepper" role="group" aria-label="Cantidad de ${nombre}">
            <button type="button" class="cv-stepper-btn" data-accion="menos" data-id="${p.id}"
              aria-label="Quitar una unidad de ${nombre}" ${cant === 0 ? "disabled" : ""}>
              <i class="bi bi-dash-lg"></i>
            </button>
            <span class="cv-stepper-qty" data-qty="${p.id}" aria-live="polite">${cant}</span>
            <button type="button" class="cv-stepper-btn" data-accion="mas" data-id="${p.id}"
              aria-label="Agregar una unidad de ${nombre}" ${cant >= CV_CANTIDAD_MAX ? "disabled" : ""}>
              <i class="bi bi-plus-lg"></i>
            </button>
          </div>
          ${cant > 0
            ? `<button type="button" class="cv-snack-remove" data-accion="quitar" data-id="${p.id}">
                 <i class="bi bi-x-lg"></i> Quitar
               </button>`
            : ""}
        </div>
      </div>
    </article>`;
}

function cvRenderGrid() {
  const grid = document.getElementById("cv-snack-grid");
  if (!grid) return;

  if (!cvProductos.length) {
    grid.innerHTML = `<div class="cv-empty-state col-12">
      <i class="bi bi-bag mb-2 d-block" style="font-size:1.8rem;"></i>
      Todavía no hay productos disponibles.
    </div>`;
    return;
  }

  grid.innerHTML = cvProductos.map(cvSnackCard).join("");
}

/* --------------------------- subtotal / acciones ------------------------ */

function cvTotalBocaditosCentimos() {
  let total = 0;
  cvProductos.forEach((p) => {
    total += (cvSeleccionProd[p.id] || 0) * cvCentimos(p.precio);
  });
  return total;
}

function cvRenderAcciones() {
  const cont = document.getElementById("cv-snack-acciones");
  if (!cont) return;

  let unidades = 0;
  cvProductos.forEach((p) => {
    unidades += cvSeleccionProd[p.id] || 0;
  });
  const subtotal = cvTotalBocaditosCentimos();

  cont.innerHTML = `
    <div class="cv-panel d-flex flex-wrap align-items-center justify-content-between gap-3">
      <div>
        <span class="text-muted-cv small d-block">
          ${unidades === 0 ? "Aún no agregaste bocaditos" : `${unidades} ${unidades === 1 ? "producto" : "productos"}`}
        </span>
        <span class="cv-summary-total-value">${cvSoles(subtotal)}</span>
      </div>
      <div class="cv-actions m-0">
        <a href="checkout.html" class="btn-cv-outline" id="btn-omitir">
          Omitir <i class="bi bi-arrow-right"></i>
        </a>
        <a href="checkout.html" class="btn-cv-primary" id="btn-continuar">
          Continuar al checkout <i class="bi bi-arrow-right"></i>
        </a>
      </div>
    </div>`;
}

/* ------------------------------ persistencia ---------------------------- */

function cvGuardarProductos() {
  const productos = Object.entries(cvSeleccionProd)
    .filter(([, cantidad]) => cantidad > 0)
    .map(([id, cantidad]) => ({ productoId: Number(id), cantidad }));
  cvCompraActualizar({ productos });
}

function cvCambiarCantidad(id, delta) {
  const actual = cvSeleccionProd[id] || 0;
  const nueva = Math.max(0, Math.min(CV_CANTIDAD_MAX, actual + delta));

  if (nueva === 0) {
    delete cvSeleccionProd[id];
  } else {
    cvSeleccionProd[id] = nueva;
  }

  cvGuardarProductos();
  cvActualizarTarjeta(id);
  cvRenderAcciones();
}

function cvQuitar(id) {
  delete cvSeleccionProd[id];
  cvGuardarProductos();
  cvRenderGrid();
  cvRenderAcciones();
}

function cvActualizarTarjeta(id) {
  const cantidad = cvSeleccionProd[id] || 0;
  const card = document.querySelector(`[data-card="${id}"]`);
  if (!card) return;

  card.classList.toggle("is-selected", cantidad > 0);
  card.querySelector(`[data-qty="${id}"]`).textContent = cantidad;
  card.querySelector('[data-accion="menos"]').disabled = cantidad === 0;
  card.querySelector('[data-accion="mas"]').disabled = cantidad >= CV_CANTIDAD_MAX;

  // Muestra/oculta el botón "Quitar".
  const zona = card.querySelector(".cv-snack-body > .d-flex");
  let btnQuitar = card.querySelector('[data-accion="quitar"]');
  if (cantidad > 0 && !btnQuitar) {
    const nombre = cvEscapeHtml(cvProductos.find((p) => p.id === id)?.nombre || "");
    btnQuitar = document.createElement("button");
    btnQuitar.type = "button";
    btnQuitar.className = "cv-snack-remove";
    btnQuitar.dataset.accion = "quitar";
    btnQuitar.dataset.id = String(id);
    btnQuitar.innerHTML = '<i class="bi bi-x-lg"></i> Quitar';
    zona.appendChild(btnQuitar);
  } else if (cantidad === 0 && btnQuitar) {
    btnQuitar.remove();
  }
}

/* ------------------------------ inicializar ----------------------------- */

function cvEmptyCompra(mensaje) {
  const grid = document.getElementById("cv-snack-grid");
  if (grid) {
    grid.innerHTML = `<div class="cv-empty-state">
      <i class="bi bi-emoji-frown mb-2 d-block" style="font-size:1.8rem;"></i>
      ${cvEscapeHtml(mensaje)}
      <div class="mt-3"><a href="cartelera.html" class="btn-cv-outline">Ver cartelera</a></div>
    </div>`;
  }
}

async function cvInitBocaditos() {
  cvRenderPasos("bocaditos");
  if (!cvRequireAuth()) return;
  if (cvAuthBloquearCompra()) return;

  cvCompra = cvCompraCargar();

  if (!cvCompra || !cvCompra.funcion || !cvCompra.asientos || cvCompra.asientos.length === 0) {
    cvEmptyCompra("No tienes una selección de asientos activa. Vuelve a elegir una función.");
    return;
  }

  cvRenderResumenCompra();

  const grid = document.getElementById("cv-snack-grid");
  grid.innerHTML = `
    <div class="cv-skeleton" style="height:240px; grid-column:1/-1;"></div>`;

  try {
    cvProductos = await cvGetProductos();
  } catch (err) {
    grid.innerHTML = `<div class="cv-empty-state col-12">
      <i class="bi bi-wifi-off mb-2 d-block" style="font-size:1.8rem;"></i>
      ${cvEscapeHtml(err.message)}
      <div class="mt-3"><button type="button" class="btn-cv-outline" id="btn-reintentar">Reintentar</button></div>
    </div>`;
    document.getElementById("btn-reintentar").addEventListener("click", cvInitBocaditos);
    return;
  }

  // Restaura cantidades guardadas, descartando productos que ya no existen.
  const guardados = (cvCompra.productos || []).reduce((acc, item) => {
    acc[item.productoId] = item.cantidad;
    return acc;
  }, {});
  cvSeleccionProd = {};
  cvProductos.forEach((p) => {
    if (guardados[p.id]) cvSeleccionProd[p.id] = Math.min(guardados[p.id], CV_CANTIDAD_MAX);
  });

  cvRenderGrid();
  cvRenderAcciones();
}

/* -------------------------------- eventos ------------------------------- */

function cvManejarClic(event) {
  const boton = event.target.closest("[data-accion]");
  if (!boton || boton.disabled) return;

  const id = Number(boton.dataset.id);
  const accion = boton.dataset.accion;

  if (accion === "mas") cvCambiarCantidad(id, 1);
  else if (accion === "menos") cvCambiarCantidad(id, -1);
  else if (accion === "quitar") cvQuitar(id);
}

document.addEventListener("DOMContentLoaded", () => {
  cvInitBocaditos();
  document.addEventListener("click", cvManejarClic);
});

