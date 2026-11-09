import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected tab: 'login' | 'register' = 'login';

  protected loginEmail = '';
  protected loginPassword = '';
  protected loginMsg = '';
  protected loginTipo: 'error' | 'success' | '' = '';
  protected loginLoading = false;

  protected regNombre = '';
  protected regEmail = '';
  protected regPassword = '';
  protected regMsg = '';
  protected regTipo: 'error' | 'success' | '' = '';
  protected regLoading = false;

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      const dest = this.route.snapshot.queryParamMap.get('redirect');
      if (dest) this.router.navigateByUrl(dest);
    }
  }

  protected cambiarTab(tab: 'login' | 'register'): void {
    this.tab = tab;
    this.loginMsg = '';
    this.regMsg = '';
  }

  protected submitLogin(): void {
    if (!this.loginEmail || !this.loginPassword) {
      this.mostrarMensaje('login', 'Completa todos los campos.', 'error');
      return;
    }

    this.loginLoading = true;
    this.loginMsg = '';

    this.auth.login({ email: this.loginEmail.trim(), password: this.loginPassword }).subscribe({
      next: (res) => {
        this.mostrarMensaje('login', `Bienvenido, ${res.nombre}! Redirigiendo...`, 'success');
        setTimeout(() => this.redirigir(), 800);
      },
      error: (err: HttpErrorResponse) => {
        this.loginLoading = false;
        this.mostrarMensaje('login', this.mensajeDeError(err, 'Correo o contraseña incorrectos.'), 'error');
      }
    });
  }

  protected submitRegister(): void {
    if (!this.regNombre || !this.regEmail || !this.regPassword) {
      this.mostrarMensaje('register', 'Completa todos los campos.', 'error');
      return;
    }

    if (this.regPassword.length < 6) {
      this.mostrarMensaje('register', 'La contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }

    this.regLoading = true;
    this.regMsg = '';

    this.auth
      .register({ nombre: this.regNombre.trim(), email: this.regEmail.trim(), password: this.regPassword })
      .subscribe({
        next: (res) => {
          this.mostrarMensaje('register', `Cuenta creada! Bienvenido, ${res.nombre}. Redirigiendo...`, 'success');
          setTimeout(() => this.redirigir(), 900);
        },
        error: (err: HttpErrorResponse) => {
          this.regLoading = false;
          this.mostrarMensaje('register', this.mensajeDeError(err, 'No se pudo crear la cuenta. Intenta con otro correo.'), 'error');
        }
      });
  }

  private redirigir(): void {
    const dest = this.route.snapshot.queryParamMap.get('redirect');
    this.router.navigateByUrl(dest || '/');
  }

  private mostrarMensaje(panel: 'login' | 'register', texto: string, tipo: 'error' | 'success'): void {
    if (panel === 'login') {
      this.loginMsg = texto;
      this.loginTipo = tipo;
    } else {
      this.regMsg = texto;
      this.regTipo = tipo;
    }
  }

  private mensajeDeError(err: HttpErrorResponse, porDefecto: string): string {
    const data = err.error as { mensaje?: string; error?: string; message?: string } | null;
    if (data && (data.mensaje || data.error || data.message)) {
      return data.mensaje || data.error || data.message || porDefecto;
    }
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que el backend esté activo.';
    }
    return porDefecto;
  }
}
