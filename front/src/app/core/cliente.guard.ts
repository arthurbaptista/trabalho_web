import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Auth } from './auth';

export const clienteGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.estaLogado()) {
    auth.ativarSessaoDemo();
  }

  if (auth.sessao()?.perfil !== 'CLIENTE') {
    return router.createUrlTree([auth.rotaInicial()]);
  }

  return true;
};
