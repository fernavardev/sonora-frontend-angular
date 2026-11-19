import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth';
import { Usuario } from '../models/usuario';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Durante SSR, no evaluar sessionStorage
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const usuario = authService.obtenerUsuarioActual();

  if (!usuario) {
    return router.createUrlTree(['/login']);
  }

  const rolRequerido = route.data['rol'] as Usuario['rol'] | undefined;

  if (rolRequerido && usuario.rol !== rolRequerido) {
    return router.createUrlTree(['/publicaciones']);
  }

  return true;
};
