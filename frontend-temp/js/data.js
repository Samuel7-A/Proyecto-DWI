/**
 * data.js
 * -----------------------------------------------------------------------
 * Capa de datos de CineVerse.
 *
 * Estos son datos TEMPORALES (mock) que respetan exactamente la forma
 * del objeto que ya devuelve el backend (entity Pelicula):
 *   { id, titulo, sinopsis, genero, duracionMinutos, clasificacion,
 *     fechaEstreno, imagenUrl, estado }
 *
 * Cuando el backend esté disponible, SOLO hay que cambiar la función
 * getPeliculas()/getPeliculaPorId() de abajo por la llamada fetch()
 * que ya está dejada comentada. El resto del front (public.js) no
 * necesita tocarse porque siempre consume estas dos funciones.
 * -----------------------------------------------------------------------
 */

const API_BASE_URL = "http://localhost:8080/api/peliculas";

async function getPeliculas() {
  const res = await fetch(API_BASE_URL);
  if (!res.ok) throw new Error("No se pudieron obtener las películas");
  return await res.json();
}

async function getPeliculaPorId(id) {
  const res = await fetch(`${API_BASE_URL}/${id}`);
  if (!res.ok) return null;
  return await res.json();
}
