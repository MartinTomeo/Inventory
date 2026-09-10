import { Routes } from '@angular/router';
import { UserLayout } from './layouts/UserLayout/UserLayout';
import { ROLE_ACCESS, roleGuard } from '../auth/guards/role.guard';

export const userRoutes: Routes = [
  {
    path: '',
    component: UserLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'subs',
      },
      {
        path: 'subs',
        canActivate: [roleGuard(ROLE_ACCESS.subscriptions)],
        loadComponent: () =>
          import('./pages/subscriptions-page/subscriptions-page')
            .then(m => m.SubscriptionsPage),
      },
      {
        path: 'stock',
        canActivate: [roleGuard(ROLE_ACCESS.stock)],
        loadComponent: () =>
          import('./pages/stock-page/stock-page')
            .then(m => m.StockPage),
      },
      {
        path: 'logs',
        canActivate: [roleGuard(ROLE_ACCESS.logs)],
        loadComponent: () =>
          import('./pages/logs-page/logs-page')
            .then(m => m.LogsPage),
      },
      {
        path: 'users',
        canActivate: [roleGuard(ROLE_ACCESS.users)],
        loadComponent: () =>
          import('./pages/users-page/users-page')
            .then(m => m.UsersPage),
      },
      {
        path: 'profile',
        canActivate: [roleGuard(ROLE_ACCESS.profile)],
        loadComponent: () =>
          import('./pages/profile-page/profile-page')
            .then(m => m.ProfilePage),
      },
      {
        path: '**',
        redirectTo: 'subs',
      },
    ],
  },
];
export default userRoutes;
