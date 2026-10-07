import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.autenticado()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};

export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.autenticado()) {
    return true;
  }

  return router.createUrlTree(['/']);
};

export const rolGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rolesPermitidos = route.data?.['roles'] as string[] | undefined;
  if (!rolesPermitidos || rolesPermitidos.length === 0) {
    return true;
  }

  const rolActual = authService.rolActual();
  const rolEfectivo = authService.rolEfectivo();

  // Superadmin tiene acceso a todo
  if (rolActual === 'superadmin') {
    return true;
  }

  const tieneAcceso =
    (rolActual && rolesPermitidos.includes(rolActual)) ||
    (rolEfectivo && rolesPermitidos.includes(rolEfectivo));

  if (tieneAcceso) {
    return true;
  }

  return router.createUrlTree(['/']);
};

