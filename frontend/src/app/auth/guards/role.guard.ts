import { inject } from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  map,
  of
} from 'rxjs';

import { AuthService } from '../services/auth.service';


export const ROLE_ACCESS = {

  subscriptions: [1, 2, 3],

  stock: [1, 2],

  users: [1],

  profile: [1, 2, 3]

} as const;


export const roleGuard = (
  allowedRoles: readonly number[]
): CanActivateFn => {

  return () => {

    const authService = inject(AuthService);

    const router = inject(Router);

    const validation$ = authService.isAuthenticated() && authService.currentUser() ? of(true) : authService.checkStatus();

    return validation$.pipe(
      map(isAuthenticated => {

        if (!isAuthenticated) {
          return router.createUrlTree(['/']);
        }

        const user = authService.currentUser();

        if (!user) {
          return router.createUrlTree(['/']);
        }


        if (!allowedRoles.includes(user.role)) {
          return router.createUrlTree(['/user/profile']);
        }
        return true;

      })

    );

  };

};
