
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
