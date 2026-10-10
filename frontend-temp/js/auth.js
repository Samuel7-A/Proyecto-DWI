
const API_BASE_URL = "http://localhost:8080";

const loginForm = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");
const btnLogin = document.getElementById("btnLogin");

function mostrarMensaje(texto, tipo = "danger") {
    mensaje.textContent = texto;
    mensaje.className = `alert alert-${tipo}`;
}

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value;

    btnLogin.disabled = true;
    btnLogin.textContent = "Verificando...";
    mensaje.classList.add("d-none");

    try {
        const respuesta = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ correo, password })
        });

        const datos = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {
            throw new Error(datos.message || datos.mensaje ||
                "No se pudo iniciar sesión. Revisa tus credenciales.");
        }

        if (!datos.token || !datos.rol) {
            throw new Error("La respuesta del servidor no contiene el token o el rol.");
        }

        // El rol se normaliza para comparar ADMIN y CLIENTE.
        const rol = String(datos.rol).replace(/^ROLE_/, "").toUpperCase();

        sessionStorage.setItem("cineverse_token", datos.token);
        sessionStorage.setItem("cineverse_rol", rol);
        sessionStorage.setItem("cineverse_usuario", datos.nombre || datos.correo || "");

        mostrarMensaje("Inicio de sesión correcto.", "success");

        if (rol === "ADMIN") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "index.html";
        }

    } catch (error) {
        mostrarMensaje(error.message || "No se pudo conectar con el servidor.");
    } finally {
        btnLogin.disabled = false;
        btnLogin.textContent = "Iniciar sesión";
    }
});
