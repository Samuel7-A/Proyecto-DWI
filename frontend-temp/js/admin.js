const peliculasIniciales = [
    {
        id: 1,
        titulo: "Avengers: Endgame",
        sinopsis: "Los Vengadores se enfrentan a una última batalla para intentar restaurar el equilibrio del universo.",
        genero: "Acción",
        duracionMinutos: 181,
        clasificacion: "+12",
        fechaEstreno: "2019-04-26",
        imagenUrl: "",
        estado: true
    },
    {
        id: 2,
        titulo: "El Conjuro",
        sinopsis: "Una familia se muda a una antigua casa donde comienzan a ocurrir fenómenos paranormales.",
        genero: "Terror",
        duracionMinutos: 112,
        clasificacion: "+14",
        fechaEstreno: "2013-09-13",
        imagenUrl: "",
        estado: true
    },
    {
        id: 3,
        titulo: "Toy Story",
        sinopsis: "Un grupo de juguetes cobra vida cuando los humanos no están presentes.",
        genero: "Fantasía",
        duracionMinutos: 81,
        clasificacion: "APT",
        fechaEstreno: "1995-11-22",
        imagenUrl: "",
        estado: true
    }
];

let peliculas = JSON.parse(localStorage.getItem("cineverse_peliculas"));

if (!peliculas) {
    peliculas = peliculasIniciales;
    guardarPeliculas();
}

let peliculaEditando = null;

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

function guardarPeliculas() {
    localStorage.setItem("cineverse_peliculas", JSON.stringify(peliculas));
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
                <div class="movie-title">${pelicula.titulo}</div>
                <div class="movie-synopsis">${pelicula.sinopsis || "Sin sinopsis"}</div>
            </td>
            <td>${pelicula.genero}</td>
            <td>${pelicula.duracionMinutos} min</td>
            <td>${pelicula.clasificacion}</td>
            <td>${formatearFecha(pelicula.fechaEstreno)}</td>
            <td>
                <span class="${pelicula.estado ? "badge-active" : "badge-inactive"}">
                    ${pelicula.estado ? "Activa" : "Inactiva"}
                </span>
            </td>
            <td class="text-center">
                <button
                    type="button"
                    class="btn-action btn-edit"
                    onclick="editarPelicula(${pelicula.id})"
                    title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>

                <button
                    type="button"
                    class="btn-action btn-delete"
                    onclick="eliminarPelicula(${pelicula.id})"
                    title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

        tablaPeliculas.appendChild(fila);
    });
}

function formatearFecha(fecha) {
    if (!fecha) {
        return "-";
    }

    const partes = fecha.split("-");

    if (partes.length !== 3) {
        return fecha;
    }

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

    if (!formulario.checkValidity()) {
        return false;
    }

    if (inputDuracion.value <= 0) {
        inputDuracion.setCustomValidity("Duración inválida");
        return false;
    }

    inputDuracion.setCustomValidity("");

    return true;
}

formulario.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!validarFormulario()) {
        return;
    }

    const datos = obtenerDatosFormulario();

    if (peliculaEditando === null) {
        const nuevoId = peliculas.length > 0
            ? Math.max(...peliculas.map((pelicula) => pelicula.id)) + 1
            : 1;

        peliculas.push({
            id: nuevoId,
            ...datos
        });

        mostrarMensaje("Película registrada correctamente.", "success");
    } else {
        const indice = peliculas.findIndex(
            (pelicula) => pelicula.id === peliculaEditando
        );

        if (indice !== -1) {
            peliculas[indice] = {
                id: peliculaEditando,
                ...datos
            };

            mostrarMensaje("Película actualizada correctamente.", "success");
        }
    }

    guardarPeliculas();
    mostrarPeliculas();
    limpiarFormulario();
});

function editarPelicula(id) {
    const pelicula = peliculas.find((pelicula) => pelicula.id === id);

    if (!pelicula) {
        return;
    }

    peliculaEditando = id;

    inputId.value = pelicula.id;
    inputTitulo.value = pelicula.titulo;
    inputSinopsis.value = pelicula.sinopsis || "";
    inputGenero.value = pelicula.genero;
    inputDuracion.value = pelicula.duracionMinutos;
    inputClasificacion.value = pelicula.clasificacion;
    inputFecha.value = pelicula.fechaEstreno;
    inputImagen.value = pelicula.imagenUrl || "";
    inputEstado.checked = pelicula.estado;

    tituloFormulario.textContent = "Editar película";

    botonGuardar.innerHTML = `
        <i class="bi bi-check-circle"></i>
        Guardar cambios
    `;

    botonCancelar.classList.remove("d-none");

    formulario.classList.remove("was-validated");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function eliminarPelicula(id) {
    const pelicula = peliculas.find((pelicula) => pelicula.id === id);

    if (!pelicula) {
        return;
    }

    const confirmar = confirm(
        `¿Estás seguro de eliminar la película "${pelicula.titulo}"?`
    );

    if (!confirmar) {
        return;
    }

    peliculas = peliculas.filter((pelicula) => pelicula.id !== id);

    guardarPeliculas();
    mostrarPeliculas();

    if (peliculaEditando === id) {
        limpiarFormulario();
    }

    mostrarMensaje("Película eliminada correctamente.", "success");
}

function limpiarFormulario() {
    formulario.reset();

    inputId.value = "";
    inputEstado.checked = true;

    peliculaEditando = null;

    tituloFormulario.textContent = "Registrar película";

    botonGuardar.innerHTML = `
        <i class="bi bi-plus-circle"></i>
        Registrar película
    `;

    botonCancelar.classList.add("d-none");

    formulario.classList.remove("was-validated");
}

botonCancelar.addEventListener("click", function () {
    limpiarFormulario();
});

function mostrarMensaje(texto, tipo) {
    mensaje.className = `alert alert-${tipo}`;
    mensaje.textContent = texto;

    setTimeout(() => {
        mensaje.classList.add("d-none");
    }, 3000);
}

inputDuracion.addEventListener("input", function () {
    if (this.value <= 0) {
        this.setCustomValidity("La duración debe ser mayor a 0.");
    } else {
        this.setCustomValidity("");
    }
});

mostrarPeliculas();
