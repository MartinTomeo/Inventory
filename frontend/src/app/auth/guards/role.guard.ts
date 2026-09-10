import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const ROLE_ACCESS = {
  subscriptions: [1, 2, 3],
  stock: [1, 2],
  logs: [1],
  users: [1],
  profile: [1, 2, 3],
} as const;

export const roleGuard = (allowedRoles: readonly number[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.currentUser();

    if (!user || !allowedRoles.includes(user.role)) {
      authService.logout();
      return router.createUrlTree(['/']);
    }

    return true;
  };
};
