import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Auth } from './auth';

export const funcionarioGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.estaLogado()) {
    return router.createUrlTree(['/login']);
  }

  if (auth.sessao()?.perfil !== 'FUNCIONARIO') {
    return router.createUrlTree(['/home']);
  }

  return true;
};
