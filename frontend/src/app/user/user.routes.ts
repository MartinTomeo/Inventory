import { Routes } from '@angular/router';
import { UserLayout } from './layouts/UserLayout/UserLayout';

export const userRoutes: Routes = [
  {
    path: '',
    component: UserLayout,
    children: [
      {
        path: 'subs',
        loadComponent: () =>
          import('./posts/pages/subscriptions-page/subscriptions-page').then(
            (m) => m.SubscriptionsPage
          ),
      },
      {
        path: 'stock',
        loadComponent: () =>
          import('./posts/pages/stock-page/stock-page').then(
            (m) => m.StockPage
          ),
      },
      {
        path: 'logs',
        loadComponent: () =>
          import('./posts/pages/logs-page/logs-page').then(
            (m) => m.LogsPage
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./posts/pages/users-page/users-page').then(
            (m) => m.UsersPage
          ),
      },
      {
        path: 'profile/settings',
        loadComponent: () =>
          import('./profile/pages/profile-setting-page/profile-setting-page').then(
            (m) => m.ProfileSettingPage,
          ),
      },
      {
        path: '**',
        redirectTo: 'subs',
      },
    ],
  },
];
export default userRoutes;
