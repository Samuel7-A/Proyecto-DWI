import { Component, HostListener, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Cuenta } from '../cuenta/cuenta';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, Cuenta],
  templateUrl: './navbar.html'
})
export class Navbar {
  protected navAbierto = false;

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
