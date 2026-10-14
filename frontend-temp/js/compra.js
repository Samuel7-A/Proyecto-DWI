/**
 * compra.js
 * -----------------------------------------------------------------------
 * Utilidades compartidas del flujo de compra de CineVerse:
 *   Detalle de película → Selección de asientos → Bocaditos → Checkout.
 *
 * Se carga en asientos.html, bocaditos.html y checkout.html.
 * No depende de data.js ni de public.js.
 *
 * Guarda la compra en curso en sessionStorage con la clave CV_COMPRA_KEY
 * para conservar película, función, asientos y productos entre páginas.
 * -----------------------------------------------------------------------
 */

const CV_API_BASE = "http://localhost:8080/api";
const CV_COMPRA_KEY = "cv_compra";
const CV_CANTIDAD_MAX = 10;

/* Paleta de gradientes para el "poster" temporal (igual que public.js). */
const CV_POSTER_GRADIENTS = [
  "linear-gradient(160deg, #3a1420 0%, #17171f 75%)",
  "linear-gradient(160deg, #1f2a3a 0%, #17171f 75%)",
  "linear-gradient(160deg, #24331f 0%, #17171f 75%)",
  "linear-gradient(160deg, #3a2a14 0%, #17171f 75%)",
  "linear-gradient(160deg, #2a1f3a 0%, #17171f 75%)",
  "linear-gradient(160deg, #1f3a36 0%, #17171f 75%)"
];

/* ----------------------------------------------------------------------- */
/* Utilidades de formato                                                    */
/* ----------------------------------------------------------------------- */

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

function cvGradientFor(id) {
  const idx = Number(id) % CV_POSTER_GRADIENTS.length;
  return CV_POSTER_GRADIENTS[idx];
}

/** Normaliza el LocalDateTime de Spring Boot (string ISO o array [año,mes,día,h,m]). */
function cvParseFechaHora(fechaHora) {
  if (!fechaHora) return null;
  let d;
  if (Array.isArray(fechaHora)) {
    const [anio, mes, dia, hora = 0, min = 0] = fechaHora;
    d = new Date(anio, mes - 1, dia, hora, min);
  } else {
    d = new Date(fechaHora);
  }
  return isNaN(d.getTime()) ? null : d;
}

function cvFormatFechaHora(fechaHora) {
  const d = cvParseFechaHora(fechaHora);
  if (!d) return "Sin fecha";
  return (
    d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
  );
}

function cvFormatHora(fechaHora) {
  const d = cvParseFechaHora(fechaHora);
  if (!d) return "";
  return d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

function cvFormatFecha(fechaHora) {
  const d = cvParseFechaHora(fechaHora);
  if (!d) return "";
  return d.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  });
}

/* ----------------------------------------------------------------------- */
/* Sesión y estado de la compra                                             */
/* ----------------------------------------------------------------------- */

function cvToken() {
  return localStorage.getItem("cv_token") || "";
}

/**
 * Garantiza que el usuario esté autenticado. Si no lo está, redirige a
 * login.html conservando la URL actual para volver después del login.
 */
function cvRequireAuth() {
  if (cvToken()) return true;
  const returnUrl = encodeURIComponent(window.location.href);
  window.location.replace(`login.html?redirect=${returnUrl}`);
  return false;
}

function cvCompraCargar() {
  try {
    return JSON.parse(sessionStorage.getItem(CV_COMPRA_KEY) || "null");
  } catch (e) {
    return null;
  }
}

function cvCompraGuardar(estado) {
  try {
    sessionStorage.setItem(CV_COMPRA_KEY, JSON.stringify(estado));
  } catch (e) {
    /* sin almacenamiento disponible: la compra vive solo en pantalla */
  }
}

function cvCompraActualizar(parcial) {
  const actual = cvCompraCargar() || {};
  cvCompraGuardar(Object.assign(actual, parcial));
}

function cvCompraLimpiar() {
  try {
    sessionStorage.removeItem(CV_COMPRA_KEY);
  } catch (e) {
    /* noop */
  }
}

/* ----------------------------------------------------------------------- */
/* Acceso a la API                                                          */
/* ----------------------------------------------------------------------- */

