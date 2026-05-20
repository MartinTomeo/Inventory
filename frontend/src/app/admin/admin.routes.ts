import { Routes } from '@angular/router';
import { AdminLayout } from './layouts/AdminLayout/AdminLayout';
import { AdminSettingsPage } from './page/admin-settings-page/admin-settings-page';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      {
        path: 'settings',
        component: AdminSettingsPage,
      },
      {
        path: '**',
        redirectTo: 'settings',
      },
    ],
  },
];
export default adminRoutes;
