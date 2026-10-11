"use strict";
// Independiente de auth.js y del checkout de Samuel: solo lectura y selección local.
const PRODUCTOS_API = "http://localhost:8080/api/productos";
const PRODUCTOS_STORAGE = "cineverse_productos_seleccionados";
const seleccion = new Map();
let catalogo = [];
const dinero = valor => `S/ ${Number(valor).toFixed(2)}`;
const iconos = { CANCHITA: "bi-bucket", BEBIDA: "bi-cup-straw", DULCE: "bi-heart", COMBO: "bi-bag" };

function mostrarMensaje(texto) {
  const elemento = document.getElementById("productos-mensaje");
  elemento.textContent = texto;
  elemento.classList.toggle("d-none", !texto);
  elemento.classList.add("alert-danger");
}
function guardar() {
  sessionStorage.setItem(PRODUCTOS_STORAGE, JSON.stringify(
    [...seleccion].map(([productoId, cantidad]) => ({ productoId, cantidad }))
  ));
}
function recuperar() {
  try {
    const datos = JSON.parse(sessionStorage.getItem(PRODUCTOS_STORAGE) || "[]");
    if (Array.isArray(datos)) for (const item of datos) {
      if (Number.isSafeInteger(item.productoId) && Number.isInteger(item.cantidad) && item.cantidad > 0 && item.cantidad <= 99)
        seleccion.set(item.productoId, item.cantidad);
    }
  } catch { sessionStorage.removeItem(PRODUCTOS_STORAGE); }
}
function dibujarSeleccion() {
  const lista = document.getElementById("seleccion-lista");
  lista.replaceChildren();
  let total = 0;
  for (const [id, cantidad] of seleccion) {
    const producto = catalogo.find(p => p.id === id && p.activo === true);
    if (!producto) continue;
    total += Number(producto.precio) * cantidad;
    const fila = document.createElement("div");
    fila.className = "d-flex align-items-center justify-content-between gap-2 my-2";
    const titulo = document.createElement("span");
    titulo.textContent = `${producto.nombre} — ${dinero(producto.precio)}`;
    const cantidadInput = document.createElement("input");
    cantidadInput.type = "number"; cantidadInput.min = "1"; cantidadInput.max = "99";
    cantidadInput.value = cantidad; cantidadInput.className = "form-control form-control-sm cv-cantidad";
    cantidadInput.setAttribute("aria-label", `Cantidad de ${producto.nombre}`);
    cantidadInput.addEventListener("change", () => {
      const valor = Number(cantidadInput.value);
      if (!Number.isInteger(valor) || valor < 1 || valor > 99) { cantidadInput.value = seleccion.get(id); return; }
      seleccion.set(id, valor); guardar(); dibujarSeleccion();
    });
    const quitar = document.createElement("button");
    quitar.className = "btn btn-sm btn-outline-danger"; quitar.textContent = "Quitar";
    quitar.addEventListener("click", () => { seleccion.delete(id); guardar(); dibujarSeleccion(); });
    fila.append(titulo, cantidadInput, quitar); lista.append(fila);
  }
  if (!lista.children.length) lista.textContent = "Aún no has seleccionado productos.";
  document.getElementById("seleccion-total").textContent = dinero(total);
}
function dibujarCatalogo() {
  const grid = document.getElementById("productos-grid"); grid.replaceChildren();
  if (!catalogo.length) { grid.textContent = "No hay productos disponibles por ahora."; return; }
  for (const producto of catalogo) {
    const columna = document.createElement("div"); columna.className = "col";
    const tarjeta = document.createElement("article"); tarjeta.className = "cv-producto";
    const icono = document.createElement("i"); icono.className = `bi ${iconos[producto.categoria] || "bi-box"} cv-producto-icono`;
    icono.setAttribute("aria-hidden", "true");
    const titulo = document.createElement("h3"); titulo.textContent = producto.nombre;
    const categoria = document.createElement("p"); categoria.className = "categoria"; categoria.textContent = producto.categoria;
    const precio = document.createElement("p"); precio.className = "precio"; precio.textContent = dinero(producto.precio);
    const boton = document.createElement("button"); boton.className = "btn btn-danger w-100"; boton.textContent = "Seleccionar";
    boton.addEventListener("click", () => {
      const actual = seleccion.get(producto.id) || 0;
      if (actual >= 99) return;
      seleccion.set(producto.id, actual + 1); guardar(); dibujarSeleccion();
    });
    tarjeta.append(icono, titulo, categoria, precio, boton); columna.append(tarjeta); grid.append(columna);
  }
}
async function cargarProductos() {
  try {
    const respuesta = await fetch(PRODUCTOS_API, { headers: { Accept: "application/json" } });
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    const datos = await respuesta.json();
    if (!Array.isArray(datos)) throw new Error("Respuesta inválida");
    catalogo = datos.filter(p => p.activo === true);
    for (const id of seleccion.keys()) if (!catalogo.some(p => p.id === id)) seleccion.delete(id);
    guardar(); mostrarMensaje(""); dibujarCatalogo(); dibujarSeleccion();
  } catch (error) { mostrarMensaje("No se pudo cargar el catálogo. Comprueba que el backend esté iniciado y que GET /api/productos sea público."); console.error(error); }
}
document.getElementById("limpiar-seleccion").addEventListener("click", () => { seleccion.clear(); guardar(); dibujarSeleccion(); });
recuperar(); cargarProductos();
