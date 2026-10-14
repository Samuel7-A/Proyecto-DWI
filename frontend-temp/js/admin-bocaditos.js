const API_URL = "http://localhost:8080/api/productos";

// Acceso restringido al rol ADMIN: redirige a login (sin sesión) o a index
// (usuario sin permiso) antes de tocar la API.
const CV_AUTORIZADO = cvAuthRequiereAdmin();

let productos = [];
let editandoId = null;

const formulario = document.getElementById("producto-form");
const tabla = document.getElementById("productos-table-body");
const mensaje = document.getElementById("mensaje");
const sinProductos = document.getElementById("sin-productos");
const tituloFormulario = document.getElementById("form-title");
const botonGuardar = document.getElementById("btn-guardar");
const botonCancelar = document.getElementById("btn-cancelar");

const inputId = document.getElementById("producto-id");
const inputNombre = document.getElementById("producto-nombre");
const inputCategoria = document.getElementById("producto-categoria");
const inputPrecio = document.getElementById("producto-precio");
const inputActivo = document.getElementById("producto-activo");

const CATEGORIAS = {
    CANCHITA: { label: "Canchita", icon: "bi-basket2" },
    BEBIDA: { label: "Bebida", icon: "bi-cup-straw" },
    DULCE: { label: "Dulce", icon: "bi-cake2" },
    COMBO: { label: "Combo", icon: "bi-gift" }
};

function categoriaInfo(categoria) {
    return CATEGORIAS[categoria] || { label: categoria || "—", icon: "bi-bag" };
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + cvAuthToken()
    };
}

async function cargarProductos() {
    try {
        const respuesta = await fetch(API_URL + "/admin", {
            headers: { "Authorization": "Bearer " + cvAuthToken() }
        });

        if (!respuesta.ok) {
            throw new Error("No se pudieron obtener los productos.");
        }

        productos = await respuesta.json();
        mostrarProductos();
    } catch (error) {
        mostrarMensaje("No se pudo conectar con el backend.", "danger");
        console.error(error);
    }
}

function precioLabel(precio) {
    const n = Number(precio);
    return isNaN(n) ? "—" : "S/ " + n.toFixed(2);
}

function mostrarProductos() {
    tabla.innerHTML = "";

    if (productos.length === 0) {
        sinProductos.classList.remove("d-none");
        return;
    }

    sinProductos.classList.add("d-none");

    productos.forEach((producto) => {
        const info = categoriaInfo(producto.categoria);
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${producto.id}</td>
            <td>
                <div class="movie-title">${producto.nombre}</div>
            </td>
            <td><i class="bi ${info.icon} me-2"></i>${info.label}</td>
            <td>${precioLabel(producto.precio)}</td>
            <td>
                <span class="${producto.activo ? "badge-active" : "badge-inactive"}">
                    ${producto.activo ? "Activo" : "Inactivo"}
                </span>
            </td>
            <td class="text-center">
                <button
                    type="button"
                    class="btn-action btn-edit"
                    onclick="editarProducto(${producto.id})"
                    title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>

                <button
                    type="button"
                    class="btn-action btn-delete"
                    onclick="eliminarProducto(${producto.id})"
                    title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

        tabla.appendChild(fila);
    });
}

function obtenerDatos() {
    return {
        nombre: inputNombre.value.trim(),
        categoria: inputCategoria.value,
        precio: Number(inputPrecio.value),
        activo: inputActivo.checked
    };
}

function validarFormulario() {
    formulario.classList.add("was-validated");

    if (!formulario.checkValidity()) {
        return false;
    }

    const valorPrecio = inputPrecio.value.trim();
    const precio = Number(valorPrecio);

    if (isNaN(precio) || precio <= 0) {
        inputPrecio.setCustomValidity("El precio debe ser mayor que 0.");
        return false;
    }

    if (!/^\d{1,8}(\.\d{1,2})?$/.test(valorPrecio)) {
        inputPrecio.setCustomValidity("El precio admite como máximo 2 decimales.");
        return false;
    }

    inputPrecio.setCustomValidity("");
    return true;
}

formulario.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!validarFormulario()) {
        return;
    }

    const datos = obtenerDatos();
    const esEdicion = editandoId !== null;

    botonGuardar.disabled = true;

    try {
        let respuesta;

        if (esEdicion) {
            respuesta = await fetch(`${API_URL}/${editandoId}`, {
                method: "PUT",
                headers: authHeaders(),
                body: JSON.stringify(datos)
            });
        } else {
            respuesta = await fetch(API_URL, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify(datos)
            });
        }

        if (!respuesta.ok) {
            const cuerpo = await respuesta.json().catch(() => null);
            const msg = cuerpo && (cuerpo.mensaje || cuerpo.error || cuerpo.message);
            throw new Error(msg || "Error al guardar el producto.");
        }

        mostrarMensaje(
            esEdicion ? "Producto actualizado correctamente." : "Producto creado correctamente.",
            "success"
        );

        limpiarFormulario();
        await cargarProductos();
    } catch (error) {
        mostrarMensaje(error.message || "No se pudo guardar el producto.", "danger");
        console.error(error);
    } finally {
        botonGuardar.disabled = false;
    }
});

function editarProducto(id) {
    const producto = productos.find((p) => p.id === id);

    if (!producto) {
        return;
    }

    editandoId = id;

    inputId.value = producto.id;
    inputNombre.value = producto.nombre;
    inputCategoria.value = producto.categoria;
    inputPrecio.value = Number(producto.precio);
    inputActivo.checked = producto.activo;

    tituloFormulario.textContent = "Editar producto";

    botonGuardar.innerHTML = `
        <i class="bi bi-check-circle"></i>
        Guardar cambios
    `;

    botonCancelar.classList.remove("d-none");
    formulario.classList.remove("was-validated");

    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function eliminarProducto(id) {
    const producto = productos.find((p) => p.id === id);

    if (!producto) {
        return;
    }

    const confirmar = confirm(
        `¿Estás seguro de eliminar el producto "${producto.nombre}"?`
    );

    if (!confirmar) {
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + cvAuthToken() }
        });

        if (!respuesta.ok) {
            const cuerpo = await respuesta.json().catch(() => null);
            const msg = cuerpo && (cuerpo.mensaje || cuerpo.error || cuerpo.message);
            throw new Error(msg || "No se pudo eliminar el producto.");
        }

        mostrarMensaje("Producto eliminado correctamente.", "success");

        if (editandoId === id) {
            limpiarFormulario();
        }

        await cargarProductos();
    } catch (error) {
        mostrarMensaje(error.message || "No se pudo eliminar el producto.", "danger");
        console.error(error);
    }
}

function limpiarFormulario() {
    formulario.reset();

    inputId.value = "";
    inputActivo.checked = true;

    editandoId = null;

    tituloFormulario.textContent = "Nuevo producto";

    botonGuardar.innerHTML = `
        <i class="bi bi-plus-circle"></i>
        Nuevo producto
    `;

    botonCancelar.classList.add("d-none");
    formulario.classList.remove("was-validated");
}

botonCancelar.addEventListener("click", limpiarFormulario);

inputPrecio.addEventListener("input", function () {
    this.setCustomValidity("");
});

function mostrarMensaje(texto, tipo) {
    mensaje.className = `alert alert-${tipo}`;
    mensaje.textContent = texto;

    setTimeout(() => {
        mensaje.classList.add("d-none");
    }, 3000);
}

if (CV_AUTORIZADO) {
    cargarProductos();
}
