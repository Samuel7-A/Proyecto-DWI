/**
 * auth.js
 * -----------------------------------------------------------------------
 * Sesión y menú de cuenta compartidos por toda la interfaz de CineVerse.
 *
 * Lee la sesión que guarda login.html (cv_token / cv_nombre / cv_email /
 * cv_rol) y dibuja el menú de cuenta dentro de un contenedor con id
 * "cv-cuenta". También expone helpers para proteger páginas según el rol.
 *
 * No depende de data.js, public.js ni compra.js.
 * -----------------------------------------------------------------------
 */
(function () {
  "use strict";

  const CLAVES = {
    token: "cv_token",
    nombre: "cv_nombre",
    email: "cv_email",
    rol: "cv_rol"
  };

  function escapeHtml(valor) {
    return String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /** Devuelve la sesión activa o null si no hay token. */
  window.cvAuthLeer = function () {
    const token = localStorage.getItem(CLAVES.token);
    if (!token) return null;
    return {
      token: token,
      nombre: localStorage.getItem(CLAVES.nombre) || "",
      email: localStorage.getItem(CLAVES.email) || "",
      rol: localStorage.getItem(CLAVES.rol) || ""
    };
  };

  window.cvAuthEsAdmin = function () {
    const sesion = window.cvAuthLeer();
    return !!(sesion && sesion.rol === "ADMIN");
  };

  window.cvAuthToken = function () {
    const sesion = window.cvAuthLeer();
    return sesion ? sesion.token : "";
  };

  /** Cierra la sesión y vuelve a la página pública principal. */
  window.cvAuthCerrarSesion = function () {
    Object.keys(CLAVES).forEach(function (k) {
      localStorage.removeItem(CLAVES[k]);
    });
    window.location.href = "index.html";
  };

  /** Dibuja el menú de cuenta dentro de #cv-cuenta (si existe). */
  window.cvAuthRenderCuenta = function () {
    const cont = document.getElementById("cv-cuenta");
    if (!cont) return;

    const sesion = window.cvAuthLeer();

    if (!sesion) {
      cont.innerHTML =
        '<a href="login.html" class="cv-cuenta-login">' +
        '<i class="bi bi-person-circle"></i> Iniciar sesión</a>';
      return;
    }

    const inicial = (sesion.nombre || sesion.email || "?")
      .trim()
      .charAt(0)
      .toUpperCase();
    const nombreMostrado = sesion.nombre || sesion.email;

    const enlaceAdmin = window.cvAuthEsAdmin()
      ? '<li><a class="dropdown-item" href="admin.html">' +
        '<i class="bi bi-shield-lock me-2"></i>Panel de administración</a></li>'
      : "";

    // «Mis entradas» es una consulta personal de compra del cliente;
    // no debe mostrarse en el menú del administrador.
    const enlaceMisEntradas = window.cvAuthEsAdmin()
      ? ""
      : '<li><a class="dropdown-item" href="mis-entradas.html">' +
        '<i class="bi bi-ticket-perforated me-2"></i>Mis entradas</a></li>';

    cont.innerHTML =
      '<div class="dropdown cv-cuenta">' +
      '<button class="cv-cuenta-toggle dropdown-toggle" type="button" ' +
      'data-bs-toggle="dropdown" aria-expanded="false">' +
      '<span class="cv-cuenta-avatar">' + escapeHtml(inicial) + "</span>" +
      '<span class="cv-cuenta-nombre">' + escapeHtml(nombreMostrado) + "</span>" +
      "</button>" +
      '<ul class="dropdown-menu dropdown-menu-end cv-cuenta-menu">' +
      '<li class="cv-cuenta-email">' + escapeHtml(sesion.email) + "</li>" +
      '<li><hr class="dropdown-divider"></li>' +
      '<li><a class="dropdown-item" href="perfil.html">' +
      '<i class="bi bi-person me-2"></i>Mi perfil</a></li>' +
      enlaceMisEntradas +
      enlaceAdmin +
      '<li><hr class="dropdown-divider"></li>' +
      '<li><button type="button" class="dropdown-item cv-cuenta-logout" ' +
      'data-auth="logout"><i class="bi bi-box-arrow-right me-2"></i>Cerrar sesión</button></li>' +
      "</ul>" +
      "</div>";
  };

  /** Oculta los elementos con clase .cv-solo-admin si el usuario no es admin. */
  window.cvAuthSoloAdmin = function () {
    const esAdmin = window.cvAuthEsAdmin();
    document.querySelectorAll(".cv-solo-admin").forEach(function (el) {
      el.hidden = !esAdmin;
    });
  };

  /** Requiere sesión; si no la hay redirige a login conservando la URL. */
  window.cvAuthRequiereSesion = function () {
    if (window.cvAuthLeer()) return true;
    window.location.replace(
      "login.html?redirect=" + encodeURIComponent(window.location.href)
    );
    return false;
  };

  /** Requiere rol ADMIN; redirige a login (sin sesión) o a index (sin permiso). */
  window.cvAuthRequiereAdmin = function () {
    if (!window.cvAuthLeer()) {
      window.location.replace(
        "login.html?redirect=" + encodeURIComponent(window.location.href)
      );
      return false;
    }
    if (!window.cvAuthEsAdmin()) {
      window.location.replace("index.html");
      return false;
    }
    return true;
  };

  /** Muestra el modal que bloquea la compra a los administradores. */
  window.cvAuthMostrarModalCompra = function () {
    let modal = document.getElementById("cv-modal-admin-compra");

    if (!modal) {
      modal = document.createElement("div");
      modal.id = "cv-modal-admin-compra";
      modal.className = "modal fade";
      modal.setAttribute("tabindex", "-1");
      modal.setAttribute("aria-hidden", "true");
      modal.setAttribute("aria-labelledby", "cv-modal-admin-compra-titulo");
      modal.innerHTML =
        '<div class="modal-dialog modal-dialog-centered">' +
          '<div class="modal-content">' +
            '<div class="cv-modal-body">' +
              '<div class="cv-modal-icon"><i class="bi bi-shield-lock"></i></div>' +
              '<h5 class="cv-modal-title" id="cv-modal-admin-compra-titulo">' +
                "Función exclusiva para clientes</h5>" +
              '<p class="cv-modal-text">' +
                "Has iniciado sesión como administrador. La compra de entradas " +
                "está disponible únicamente para cuentas de cliente.</p>" +
              '<div class="cv-modal-actions">' +
                '<button type="button" class="btn-cv-primary" data-bs-dismiss="modal">Entendido</button>' +
                '<a href="admin.html" class="btn-cv-outline">Volver al panel de administración</a>' +
              "</div>" +
            "</div>" +
          "</div>" +
        "</div>";
      document.body.appendChild(modal);
    }

    if (window.bootstrap && window.bootstrap.Modal) {
      window.bootstrap.Modal.getOrCreateInstance(modal).show();
    }
  };

  /** Devuelve true (y muestra el modal) si el usuario es ADMIN y debe bloquearse la compra. */
  window.cvAuthBloquearCompra = function () {
    if (window.cvAuthEsAdmin()) {
      window.cvAuthMostrarModalCompra();
      return true;
    }
    return false;
  };

  document.addEventListener("DOMContentLoaded", function () {
    window.cvAuthRenderCuenta();
    window.cvAuthSoloAdmin();
  });

  document.addEventListener("click", function (event) {
    const boton = event.target.closest('[data-auth="logout"]');
    if (boton) window.cvAuthCerrarSesion();

    const enlaceCompra = event.target.closest('a[href^="asientos.html"]');
    if (enlaceCompra && window.cvAuthBloquearCompra()) {
      event.preventDefault();
    }
  });
})();
