import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authenticatedGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.hasStoredToken()) {
    authService.logout();
    return router.createUrlTree(['/']);
  }

  // La sesión ya fue validada por login().
  if (authService.authStatus() === 'authenticated' && authService.currentUser() !== null) {
    return true;
  }

  // Se ejecuta al recargar la aplicación con un JWT almacenado.
  return authService.checkStatus().pipe(
    map((isAuthenticated) =>
      isAuthenticated
        ? true
        : router.createUrlTree(['/'])
    )
  );
};
