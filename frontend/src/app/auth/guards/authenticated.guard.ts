import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authenticatedGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.token()) {
    return router.createUrlTree(['/']);
  }

  if (authService.authStatus() === 'authenticated') return true;


  return authService.checkStatus()
    .pipe(
      map(isAuthenticated => {
        if (isAuthenticated) return true;
        return router.createUrlTree(['/']);
      })
    );

};
