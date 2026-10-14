/**
 * productos.js
 * -----------------------------------------------------------------------
 * Catálogo público de productos (dulcería) de CineVerse.
 * Depende de data.js (getProductos).
 *
 * La selección NO se envía al servidor: queda en sessionStorage con el
 * mismo formato que espera POST /api/ordenes, para que el flujo de compra
 * pueda usarla después:  [{ "productoId": 2, "cantidad": 1 }, ...]
 * -----------------------------------------------------------------------
 */

const CV_SELECCION_KEY = "cv_seleccion_productos";
const CV_CANTIDAD_MAX = 10;

const CV_CATEGORIAS = {
  CANCHITA: { label: "Canchita", icon: "bi-basket2" },
  BEBIDA: { label: "Bebidas", icon: "bi-cup-straw" },
  DULCE: { label: "Dulces", icon: "bi-cake2" },
  COMBO: { label: "Combos", icon: "bi-gift" }
};

let cvProductos = [];
let cvSeleccion = {}; // { [productoId]: cantidad }
let cvFiltroCategoria = "";

/* ------------------------------ utilidades ------------------------------ */

function cvEscapeHtml(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cvCentimos(precio) {
  return Math.round(Number(precio) * 100);
}

function cvSoles(centimos) {
  return `S/ ${(centimos / 100).toFixed(2)}`;
}

function cvCategoriaInfo(categoria) {
  return CV_CATEGORIAS[categoria] || { label: categoria, icon: "bi-bag" };
}

/* ------------------------------ selección ------------------------------- */

function cvCargarSeleccion() {
  try {
    const guardado = JSON.parse(sessionStorage.getItem(CV_SELECCION_KEY) || "[]");
    const seleccion = {};
    guardado.forEach((item) => {
      const cantidad = Number(item.cantidad);
      if (item.productoId && cantidad > 0) {
        seleccion[item.productoId] = Math.min(cantidad, CV_CANTIDAD_MAX);
      }
    });
    return seleccion;
  } catch (e) {
    return {};
  }
}

/** Formato listo para el body de POST /api/ordenes (campo "productos"). */
function cvSeleccionParaOrden() {
  return Object.entries(cvSeleccion)
    .filter(([, cantidad]) => cantidad > 0)
    .map(([id, cantidad]) => ({ productoId: Number(id), cantidad }));
}

function cvGuardarSeleccion() {
  try {
    sessionStorage.setItem(CV_SELECCION_KEY, JSON.stringify(cvSeleccionParaOrden()));
  } catch (e) {
    /* sin almacenamiento disponible: la selección vive solo en pantalla */
  }
}

function cvCambiarCantidad(id, delta) {
  const actual = cvSeleccion[id] || 0;
  const nueva = Math.max(0, Math.min(CV_CANTIDAD_MAX, actual + delta));

  if (nueva === 0) {
    delete cvSeleccion[id];
  } else {
    cvSeleccion[id] = nueva;
  }

  cvGuardarSeleccion();
  cvActualizarTarjeta(id);
  cvRenderResumen();
}

function cvVaciarSeleccion() {
  cvSeleccion = {};
  cvGuardarSeleccion();
  cvRenderGrid();
  cvRenderResumen();
}

/* -------------------------------- render -------------------------------- */

function cvTarjetaProducto(producto) {
  const info = cvCategoriaInfo(producto.categoria);
  const nombre = cvEscapeHtml(producto.nombre);
  const cantidad = cvSeleccion[producto.id] || 0;

  return `
    <div class="col">
      <article class="cv-card cv-prod-card ${cantidad > 0 ? "is-selected" : ""}" data-card="${producto.id}">
        <div class="cv-prod-visual" aria-hidden="true">
          <i class="bi ${info.icon}"></i>
        </div>
        <div class="cv-card-body">
          <span class="cv-prod-categoria">${cvEscapeHtml(info.label)}</span>
          <h3 class="cv-card-title">${nombre}</h3>
          <p class="cv-prod-precio">${cvSoles(cvCentimos(producto.precio))}</p>
          <div class="cv-stepper" role="group" aria-label="Cantidad de ${nombre}">
            <button type="button" class="cv-stepper-btn" data-accion="menos" data-id="${producto.id}"
              aria-label="Quitar una unidad de ${nombre}" ${cantidad === 0 ? "disabled" : ""}>
              <i class="bi bi-dash-lg"></i>
            </button>
            <span class="cv-stepper-qty" data-qty="${producto.id}" aria-live="polite">${cantidad}</span>
            <button type="button" class="cv-stepper-btn" data-accion="mas" data-id="${producto.id}"
              aria-label="Agregar una unidad de ${nombre}" ${cantidad >= CV_CANTIDAD_MAX ? "disabled" : ""}>
              <i class="bi bi-plus-lg"></i>
            </button>
          </div>
        </div>
      </article>
    </div>`;
}

function cvRenderFiltros() {
  const contenedor = document.getElementById("cv-prod-filtros");
  if (!contenedor) return;

  const categorias = [...new Set(cvProductos.map((p) => p.categoria))];
  const opciones = [{ valor: "", label: "Todos" }].concat(
    categorias.map((c) => ({ valor: c, label: cvCategoriaInfo(c).label }))
  );

  contenedor.innerHTML = opciones
    .map(
      (o) => `
      <button type="button" class="cv-chip-filtro ${o.valor === cvFiltroCategoria ? "active" : ""}"
        data-categoria="${cvEscapeHtml(o.valor)}" aria-pressed="${o.valor === cvFiltroCategoria}">
        ${cvEscapeHtml(o.label)}
      </button>`
    )
    .join("");
}

function cvRenderGrid() {
  const grid = document.getElementById("cv-prod-grid");
  if (!grid) return;

  const visibles = cvFiltroCategoria
    ? cvProductos.filter((p) => p.categoria === cvFiltroCategoria)
    : cvProductos;

  if (visibles.length === 0) {
    grid.innerHTML = cvEmptyProductos(
      cvProductos.length === 0
        ? "Todavía no hay productos disponibles. Vuelve en unos minutos."
        : "No hay productos en esta categoría."
    );
    return;
  }

  grid.innerHTML = visibles.map(cvTarjetaProducto).join("");
}

/** Actualiza una sola tarjeta sin volver a dibujar la grilla (conserva el foco). */
function cvActualizarTarjeta(id) {
  const cantidad = cvSeleccion[id] || 0;
  const card = document.querySelector(`[data-card="${id}"]`);
  if (!card) return;

  card.classList.toggle("is-selected", cantidad > 0);
  card.querySelector(`[data-qty="${id}"]`).textContent = cantidad;
  card.querySelector('[data-accion="menos"]').disabled = cantidad === 0;
  card.querySelector('[data-accion="mas"]').disabled = cantidad >= CV_CANTIDAD_MAX;
}

function cvRenderResumen() {
  const barra = document.getElementById("cv-prod-resumen");
  if (!barra) return;

  let unidades = 0;
  let totalCentimos = 0;

  cvProductos.forEach((p) => {
    const cantidad = cvSeleccion[p.id] || 0;
    unidades += cantidad;
    totalCentimos += cantidad * cvCentimos(p.precio);
  });

  barra.hidden = unidades === 0;
  document.getElementById("cv-prod-resumen-texto").textContent =
    `${unidades} ${unidades === 1 ? "producto" : "productos"}`;
  document.getElementById("cv-prod-resumen-total").textContent = cvSoles(totalCentimos);
}

function cvEmptyProductos(mensaje) {
  return `
    <div class="col-12">
      <div class="cv-empty-state">
        <i class="bi bi-bag mb-2 d-block" style="font-size:1.8rem;"></i>
        ${cvEscapeHtml(mensaje)}
      </div>
    </div>`;
}

function cvSkeletonProductos(n) {
  return Array.from({ length: n })
    .map(() => `<div class="col"><div class="cv-skeleton" style="height:260px;"></div></div>`)
    .join("");
}

/* --------------------------------- init --------------------------------- */

async function initProductosPage() {
  const grid = document.getElementById("cv-prod-grid");
  if (!grid) return;

  grid.innerHTML = cvSkeletonProductos(4);

  try {
    cvProductos = await getProductos();
  } catch (error) {
    grid.innerHTML = `
      <div class="col-12">
        <div class="cv-empty-state">
          <i class="bi bi-wifi-off mb-2 d-block" style="font-size:1.8rem;"></i>
          No se pudo cargar el catálogo. Revisa que el backend esté encendido en localhost:8080.
          <div class="mt-3">
            <button type="button" class="btn-cv-outline" id="cv-prod-reintentar">Reintentar</button>
          </div>
        </div>
      </div>`;
    document.getElementById("cv-prod-reintentar").addEventListener("click", initProductosPage);
    return;
  }

  // Descarta de la selección guardada los productos que ya no están a la venta.
  const guardada = cvCargarSeleccion();
  cvSeleccion = {};
  cvProductos.forEach((p) => {
    if (guardada[p.id]) cvSeleccion[p.id] = guardada[p.id];
  });
  cvGuardarSeleccion();

  cvRenderFiltros();
  cvRenderGrid();
  cvRenderResumen();
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("cv-prod-grid")) return;

  document.getElementById("cv-prod-grid").addEventListener("click", (event) => {
    const boton = event.target.closest("[data-accion]");
    if (!boton || boton.disabled) return;
    cvCambiarCantidad(Number(boton.dataset.id), boton.dataset.accion === "mas" ? 1 : -1);
  });

  document.getElementById("cv-prod-filtros").addEventListener("click", (event) => {
    const chip = event.target.closest("[data-categoria]");
    if (!chip) return;
    cvFiltroCategoria = chip.dataset.categoria;
    cvRenderFiltros();
    cvRenderGrid();
  });

  document.getElementById("cv-prod-vaciar").addEventListener("click", cvVaciarSeleccion);

  initProductosPage();
});
