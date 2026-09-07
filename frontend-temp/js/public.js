/**
 * public.js
 * -----------------------------------------------------------------------
 * Lógica del frontend público de CineVerse.
 * Depende de data.js (getPeliculas / getPeliculaPorId).
 * -----------------------------------------------------------------------
 */

// Paleta de gradientes usada como "poster" temporal cuando la película
// todavía no tiene imagenUrl (así se comportará igual cuando venga null
// desde la API real).
const CV_POSTER_GRADIENTS = [
  "linear-gradient(160deg, #3a1420 0%, #17171f 75%)",
  "linear-gradient(160deg, #1f2a3a 0%, #17171f 75%)",
  "linear-gradient(160deg, #24331f 0%, #17171f 75%)",
  "linear-gradient(160deg, #3a2a14 0%, #17171f 75%)",
  "linear-gradient(160deg, #2a1f3a 0%, #17171f 75%)",
  "linear-gradient(160deg, #1f3a36 0%, #17171f 75%)"
];

function cvGradientFor(id) {
  const idx = Number(id) % CV_POSTER_GRADIENTS.length;
  return CV_POSTER_GRADIENTS[idx];
}

function cvFormatFecha(fechaISO) {
  if (!fechaISO) return "Fecha por confirmar";
  const fecha = new Date(`${fechaISO}T00:00:00`);
  return fecha.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function cvFormatDuracion(minutos) {
  if (!minutos && minutos !== 0) return "";
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/**
 * Construye el bloque visual del poster (imagen real si existe imagenUrl,
 * o un placeholder con gradiente + título mientras no haya API real).
 */
function cvPosterMarkup(pelicula, { withBadge = true } = {}) {
  const badge = withBadge
    ? `<span class="cv-badge-clasif">${pelicula.clasificacion}</span>`
    : "";

  if (pelicula.imagenUrl) {
    return `
      <div class="cv-poster" style="background-image:url('${pelicula.imagenUrl}');background-size:cover;background-position:center;">
        ${badge}
      </div>`;
  }

  return `
    <div class="cv-poster" style="background:${cvGradientFor(pelicula.id)};">
      ${badge}
      <i class="bi bi-film cv-poster-icon"></i>
      <span class="cv-poster-title">${pelicula.titulo}</span>
    </div>`;
}

/**
 * Genera el HTML de una tarjeta de película (usada en Home y Cartelera).
 */
function cvCardMarkup(pelicula) {
  return `
    <div class="col">
      <div class="cv-card">
        ${cvPosterMarkup(pelicula)}
        <div class="cv-card-body">
          <h3 class="cv-card-title">${pelicula.titulo}</h3>
          <p class="cv-card-meta mb-0">
            ${pelicula.genero} &nbsp;|&nbsp; ${cvFormatDuracion(pelicula.duracionMinutos)}
          </p>
          <a href="detalle.html?id=${pelicula.id}" class="btn-cv-outline">Ver más</a>
        </div>
      </div>
    </div>`;
}

function cvSkeletonCards(n) {
  return Array.from({ length: n })
    .map(
      () => `
      <div class="col">
        <div class="cv-skeleton" style="aspect-ratio:2/3.6;"></div>
      </div>`
    )
    .join("");
}

function cvEmptyState(mensaje) {
  return `
    <div class="col-12">
      <div class="cv-empty-state">
        <i class="bi bi-camera-reels mb-2 d-block" style="font-size:1.8rem;"></i>
        ${mensaje}
      </div>
    </div>`;
}

/* ---------------------------------------------------------------------- */
/* HOME                                                                    */
/* ---------------------------------------------------------------------- */

async function initHomePage() {
  const grid = document.getElementById("cv-home-grid");
  if (!grid) return;

  grid.innerHTML = cvSkeletonCards(6);

  try {
    const peliculas = await getPeliculas();
    const enCartelera = peliculas.filter((p) => p.estado).slice(0, 6);

    grid.innerHTML = enCartelera.length
      ? enCartelera.map(cvCardMarkup).join("")
      : cvEmptyState("No hay películas en cartelera por el momento.");
  } catch (err) {
    console.error(err);
    grid.innerHTML = cvEmptyState(
      "No se pudieron cargar las películas. Intenta nuevamente más tarde."
    );
  }
}

/* ---------------------------------------------------------------------- */
/* CARTELERA (con filtros por género y búsqueda)                          */
/* ---------------------------------------------------------------------- */

let cvCarteleraPeliculas = [];

async function initCarteleraPage() {
  const grid = document.getElementById("cv-cartelera-grid");
  const selectGenero = document.getElementById("cv-filtro-genero");
  const inputBuscar = document.getElementById("cv-filtro-buscar");
  const countLabel = document.getElementById("cv-cartelera-count");
  if (!grid) return;

  grid.innerHTML = cvSkeletonCards(8);

  try {
    const peliculas = await getPeliculas();
    cvCarteleraPeliculas = peliculas.filter((p) => p.estado);

    // Poblar el select de géneros dinámicamente a partir de los datos
    const generos = new Set();
    cvCarteleraPeliculas.forEach((p) =>
      p.genero.split(",").forEach((g) => generos.add(g.trim()))
    );
    [...generos].sort().forEach((g) => {
      const opt = document.createElement("option");
      opt.value = g;
      opt.textContent = g;
      selectGenero.appendChild(opt);
    });

    cvRenderCartelera();
  } catch (err) {
    console.error(err);
    grid.innerHTML = cvEmptyState(
      "No se pudieron cargar las películas. Intenta nuevamente más tarde."
    );
  }

  selectGenero.addEventListener("change", cvRenderCartelera);
  inputBuscar.addEventListener("input", cvRenderCartelera);

  function cvRenderCartelera() {
    const genero = selectGenero.value;
    const texto = inputBuscar.value.trim().toLowerCase();

    const filtradas = cvCarteleraPeliculas.filter((p) => {
      const coincideGenero = !genero || p.genero.includes(genero);
      const coincideTexto = p.titulo.toLowerCase().includes(texto);
      return coincideGenero && coincideTexto;
    });

    grid.innerHTML = filtradas.length
      ? filtradas.map(cvCardMarkup).join("")
      : cvEmptyState("No encontramos películas que coincidan con tu búsqueda.");

    if (countLabel) {
      countLabel.textContent = `${filtradas.length} película${filtradas.length === 1 ? "" : "s"}`;
    }
  }
}

/* ---------------------------------------------------------------------- */
/* PRÓXIMAMENTE                                                            */
/* ---------------------------------------------------------------------- */

async function initProximamentePage() {
  const grid = document.getElementById("cv-proximamente-grid");
  if (!grid) return;

  grid.innerHTML = cvSkeletonCards(6);

  try {
    const peliculas = await getPeliculas();
    const proximas = peliculas
      .filter((p) => !p.estado)
      .sort((a, b) => new Date(a.fechaEstreno) - new Date(b.fechaEstreno));

    grid.innerHTML = proximas.length
      ? proximas.map(cvCardMarkup).join("")
      : cvEmptyState("Por ahora no hay estrenos próximos anunciados.");
  } catch (err) {
    console.error(err);
    grid.innerHTML = cvEmptyState(
      "No se pudieron cargar los estrenos. Intenta nuevamente más tarde."
    );
  }
}

/* ---------------------------------------------------------------------- */
/* DETALLE                                                                 */
/* ---------------------------------------------------------------------- */

async function initDetallePage() {
  const container = document.getElementById("cv-detalle-container");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    container.innerHTML = cvDetalleNotFound();
    return;
  }

  try {
    const pelicula = await getPeliculaPorId(id);

    if (!pelicula) {
      container.innerHTML = cvDetalleNotFound();
      return;
    }

    document.title = `${pelicula.titulo} · CineVerse`;

    const poster = pelicula.imagenUrl
      ? `<div class="cv-detail-poster" style="background-image:url('${pelicula.imagenUrl}');background-size:cover;background-position:center;">
           <span>${pelicula.titulo}</span>
         </div>`
      : `<div class="cv-detail-poster" style="background:${cvGradientFor(pelicula.id)};">
           <i class="bi bi-film"></i>
           <span>${pelicula.titulo}</span>
         </div>`;

    container.innerHTML = `
      <div class="row g-4 g-lg-5 align-items-start">
        <div class="col-12 col-md-4 col-lg-3">
          ${poster}
        </div>
        <div class="col-12 col-md-8 col-lg-9">
          <span class="eyebrow">${pelicula.estado ? "EN CARTELERA" : "PRÓXIMAMENTE"}</span>
          <h1 class="fw-bold mt-2 mb-3" style="font-size:clamp(1.8rem, 3vw, 2.6rem);">
            ${pelicula.titulo}
          </h1>

          <div class="d-flex flex-wrap gap-2 mb-4">
            <span class="cv-chip"><i class="bi bi-tags"></i>${pelicula.genero}</span>
            <span class="cv-chip"><i class="bi bi-clock"></i>${cvFormatDuracion(pelicula.duracionMinutos)}</span>
            <span class="cv-chip"><i class="bi bi-shield-check"></i>${pelicula.clasificacion}</span>
            <span class="cv-chip"><i class="bi bi-calendar-event"></i>${cvFormatFecha(pelicula.fechaEstreno)}</span>
          </div>

          <h2 class="h5 fw-bold mb-2">Sinopsis</h2>
          <p class="cv-synopsis mb-4">${pelicula.sinopsis || "Sinopsis no disponible por el momento."}</p>

          <div class="d-flex flex-wrap gap-2">
            <button type="button" class="btn-cv-primary" disabled title="Disponible próximamente">
              <i class="bi bi-ticket-perforated"></i> Comprar entradas
            </button>
            <a href="cartelera.html" class="btn-cv-outline">Volver a la cartelera</a>
          </div>
        </div>
      </div>`;
  } catch (err) {
    console.error(err);
    container.innerHTML = cvDetalleNotFound(
      "Ocurrió un error al cargar la película. Intenta nuevamente."
    );
  }
}

function cvDetalleNotFound(
  mensaje = "No encontramos la película que buscas."
) {
  return `
    <div class="cv-empty-state py-5">
      <i class="bi bi-emoji-frown mb-3 d-block" style="font-size:2.2rem;"></i>
      <p class="mb-3">${mensaje}</p>
      <a href="cartelera.html" class="btn-cv-primary">Ver cartelera</a>
    </div>`;
}

/* ---------------------------------------------------------------------- */
/* Bootstrap de cada página                                                */
/* ---------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  initHomePage();
  initCarteleraPage();
  initProximamentePage();
  initDetallePage();
});
