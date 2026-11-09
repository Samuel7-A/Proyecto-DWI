import { Routes } from '@angular/router';

import { PublicLayout } from './layouts/public-layout/public-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

import { Home } from './pages/home/home';
import { Cartelera } from './pages/cartelera/cartelera';
import { Proximamente } from './pages/proximamente/proximamente';
import { Detalle } from './pages/detalle/detalle';
import { Productos } from './pages/productos/productos';
import { Login } from './pages/login/login';
import { Asientos } from './pages/asientos/asientos';
import { Bocaditos } from './pages/bocaditos/bocaditos';
import { Checkout } from './pages/checkout/checkout';
import { Perfil } from './pages/perfil/perfil';
import { MisEntradas } from './pages/mis-entradas/mis-entradas';
import { AdminPeliculas } from './pages/admin/peliculas/peliculas';
import { AdminBocaditos } from './pages/admin/bocaditos/bocaditos';

import { adminGuard, authGuard, compraGuard } from './core/guards';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', component: Home },
      { path: 'cartelera', component: Cartelera },
      { path: 'proximamente', component: Proximamente },
      { path: 'pelicula/:id', component: Detalle },
      { path: 'productos', component: Productos },
      { path: 'asientos/:id', component: Asientos, canActivate: [compraGuard] },
      { path: 'bocaditos', component: Bocaditos, canActivate: [compraGuard] },
      { path: 'checkout', component: Checkout, canActivate: [compraGuard] },
      { path: 'perfil', component: Perfil, canActivate: [authGuard] },
      { path: 'mis-entradas', component: MisEntradas, canActivate: [authGuard] }
    ]
  },
  { path: 'login', component: Login },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      { path: '', component: AdminPeliculas },
      { path: 'bocaditos', component: AdminBocaditos }
    ]
  },
  { path: '**', redirectTo: '' }
];