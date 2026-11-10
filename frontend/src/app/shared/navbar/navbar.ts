import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Cuenta } from '../cuenta/cuenta';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, Cuenta],
  templateUrl: './navbar.html'
})
export class Navbar implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);

  protected readonly noLeidas = signal(0);
  protected navAbierto = false;

  ngOnInit(): void {
    this.refrescarNoLeidas();
  }

  refrescarNoLeidas(): void {
    if (!this.auth.isLoggedIn() || this.auth.isAdmin()) {
      this.noLeidas.set(0);
      return;
    }

    this.api.noLeidas().subscribe({
      next: (n) => this.noLeidas.set(n),
      error: () => this.noLeidas.set(0)
    });
  }

  protected alternarNav(): void {
    this.navAbierto = !this.navAbierto;
  }

  @HostListener('document:click', ['$event'])
  protected cerrarNavAlClicFuera(event: MouseEvent): void {
    if (!this.navAbierto) return;
    const objetivo = event.target as HTMLElement | null;
    if (objetivo && !objetivo.closest('.cv-navbar')) {
      this.navAbierto = false;
    }
  }
}
