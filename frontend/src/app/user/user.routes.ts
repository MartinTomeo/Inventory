import { Routes } from '@angular/router';
import { UserLayout } from './layouts/UserLayout/UserLayout';

export const userRoutes: Routes = [
  {
    path: '',
    component: UserLayout,
    children: [
      {
        path: 'latest',
        loadComponent: () =>
          import('./posts/pages/by-latest-page/by-latest-page').then((m) => m.ByLatestPage),
      },
      {
        path: 'publish',
        loadComponent: () =>
          import('./posts/pages/publish-page/publish-page').then((m) => m.PublishPage),
      },
      {
        path: 'logs',
        loadComponent: () => import('./posts/pages/logs-page/logs-page').then((m) => m.LogsPage),
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
        redirectTo: 'latest',
      },
    ],
  },
];
export default userRoutes;
