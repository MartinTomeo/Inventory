import { Routes } from '@angular/router';
import { AdminLayout } from './layouts/AdminLayout/AdminLayout';


export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      {
        path: 'users',
        loadComponent: () =>
          import('./page/admin-users-page/admin-users-page').then((m) => m.AdminUsersPage),
      },
    {
        path: 'inventory',
        loadComponent: () =>
          import('./page/admin-posts-page/admin-inventory-page').then((m) => m.AdminInventoryPage),
      },
      {
        path: '**',
        redirectTo: 'users',
      },
    ],
  },
];
export default adminRoutes;
