import { Routes } from '@angular/router';

import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { RecuperarPassword } from './components/recuperar-password/recuperar-password';
import { Publicaciones } from './components/publicaciones/publicaciones';
import { CrearPublicacion } from './components/crear-publicacion/crear-publicacion';
import { Perfil } from './components/perfil/perfil';
import { authGuard } from './guards/auth-guard';
import { DetallePublicacion } from './components/detalle-publicacion/detalle-publicacion';
import { MisPublicaciones } from './components/mis-publicaciones/mis-publicaciones';
import { Categorias } from './components/categorias/categorias';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: 'registro',
    component: Registro
  },
  {
    path: 'recuperar-password',
    component: RecuperarPassword
  },
  {
    path: 'categorias',
    component: Categorias,
    canActivate: [authGuard]
  },
  {
    path: 'publicaciones',
    component: Publicaciones,
    canActivate: [authGuard]
  },
  {
    path: 'mis-publicaciones',
    component: MisPublicaciones,
    canActivate: [authGuard]
  },
  {
    path: 'publicaciones/:id',
    component: DetallePublicacion,
    canActivate: [authGuard]
  },
  {
    path: 'crear-publicacion',
    component: CrearPublicacion,
    canActivate: [authGuard]
  },
  {
    path: 'editar-publicacion/:id',
    component: CrearPublicacion,
    canActivate: [authGuard]
  },
  {
    path: 'perfil',
    component: Perfil,
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
