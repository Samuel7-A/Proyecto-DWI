import { Injectable, effect, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationCountService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly count = signal(0);
  readonly noLeidas = this.count.asReadonly();
  private request?: Subscription;

  constructor() {
    effect((cleanup) => {
      const email = this.auth.email();
      const cliente = this.auth.isLoggedIn() && !this.auth.isAdmin();
      this.count.set(0);
      if (!email || !cliente) return;
      this.refrescar();
      const timer = setInterval(() => this.refrescar(), 30000);
      cleanup(() => { clearInterval(timer); this.request?.unsubscribe(); });
    });
  }

  refrescar(): void {
    this.request?.unsubscribe();
    if (!this.auth.validarSesion() || this.auth.isAdmin()) { this.count.set(0); return; }
    const token = this.auth.token();
    this.request = this.api.noLeidas().subscribe({
      next: n => { if (token === this.auth.token()) this.count.set(n); },
      error: () => { if (token === this.auth.token()) this.count.set(0); }
    });
  }
}
