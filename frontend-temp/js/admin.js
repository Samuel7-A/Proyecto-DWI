
const API_URL = "http://localhost:8080/api/peliculas";

let peliculas = [];
let peliculaEditando = null;

const token = sessionStorage.getItem("cineverse_token");
const rol = sessionStorage.getItem("cineverse_rol");

const formulario = document.getElementById("pelicula-form");
const tablaPeliculas = document.getElementById("peliculas-table-body");
const mensaje = document.getElementById("mensaje");
const sinPeliculas = document.getElementById("sin-peliculas");
const tituloFormulario = document.getElementById("form-title");
const botonGuardar = document.getElementById("btn-guardar");
const botonCancelar = document.getElementById("btn-cancelar");

const inputId = document.getElementById("pelicula-id");
const inputTitulo = document.getElementById("titulo");
const inputSinopsis = document.getElementById("sinopsis");
const inputGenero = document.getElementById("genero");
const inputDuracion = document.getElementById("duracionMinutos");
const inputClasificacion = document.getElementById("clasificacion");
const inputFecha = document.getElementById("fechaEstreno");
const inputImagen = document.getElementById("imagenUrl");
const inputEstado = document.getElementById("estado");

// Comprobar la sesión antes de permitir usar el panel.
if (!token || rol !== "ADMIN") {
    window.location.replace("login.html");
    throw new Error("Acceso restringido: se requiere el rol ADMIN.");
}

// Añadir el JWT a las peticiones administrativas.
async function peticionAdmin(url, opciones = {}) {
    const headers = new Headers(opciones.headers || {});
    headers.set("Authorization", `Bearer ${token}`);

    const respuesta = await fetch(url, {
        ...opciones,
        headers
    });

    if (respuesta.status === 401) {
        cerrarSesion();
        throw new Error("Tu sesión ha expirado. Inicia sesión nuevamente.");
    }

    if (respuesta.status === 403) {
        throw new Error("No tienes permisos para realizar esta operación.");
    }

    return respuesta;
}

function cerrarSesion() {
    sessionStorage.removeItem("cineverse_token");
    sessionStorage.removeItem("cineverse_rol");
    sessionStorage.removeItem("cineverse_usuario");
    window.location.replace("login.html");
}

async function cargarPeliculas() {
    try {
        // La consulta de películas es pública.
        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error("No se pudieron obtener las películas.");
        }

        peliculas = await respuesta.json();
        mostrarPeliculas();
    } catch (error) {
        mostrarMensaje(error.message || "No se pudo conectar con el backend.", "danger");
        console.error(error);
    }
}

function mostrarPeliculas() {
    tablaPeliculas.innerHTML = "";

    if (peliculas.length === 0) {
        sinPeliculas.classList.remove("d-none");
        return;
    }

    sinPeliculas.classList.add("d-none");

    peliculas.forEach((pelicula) => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${pelicula.id}</td>
            <td>
                <div class="movie-title"></div>
                <div class="movie-synopsis"></div>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>
                <span class="${pelicula.estado ? "badge-active" : "badge-inactive"}">
                    ${pelicula.estado ? "Activa" : "Inactiva"}
                </span>
            </td>
            <td class="text-center">
                <button type="button" class="btn-action btn-edit"
                    data-editar="${pelicula.id}" title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button type="button" class="btn-action btn-delete"
                    data-eliminar="${pelicula.id}" title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

        // Insertar texto como texto, evitando interpretar datos como HTML.
        const celdas = fila.querySelectorAll("td");
        fila.querySelector(".movie-title").textContent = pelicula.titulo || "";
        fila.querySelector(".movie-synopsis").textContent =
            pelicula.sinopsis || "Sin sinopsis";
        celdas[2].textContent = pelicula.genero || "";
        celdas[3].textContent = `${pelicula.duracionMinutos} min`;
        celdas[4].textContent = pelicula.clasificacion || "";
        celdas[5].textContent = formatearFecha(pelicula.fechaEstreno);

        tablaPeliculas.appendChild(fila);
    });
}

