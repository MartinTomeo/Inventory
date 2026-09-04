import { inject } from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';


export const notAuthenticatedGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);


  if (!authService.token()) {
    return true;
  }

  if (authService.authStatus() === 'authenticated') {

    return router.createUrlTree(['/user']);

  }

  return authService.checkStatus()
    .pipe(
      map(isAuthenticated => {
        if (isAuthenticated) return router.createUrlTree(['/user']);
        return true;
      })
    );

};
