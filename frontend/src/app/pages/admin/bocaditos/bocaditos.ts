import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/api.service';
import type { Categoria, Producto } from '../../../core/models';
import { categoriaInfo, centimos, mensajeError, soles } from '../../../core/utils';

@Component({
  selector: 'app-admin-bocaditos',
  imports: [FormsModule, RouterLink],
  templateUrl: './bocaditos.html',
  styleUrls: ['../../../layouts/admin-layout/admin.css']
})
export class AdminBocaditos implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  private pendienteEditar: number | null = null;

  productos: Producto[] = [];
  cargando = true;
  guardando = false;

  mensaje = '';
  mensajeTipo = '';

  editandoId: number | null = null;
  nombre = '';
  categoria: Categoria | '' = '';
  precio: number | null = null;
  activo = true;

  readonly categorias: Categoria[] = ['CANCHITA', 'BEBIDA', 'DULCE', 'COMBO'];

  ngOnInit(): void {
    const raw = this.route.snapshot.queryParamMap.get('editar');
    const id = raw ? Number(raw) : NaN;
    this.pendienteEditar = Number.isInteger(id) && id > 0 ? id : null;
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;

    this.api.listarProductosAdmin().subscribe({
      next: (datos) => {
        this.productos = datos;
        this.cargando = false;
        this.autoEditar();
      },
      error: (err) => {
        this.mostrarMensaje(mensajeError(err, 'No se pudieron obtener los productos.'), 'danger');
        this.cargando = false;
      }
    });
  }

  private autoEditar(): void {
    if (this.pendienteEditar === null) return;

    const producto = this.productos.find((p) => p.id === this.pendienteEditar);
    this.pendienteEditar = null;

    if (producto) this.editar(producto);
  }

  info(categoria: Categoria) {
    return categoriaInfo(categoria);
  }

  precioLabel(producto: Producto): string {
    return soles(centimos(producto.precio));
  }

  guardar(): void {
    if (!this.nombre.trim() || !this.categoria || this.precio === null || Number(this.precio) <= 0) {
      this.mostrarMensaje('Completa todos los campos obligatorios.', 'danger');
      return;
    }

    const datos: Omit<Producto, 'id'> = {
      nombre: this.nombre.trim(),
      categoria: this.categoria,
      precio: Number(this.precio),
      activo: this.activo
    };

    const esEdicion = this.editandoId !== null;

    const peticion = esEdicion
      ? this.api.actualizarProducto(this.editandoId!, datos)
      : this.api.crearProducto(datos);

    this.guardando = true;

    peticion.subscribe({
      next: () => {
        this.mostrarMensaje(esEdicion ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.', 'success');
        this.limpiar();
        this.cargar();
        this.guardando = false;
      },
      error: (err) => {
        this.mostrarMensaje(mensajeError(err, 'No se pudo guardar el producto.'), 'danger');
        this.guardando = false;
      }
    });
  }

  editar(producto: Producto): void {
    this.editandoId = producto.id;
    this.nombre = producto.nombre;
    this.categoria = producto.categoria;
    this.precio = Number(producto.precio);
    this.activo = producto.activo;
    this.mensaje = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(producto: Producto): void {
    if (!confirm(`¿Estás seguro de eliminar el producto "${producto.nombre}"?`)) return;

    this.api.eliminarProducto(producto.id).subscribe({
      next: () => {
        this.mostrarMensaje('Producto eliminado correctamente.', 'success');
        if (this.editandoId === producto.id) this.limpiar();
        this.cargar();
      },
      error: (err) => this.mostrarMensaje(mensajeError(err, 'No se pudo eliminar el producto.'), 'danger')
    });
  }

  limpiar(): void {
    this.editandoId = null;
    this.nombre = '';
    this.categoria = '';
    this.precio = null;
    this.activo = true;
    this.mensaje = '';
  }

  private mostrarMensaje(texto: string, tipo: string): void {
    this.mensaje = texto;
    this.mensajeTipo = tipo;

    setTimeout(() => {
      this.mensaje = '';
    }, 3000);
  }
}
