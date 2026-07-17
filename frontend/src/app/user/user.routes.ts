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
          import('./admin/page/admin-stock-page/admin-stock-page').then(
            (m) => m.AdminStockPage
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
          import('./admin/page/admin-users-page/admin-users-page').then(
            (m) => m.AdminUsersPage
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
        path: 'profile/info',
        loadComponent: () =>
          import('./profile/pages/profile-info-page/profile-info-page').then(
            (m) => m.ProfileInfoPage,
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
