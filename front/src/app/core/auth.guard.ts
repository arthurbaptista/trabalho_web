import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Auth } from './auth';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.estaLogado() ? true : router.createUrlTree(['/login']);
};

export const perfilInicialGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.estaLogado()) {
    return router.createUrlTree(['/login']);
  }

  return router.createUrlTree([auth.rotaInicial()]);
};
