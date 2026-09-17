import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

import { map } from 'rxjs';

import { AuthService } from '../services/auth.service';


export const authenticatedGuard:
  CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.currentUser()) {
    return true;
  }
  return authService.checkStatus().pipe( map( isAuthenticated => isAuthenticated ? true : router.createUrlTree(['/']) ) );

};
