import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authenticatedGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  // No hay JWT almacenado.
  if (!authService.hasStoredToken()) {

    authService.invalidateLocalSession();
    return router.createUrlTree(['/']);
  }

  if (authService.hasValidatedSession()) {
    return true;
  }

  return authService.checkStatus().pipe(

    map(isAuthenticated => {

      if (!isAuthenticated) {
        return router.createUrlTree(['/']);
      }

      return true;
    })
  );
};
