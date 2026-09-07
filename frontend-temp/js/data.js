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

const MOCK_PELICULAS = [
  {
    id: 1,
    titulo: "Superman",
    sinopsis:
      "Un joven periodista de Metrópolis debe equilibrar su vida cotidiana con la responsabilidad de ser el héroe que el mundo necesita, enfrentando una amenaza que pondrá a prueba su verdadera identidad.",
    genero: "Acción, Aventura",
    duracionMinutos: 129,
    clasificacion: "+12",
    fechaEstreno: "2026-07-10",
    imagenUrl: "",
    estado: true
  },
  {
    id: 2,
    titulo: "It: Bienvenidos de nuevo",
    sinopsis:
      "Décadas después de su primer encuentro, el Club de los Perdedores regresa a Derry para enfrentar de nuevo al ser que acecha en las alcantarillas de la ciudad.",
    genero: "Terror, Misterio",
    duracionMinutos: 135,
    clasificacion: "+18",
    fechaEstreno: "2026-08-01",
    imagenUrl: "",
    estado: true
  },
  {
    id: 3,
    titulo: "Cómo entrenar a tu dragón",
    sinopsis:
      "En la isla vikinga de Berk, un joven forma un vínculo inesperado con un dragón herido y descubre que todo lo que creía saber sobre estas criaturas estaba equivocado.",
    genero: "Aventura, Familiar",
    duracionMinutos: 125,
    clasificacion: "APT",
    fechaEstreno: "2026-06-15",
    imagenUrl: "",
    estado: true
  },
  {
    id: 4,
    titulo: "F1: La película",
    sinopsis:
      "Un ex piloto de Fórmula 1 vuelve a las pistas para mentorear a un joven talento, mientras persigue una última oportunidad de gloria dentro y fuera del auto.",
    genero: "Drama, Acción",
    duracionMinutos: 156,
    clasificacion: "+12",
    fechaEstreno: "2026-05-20",
    imagenUrl: "",
    estado: true
  },
  {
    id: 5,
    titulo: "Thunderbolts*",
    sinopsis:
      "Un grupo de antihéroes con pasados complicados es reunido para una misión de alto riesgo, obligándolos a decidir si pueden confiar los unos en los otros.",
    genero: "Acción, Ciencia ficción",
    duracionMinutos: 127,
    clasificacion: "+12",
    fechaEstreno: "2026-04-25",
    imagenUrl: "",
    estado: true
  },
  {
    id: 6,
    titulo: "Minecraft: La película",
    sinopsis:
      "Cuatro desadaptados son transportados a un extraño mundo cúbico donde la creatividad no es solo un poder, sino la clave para encontrar el camino de regreso a casa.",
    genero: "Familiar, Aventura",
    duracionMinutos: 101,
    clasificacion: "APT",
    fechaEstreno: "2026-04-01",
    imagenUrl: "",
    estado: true
  },
  {
    id: 7,
    titulo: "El Último Faro",
    sinopsis:
      "En un pueblo costero azotado por tormentas, el guardián de un faro abandonado descubre un secreto que ha mantenido a salvo a la comunidad durante generaciones.",
    genero: "Drama, Misterio",
    duracionMinutos: 118,
    clasificacion: "+14",
    fechaEstreno: "2026-11-05",
    imagenUrl: "",
    estado: false
  },
  {
    id: 8,
    titulo: "Ecos del Mañana",
    sinopsis:
      "Una científica descubre una forma de recibir señales desde el futuro, pero cada mensaje que decodifica cambia el presente de maneras que no puede controlar.",
    genero: "Ciencia ficción, Suspenso",
    duracionMinutos: 132,
    clasificacion: "+14",
    fechaEstreno: "2026-10-22",
    imagenUrl: "",
    estado: false
  },
  {
    id: 9,
    titulo: "Ciudad de Cristal",
    sinopsis:
      "En una metrópoli construida enteramente de vidrio, una detective debe resolver un crimen imposible antes de que toda la ciudad se resquebraje.",
    genero: "Animación, Fantasía",
    duracionMinutos: 108,
    clasificacion: "APT",
    fechaEstreno: "2026-12-18",
    imagenUrl: "",
    estado: false
  }
];

/**
 * Devuelve todas las películas.
 * TODO: cuando el backend esté listo, reemplazar por:
 *
 * async function getPeliculas() {
 *   const res = await fetch(API_BASE_URL);
 *   if (!res.ok) throw new Error("No se pudieron obtener las películas");
 *   return await res.json();
 * }
 */
async function getPeliculas() {
  return Promise.resolve(MOCK_PELICULAS);
}

/**
 * Devuelve una película por su id, o null si no existe.
 * TODO: cuando el backend esté listo, reemplazar por:
 *
 * async function getPeliculaPorId(id) {
 *   const res = await fetch(`${API_BASE_URL}/${id}`);
 *   if (!res.ok) return null;
 *   return await res.json();
 * }
 */
async function getPeliculaPorId(id) {
  const peliculas = await getPeliculas();
  const encontrada = peliculas.find((p) => String(p.id) === String(id));
  return encontrada || null;
}