async function cvFetchJson(url, options = {}) {
  let res;
  try {
    res = await fetch(url, options);
  } catch (e) {
    throw new Error(
      "No se pudo conectar con el servidor. Verifica que el backend esté encendido en localhost:8080."
    );
  }

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const mensaje =
      (data && (data.mensaje || data.error || data.message)) ||
      `Error del servidor (HTTP ${res.status}).`;
    throw new Error(mensaje);
  }

  return data;
}

async function cvGetPelicula(id) {
  return cvFetchJson(`${CV_API_BASE}/peliculas/${id}`);
}

async function cvGetFunciones(peliculaId) {
  return cvFetchJson(`${CV_API_BASE}/funciones?peliculaId=${encodeURIComponent(peliculaId)}`);
}

async function cvGetAsientosDisponibles(funcionId) {
  return cvFetchJson(`${CV_API_BASE}/funciones/${funcionId}/asientos/disponibles`);
}

async function cvGetAsientosOcupados(funcionId) {
  return cvFetchJson(`${CV_API_BASE}/funciones/${funcionId}/asientos/ocupados`);
}

async function cvGetProductos() {
  return cvFetchJson(`${CV_API_BASE}/productos`);
}

/** Crea la orden en el backend. Requiere token JWT. */
async function cvCrearOrden(payload) {
  return cvFetchJson(`${CV_API_BASE}/ordenes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cvToken()}`
    },
    body: JSON.stringify(payload)
  });
}

/* ----------------------------------------------------------------------- */
/* Indicador de progreso del proceso de compra                              */
/* ----------------------------------------------------------------------- */

const CV_PASOS = [
  { id: "asientos", etiqueta: "Asientos", icono: "bi-grid-3x3-gap" },
  { id: "bocaditos", etiqueta: "Bocaditos", icono: "bi-cup-straw" },
  { id: "checkout", etiqueta: "Checkout", icono: "bi-credit-card" }
];

/** Dibuja el indicador de pasos dentro de #cv-pasos (si existe). */
function cvRenderPasos(pasoActual) {
  const contenedor = document.getElementById("cv-pasos");
  if (!contenedor) return;

  const idxActual = CV_PASOS.findIndex((p) => p.id === pasoActual);

  contenedor.innerHTML = `
    <ol class="cv-steps" aria-label="Progreso de la compra">
      ${CV_PASOS.map((paso, i) => {
        const estado = i < idxActual ? "done" : i === idxActual ? "active" : "";
        const icono = i < idxActual ? "bi-check-lg" : paso.icono;
        return `
          <li class="cv-step ${estado}">
            <span class="cv-step-dot"><i class="bi ${icono}"></i></span>
            <span class="cv-step-label">${paso.etiqueta}</span>
          </li>`;
      }).join("")}
    </ol>`;
}

/* ----------------------------------------------------------------------- */
/* Utilidades de construcción de UI (compartidas)                           */
/* ----------------------------------------------------------------------- */

/** Mini-poster reutilizado en el resumen de película de las 3 vistas. */
function cvMiniPoster(pelicula) {
  const titulo = cvEscapeHtml(pelicula ? pelicula.titulo : "");
  if (pelicula && pelicula.imagenUrl) {
    return `<div class="cv-mini-poster" style="background-image:url('${pelicula.imagenUrl}');background-size:cover;background-position:center;"></div>`;
  }
  return `<div class="cv-mini-poster" style="background:${cvGradientFor(pelicula ? pelicula.id : 0)};">
    <i class="bi bi-film"></i>
    <span>${titulo}</span>
  </div>`;
}

/** Etiqueta de categoría de producto (con icono). */
function cvCategoriaInfo(categoria) {
  const mapa = {
    CANCHITA: { label: "Canchita", icon: "bi-basket2" },
    BEBIDA: { label: "Bebidas", icon: "bi-cup-straw" },
    DULCE: { label: "Dulces", icon: "bi-cake2" },
    COMBO: { label: "Combos", icon: "bi-gift" }
  };
  return mapa[categoria] || { label: categoria || "Producto", icon: "bi-bag" };
}

