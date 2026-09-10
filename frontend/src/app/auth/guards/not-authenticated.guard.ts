import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const notAuthenticatedGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.hasStoredToken()) {
    authService.logout();
    return true;
  }

  if (authService.authStatus() === 'authenticated' && authService.currentUser() !== null) {
    return router.createUrlTree(['/user/subs']);
  }

  return authService.checkStatus().pipe(
    map((isAuthenticated) =>
      isAuthenticated
        ? router.createUrlTree(['/user/subs'])
        : true
    )
  );
};
