/**
 * checkout.js
 * -----------------------------------------------------------------------
 * Vista de checkout y confirmación de compra.
 * Depende de compra.js.
 *
 * Confirma la orden con POST /api/ordenes (endpoint real) y solo muestra
 * el estado "compra exitosa" después de una respuesta exitosa del backend.
 * -----------------------------------------------------------------------
 */

let cvCompra = null;
let cvCatalogo = new Map(); // id -> producto
let cvProductosValidos = []; // [{ productoId, cantidad, producto }]
let cvConfirmando = false;
let cvAviso = null;

/* ------------------------------ render ---------------------------------- */

function cvRenderConfirmacion(orden) {
  const cont = document.getElementById("cv-checkout");
  const total = orden.total != null ? cvSoles(cvCentimos(orden.total)) : "—";

  cont.innerHTML = `
    <div class="cv-panel cv-confirm">
      <div class="cv-confirm-badge"><i class="bi bi-check-lg"></i></div>
      <h1 class="cv-confirm-title">¡Compra confirmada!</h1>
      <p class="cv-confirm-sub">
        Tu pedido se registró correctamente en CineVerse.<br />
        Guarda el código de tu orden para recoger tus entradas.
      </p>
      <div class="cv-confirm-code">ORDEN #${orden.id}</div>
      <ul class="cv-summary-list text-start mb-0">
        <li class="cv-summary-item">
          <span class="cv-summary-key">Estado</span>
          <span class="cv-summary-val">${cvEscapeHtml(orden.estado || "PAGADA")}</span>
        </li>
        <li class="cv-summary-item">
          <span class="cv-summary-key">Total pagado</span>
          <span class="cv-summary-val">${total}</span>
        </li>
      </ul>
      <div class="cv-actions">
        <a href="cartelera.html" class="btn-cv-primary">Volver a la cartelera <i class="bi bi-arrow-right"></i></a>
      </div>
    </div>`;
}

function cvBillMarkup() {
  const pelicula = cvCompra.pelicula || {};
  const funcion = cvCompra.funcion || {};
  const asientos = cvCompra.asientos || [];

  const precioEntrada = cvCentimos(funcion.precio);
  const totalEntradas = asientos.length * precioEntrada;
  const totalBocaditos = cvProductosValidos.reduce(
    (acc, item) => acc + item.cantidad * cvCentimos(item.producto.precio),
    0
  );
  const total = totalEntradas + totalBocaditos;

  const filasEntradas = asientos
    .map(
      (a) => `
        <li class="cv-bill-row">
          <span><i class="bi bi-ticket-perforated me-2 text-cv-red"></i>Entrada · ${a.fila}${a.numero}</span>
          <span>${cvSoles(precioEntrada)}</span>
        </li>`
    )
    .join("");

  const filasBocaditos = cvProductosValidos.length
    ? cvProductosValidos
        .map(
          (item) => `
        <li class="cv-bill-row">
          <span><span class="cv-bill-qty">${item.cantidad} ×</span> ${cvEscapeHtml(item.producto.nombre)}</span>
          <span>${cvSoles(item.cantidad * cvCentimos(item.producto.precio))}</span>
        </li>`
        )
        .join("")
    : `<li class="cv-bill-row"><span class="cv-summary-key">No agregaste bocaditos</span><span>—</span></li>`;

  return `
    <div class="cv-panel">
      <div class="cv-movie-strip">
        ${cvMiniPoster(pelicula)}
        <div>
          <h1 class="cv-movie-strip-title">${cvEscapeHtml(pelicula.titulo || "")}</h1>
          <p class="cv-movie-strip-meta">
            <span><i class="bi bi-calendar-event"></i>${cvFormatFechaHora(funcion.fechaHora)}</span>
            <span><i class="bi bi-geo-alt"></i>${cvEscapeHtml(funcion.salaNombre || "Sala")}</span>
          </p>
        </div>
      </div>

      <ul class="cv-bill">
        <li class="cv-bill-section">Entradas (${asientos.length})</li>
        ${filasEntradas}
        <li class="cv-bill-section">Bocaditos y bebidas</li>
        ${filasBocaditos}
      </ul>

      <div class="cv-bill-total">
        <span class="cv-bill-label">Total a pagar</span>
        <span class="cv-bill-value">${cvSoles(total)}</span>
      </div>

      <div id="cv-checkout-aviso"></div>

      <div class="cv-actions">
        <a href="bocaditos.html" class="btn-cv-outline"><i class="bi bi-arrow-left"></i> Regresar</a>
        <button type="button" id="btn-confirmar" class="btn-cv-primary">
          <i class="bi bi-check-circle"></i> Confirmar compra
        </button>
      </div>
    </div>`;
}