tablaPeliculas.addEventListener("click", (event) => {
    const botonEditar = event.target.closest("[data-editar]");
    const botonEliminar = event.target.closest("[data-eliminar]");

    if (botonEditar) {
        editarPelicula(Number(botonEditar.dataset.editar));
    }

    if (botonEliminar) {
        eliminarPelicula(Number(botonEliminar.dataset.eliminar));
    }
});

function formatearFecha(fecha) {
    if (!fecha) return "-";

    const partes = fecha.split("-");
    if (partes.length !== 3) return fecha;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obtenerDatosFormulario() {
    return {
        titulo: inputTitulo.value.trim(),
        sinopsis: inputSinopsis.value.trim(),
        genero: inputGenero.value,
        duracionMinutos: Number(inputDuracion.value),
        clasificacion: inputClasificacion.value,
        fechaEstreno: inputFecha.value,
        imagenUrl: inputImagen.value.trim(),
        estado: inputEstado.checked
    };
}

function validarFormulario() {
    formulario.classList.add("was-validated");

    if (!formulario.checkValidity()) return false;

    if (Number(inputDuracion.value) <= 0) {
        inputDuracion.setCustomValidity("La duración debe ser mayor a 0.");
        return false;
    }

    inputDuracion.setCustomValidity("");
    return true;
}

formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validarFormulario()) return;

    const datos = obtenerDatosFormulario();
    const editando = peliculaEditando !== null;

    try {
        const respuesta = await peticionAdmin(
            editando ? `${API_URL}/${peliculaEditando}` : API_URL,
            {
                method: editando ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            }
        );

        if (!respuesta.ok) {
            const texto = await respuesta.text();
            throw new Error(texto || "Error al guardar la película.");
        }

        mostrarMensaje(
            editando ? "Película actualizada correctamente." :
                "Película registrada correctamente.",
            "success"
        );

        limpiarFormulario();
        await cargarPeliculas();
    } catch (error) {
        mostrarMensaje(error.message || "No se pudo guardar la película.", "danger");
        console.error(error);
    }
});

function editarPelicula(id) {
    const pelicula = peliculas.find((p) => p.id === id);
    if (!pelicula) return;

    peliculaEditando = id;

    inputId.value = pelicula.id;
    inputTitulo.value = pelicula.titulo || "";
    inputSinopsis.value = pelicula.sinopsis || "";
    inputGenero.value = pelicula.genero || "";
    inputDuracion.value = pelicula.duracionMinutos;
    inputClasificacion.value = pelicula.clasificacion || "";
    inputFecha.value = pelicula.fechaEstreno || "";
    inputImagen.value = pelicula.imagenUrl || "";
    inputEstado.checked = pelicula.estado;

    tituloFormulario.textContent = "Editar película";
    botonGuardar.innerHTML = '<i class="bi bi-check-circle"></i> Guardar cambios';
    botonCancelar.classList.remove("d-none");
    formulario.classList.remove("was-validated");

    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function eliminarPelicula(id) {
    const pelicula = peliculas.find((p) => p.id === id);
    if (!pelicula) return;

    if (!confirm(`¿Eliminar la película "${pelicula.titulo}"?`)) return;

    try {
        const respuesta = await peticionAdmin(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!respuesta.ok) {
            const texto = await respuesta.text();
            throw new Error(texto || "Error al eliminar la película.");
        }

        mostrarMensaje("Película eliminada correctamente.", "success");

        if (peliculaEditando === id) limpiarFormulario();

        await cargarPeliculas();
    } catch (error) {
        mostrarMensaje(error.message || "No se pudo eliminar la película.", "danger");
        console.error(error);
    }
}

function limpiarFormulario() {
    formulario.reset();
    inputId.value = "";
    inputEstado.checked = true;
    peliculaEditando = null;
    tituloFormulario.textContent = "Registrar película";
    botonGuardar.innerHTML = '<i class="bi bi-plus-circle"></i> Registrar película';
    botonCancelar.classList.add("d-none");
    formulario.classList.remove("was-validated");
}

botonCancelar.addEventListener("click", limpiarFormulario);

function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = `alert alert-${tipo}`;

    setTimeout(() => mensaje.classList.add("d-none"), 3000);
}

inputDuracion.addEventListener("input", function () {
    this.setCustomValidity(
        Number(this.value) <= 0 ? "La duración debe ser mayor a 0." : ""
    );
});

cargarPeliculas();
