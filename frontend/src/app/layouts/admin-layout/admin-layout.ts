import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Cuenta } from '../../shared/cuenta/cuenta';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Cuenta],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin.css']
})
export class AdminLayout {
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