/* ------------------------------ confirmar ------------------------------- */

async function cvConfirmarOrden() {
  if (cvConfirmando) return;
  cvConfirmando = true;

  const btn = document.getElementById("btn-confirmar");
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Confirmando…';

  cvAviso.innerHTML = `<div class="cv-alert cv-alert-info">
    <i class="bi bi-hourglass-split"></i><span>Procesando tu compra… no cierres la página.</span>
  </div>`;

  const payload = {
    funcionId: cvCompra.funcion.id,
    asientoIds: cvCompra.asientos.map((a) => a.id),
    productos: cvProductosValidos.length
      ? cvProductosValidos.map((p) => ({ productoId: p.productoId, cantidad: p.cantidad }))
      : null
  };

  try {
    const orden = await cvCrearOrden(payload);
    cvCompraLimpiar();
    cvRenderConfirmacion(orden);
  } catch (err) {
    cvConfirmando = false;
    btn.disabled = false;
    btn.innerHTML = original;
    cvAviso.innerHTML = `<div class="cv-alert cv-alert-error">
      <i class="bi bi-exclamation-triangle"></i><span>${cvEscapeHtml(err.message)}</span>
    </div>`;
  }
}

/* ------------------------------ inicializar ----------------------------- */

function cvEmptyCheckout(mensaje) {
  document.getElementById("cv-checkout").innerHTML = `
    <div class="cv-panel">
      <div class="cv-empty-state">
        <i class="bi bi-emoji-frown mb-2 d-block" style="font-size:1.8rem;"></i>
        ${cvEscapeHtml(mensaje)}
        <div class="mt-3"><a href="cartelera.html" class="btn-cv-outline">Ver cartelera</a></div>
      </div>
    </div>`;
}

async function cvInitCheckout() {
  cvRenderPasos("checkout");
  if (!cvRequireAuth()) return;
  if (cvAuthBloquearCompra()) return;

  cvCompra = cvCompraCargar();

  if (!cvCompra || !cvCompra.funcion || !cvCompra.asientos || cvCompra.asientos.length === 0) {
    cvEmptyCheckout("No tienes una compra en curso. Elige una función y tus asientos.");
    return;
  }

  const cont = document.getElementById("cv-checkout");
  cont.innerHTML = `<div class="cv-panel text-center py-5 text-muted-cv">
    <div class="spinner-border text-light mb-3" role="status"><span class="visually-hidden">Cargando…</span></div>
    <p class="mb-0">Preparando tu resumen…</p>
  </div>`;

  try {
    const productos = await cvGetProductos();
    cvCatalogo = new Map((productos || []).map((p) => [p.id, p]));

    // Mantiene solo los productos que siguen activos en el catálogo.
    const guardados = cvCompra.productos || [];
    cvProductosValidos = [];
    guardados.forEach((item) => {
      const prod = cvCatalogo.get(Number(item.productoId));
      if (prod && prod.activo !== false) {
        cvProductosValidos.push({
          productoId: prod.id,
          cantidad: Math.min(Number(item.cantidad) || 1, CV_CANTIDAD_MAX),
          producto: prod
        });
      }
    });
  } catch (err) {
    cvEmptyCheckout(err.message);
    return;
  }

  cont.innerHTML = cvBillMarkup();
  cvAviso = document.getElementById("cv-checkout-aviso");

  const btn = document.getElementById("btn-confirmar");
  if (btn) btn.addEventListener("click", cvConfirmarOrden);
}

document.addEventListener("DOMContentLoaded", cvInitCheckout);

